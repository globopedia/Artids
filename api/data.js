export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const file = req.query.file;

  const archivos = {
    lubs: { repo: "Lubs", path: "Ivals.csv" },
    utbolistsa: { repo: "Lubs", path: "Utbolistsa.csv" },
    utbolistse: { repo: "Lubs", path: "Utbolistse.csv" },
    utbolistso: { repo: "Lubs", path: "Utbolistso.csv" },
    orneos: { repo: "Lubs", path: "Orneos.csv" },
    rbits: { repo: "Lubs", path: "Rbits.csv" },
    ankg: { repo: "Artids", path: "Ankg.csv" },
    artids1910: { repo: "Artids", path: "Artids1910.csv" },
    artids1925: { repo: "Artids", path: "Artids1925.csv" },
    artids1940: { repo: "Artids", path: "Artids1940.csv" },
    artids1955: { repo: "Artids", path: "Artids1955.csv" },
    artids1970: { repo: "Artids", path: "Artids1970.csv" },
    artids1985: { repo: "Artids", path: "Artids1985.csv" },
    artids2000: { repo: "Artids", path: "Artids2000.csv" },
    artids2015: { repo: "Artids", path: "Artids2015.csv" }
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

    const data = await response.text();

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
