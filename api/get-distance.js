const axios = require("axios");

module.exports = async (req, res) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const destination = req.body.destination || req.query.destination;

  if (!destination) {
    return res.status(400).json({ error: "Destino no proporcionado" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Valencia,Spain&destinations=${encodeURIComponent(
      destination
    )}&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    const elemento = response.data.rows[0].elements[0];

    if (!elemento.distance) {
      return res.status(404).json({ error: "Distancia no encontrada" });
    }

    const distanciaKm = elemento.distance.value / 1000;
    let precio = 600;
    if (distanciaKm <= 40) precio = 400;
    else if (distanciaKm <= 80) precio = 500;
    else if (distanciaKm <= 150) precio = 550;

    res.json({
      localidad: destination,
      distanciaKm: Math.round(distanciaKm),
      precio,
      mensaje: `La distancia hasta ${destination} es de ${Math.round(
        distanciaKm
      )} km. El precio sería ${precio} €.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar Google Maps" });
  }
};
