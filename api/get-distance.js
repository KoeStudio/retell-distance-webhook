import axios from "axios";

export default async function handler(req, res) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const destination = req.query.destination || req.body?.destination || "Gandía";

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: "API Key no configurada" });
  }

  if (!destination) {
    return res.status(400).json({ error: "Destino no proporcionado" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Valencia,Spain&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    const elemento = response.data.rows[0].elements[0];

    if (!elemento || !elemento.distance) {
      return res.status(404).json({ error: "Distancia no encontrada" });
    }

    const distanciaKm = elemento.distance.value / 1000;
    let precio = 600;
    if (distanciaKm <= 40) precio = 400;
    else if (distanciaKm <= 80) precio = 500;
    else if (distanciaKm <= 150) precio = 550;

    res.status(200).json({
      localidad: destination,
      distanciaKm: Math.round(distanciaKm),
      precio,
      mensaje: `La distancia hasta ${destination} es de ${Math.round(distanciaKm)} km. El precio sería ${precio} €.`
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al consultar la API de Google Maps" });
  }
}
