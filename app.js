const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
const feedRoutes = require("./routes/feedRoute");
const authRoutes = require("./routes/authRoute");
const { v4: uuidv4 } = require("uuid");
// const socketIo = require("socket.io");

dotenv.config({
  path: "./config.env",
});

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${new Date().toISOString}-${file.originalname}`);
//   },
// });

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // header: application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));
// app.use(express.static(path.join(__dirname, "images")));

// This middleware removes the CORS error
// CORS = cross orign resource sharing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(process.env.DATABASE)
  .then((result) => {
    const server = app.listen(8080, () => {
      console.log("🎵 server is running on port 8080 🎵");
    });
    // SOCKETIO - initialize the websocket server
    // const io = socketIo(server);
    const io = require("./socket").init(server);
    //   , {
    //   cors: {
    //     origin: "http://localhost:3000",
    //     methods: ["GET", "POST"],
    //   },
    // });
    io.on("connection", (socket) => {
      console.log("Client connected.");
    });
  })
  .catch((err) => {
    console.log(err);
  });
