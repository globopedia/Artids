// Puente de imágenes: trae fotos alojadas en Blogger o Google Drive y las
// devuelve con permiso para que las páginas de Globopedia les dibujen la
// marca de agua (el navegador no deja "pintar" sobre imágenes de otro sitio
// si ese sitio no lo autoriza). Solo atiende pedidos desde Globopedia y solo
// trae imágenes de esos servidores de Google.
const ORIGENES_PERMITIDOS = [
  "https://globopedia.github.io",
  "https://www.globopedia.ar",
  "https://globopedia.ar",
  "https://globopedia.blogspot.com",
  "https://artids.vercel.app"
];
const SERVIDORES_PERMITIDOS = /^(blogger\.googleusercontent\.com|lh\d\.googleusercontent\.com|drive\.google\.com|drive\.usercontent\.google\.com|\d\.bp\.blogspot\.com)$/i;

export default async function handler(req, res) {
  const origen = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (!origen || !ORIGENES_PERMITIDOS.includes(origen)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(403).send("Acceso no permitido");
  }
  res.setHeader("Access-Control-Allow-Origin", origen);

  let destino;
  try { destino = new URL(req.query.u || ""); } catch (e) { return res.status(400).send("Dirección no válida"); }
  if (destino.protocol !== "https:" || !SERVIDORES_PERMITIDOS.test(destino.hostname)) {
    return res.status(400).send("Servidor no permitido");
  }

  try {
    const r = await fetch(destino.toString(), { redirect: "follow" });
    const tipo = r.headers.get("content-type") || "";
    if (!r.ok || !tipo.startsWith("image/")) return res.status(502).send("No es una imagen");
    const datos = Buffer.from(await r.arrayBuffer());
    // Se guarda un día en la red de Vercel (y una semana más mientras se renueva).
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("Content-Type", tipo);
    return res.status(200).send(datos);
  } catch (e) {
    return res.status(500).send("Error interno");
  }
}
