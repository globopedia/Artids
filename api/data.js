export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const file = req.query.file;

  const archivos = {
    lubs: { repo: "Lubs", path: "Ivals.csv" },
    utbolists: { repo: "Utbolists", path: "Utbolists.csv" },
    rbits: { repo: "Artids", path: "Rbits.csv" },
    ankg: { repo: "Artids", path: "Ankg.csv" },
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

    const encoded = Buffer.from(data).toString("base64");

    res.status(200).send(encoded);
  } catch (error) {
    res.status(500).send("Error interno");
  }
}
