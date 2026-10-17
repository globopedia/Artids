// Solo las páginas de Globopedia pueden pedir datos. Un pedido desde otro
// sitio, o directo desde la barra del navegador / un programa de descarga
// (que no manda "Origin"), recibe un 403.
const ORIGENES_PERMITIDOS = [
  "https://globopedia.github.io",
  "https://www.globopedia.ar",
  "https://globopedia.ar",
  "https://globopedia.blogspot.com",
  "https://artids.vercel.app"
];

export default async function handler(req, res) {
  const origen = req.headers.origin;
  // La caché de Vercel guarda una copia distinta por cada origen, así un
  // pedido sin origen válido nunca recibe la copia guardada de otro.
  res.setHeader("Vary", "Origin");
  if (!origen || !ORIGENES_PERMITIDOS.includes(origen)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(403).send("Acceso no permitido");
  }
  res.setHeader("Access-Control-Allow-Origin", origen);
  const file = req.query.file;

  const archivos = {
    lubs: { repo: "Lubs", path: "Ivals.csv" },
    utbolistsa: { repo: "Lubs", path: "UtbolistsA.csv" },
    utbolistse: { repo: "Lubs", path: "UtbolistsE.csv" },
    utbolistso: { repo: "Lubs", path: "UtbolistsO.csv" },
    orneos: { repo: "Lubs", path: "Orneos.csv" },
    rbits: { repo: "Lubs", path: "Rbits.csv" },
    efemerides: { repo: "Lubs", path: "Efemerides.csv" },
    personajes: { repo: "Lubs", path: "Personajes.csv" },
    ecnics: { repo: "Lubs", path: "Ecnics.csv" },
    stads: { repo: "Lubs", path: "Stads.csv" },
    ankg: { repo: "Artids", path: "Ankg.csv" },
    artids1910: { repo: "Lubs", path: "Artids1910.csv" },
    artids1925: { repo: "Lubs", path: "Artids1925.csv" },
    artids1940: { repo: "Lubs", path: "Artids1940.csv" },
    artids1955: { repo: "Lubs", path: "Artids1955.csv" },
    artids1970: { repo: "Lubs", path: "Artids1970.csv" },
    artids1985: { repo: "Lubs", path: "Artids1985.csv" },
    artids2000: { repo: "Lubs", path: "Artids2000.csv" },
    artids2015: { repo: "Lubs", path: "Artids2015.csv" }
  };

  if (!archivos[file]) {
    return res.status(400).send("Archivo no válido");
  }

  const { repo, path } = archivos[file];

  const url = `https://raw.githubusercontent.com/globopedia/${repo}/main/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("No se pudo acceder al archivo");
    }

    let data = await response.text();

    // Partidos todavía no jugados (próximo rival): se cargan en el CSV sin
    // resultado y con fecha de hoy en adelante. Solo los pide la página de
    // inicio (con "&proximos=1"); al resto de las páginas no se les mandan,
    // así no aparecen como partidos jugados en Rivales, Torneos, etc.
    if (/^artids/.test(file) && req.query.proximos !== "1") data = sinPartidosPendientes(data);

    // Caché: la respuesta se guarda en la red de Vercel y se reutiliza para
    // TODOS los visitantes durante 5 minutos ("fresca"), y hasta 1 hora más
    // sirviendo la versión guardada mientras se actualiza en segundo plano
    // ("stale-while-revalidate") — así la función y el pedido a GitHub solo
    // se disparan de verdad una vez cada tanto, no en cada visita de cada
    // persona a cada página. Ojo: esto va SOLO acá, en la respuesta
    // exitosa — si el pedido a GitHub falla, no queremos guardar ese error
    // en caché y servírselo a todo el mundo durante horas.
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("Error interno");
  }
}

// Fecha de hoy en Argentina como número AAAAMMDD.
function hoyArgentina() {
  const d = new Date(Date.now() - 3 * 3600 * 1000);
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

// Primeros campos de una línea CSV (respeta comillas).
function camposIniciales(linea, cuantos) {
  const out = []; let campo = "", comillas = false;
  for (let i = 0; i < linea.length && out.length < cuantos; i++) {
    const c = linea[i];
    if (c === '"') { if (comillas && linea[i + 1] === '"') { campo += '"'; i++; } else comillas = !comillas; }
    else if (c === "," && !comillas) { out.push(campo); campo = ""; }
    else campo += c;
  }
  if (out.length < cuantos) out.push(campo);
  return out;
}

// Saca las filas con fecha futura, y las de hoy que todavía no tienen resultado.
function sinPartidosPendientes(texto) {
  const hoy = hoyArgentina();
  const salto = texto.includes("\r\n") ? "\r\n" : "\n";
  return texto.split(/\r?\n/).filter((linea, i) => {
    if (i === 0 || !linea.trim()) return true;
    const m = linea.match(/^(\d{2})\/(\d{2})\/(\d{4}),/);
    if (!m) return true;
    const fecha = +m[3] * 10000 + +m[2] * 100 + +m[1];
    if (fecha > hoy) return false;
    if (fecha === hoy) {
      const sit = (camposIniciales(linea, 4)[3] || "").trim().toLowerCase();
      if (!["victoria", "empate", "derrota"].includes(sit)) return false;
    }
    return true;
  }).join(salto);
}
