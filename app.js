const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feedRoute");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // header: application/json

// This middleware removes the CORS error
// CORS = cross orign resource sharing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.listen(8080, () => {
  console.log("🎵 server is running on port 8080 🎵");
});
