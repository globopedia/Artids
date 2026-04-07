export default async function handler(req, res) {
  const url = "https://raw.githubusercontent.com/globopedia/Rivales-Huracan/main/clubes.csv";

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos" });
  }
}
