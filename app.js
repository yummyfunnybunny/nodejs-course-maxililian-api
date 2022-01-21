const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { graphqlHTTP } = require("express-graphql"); // GRAPHQL
const graphqlSchema = require("./graphql/schema"); // GRAPHQL
const graphqlResolver = require("./graphql/resolvers"); // GRAPHQL
const auth = require("./middleware/auth");
const { clearImage } = require("./util/file");

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
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not Authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({
      message: "No file provided.",
    });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({
    message: "File stored successfully",
    filePath: req.file.path.replace("\\", "/"),
  });
});

// GRAPHQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver, // place your resolver controller as the 'rootValue'
    graphiql: true, // enables a nice testing tool in the browser (http://localhost:8080/graphql)
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
      //return err; // this returns the default format
    },
  })
);

// ERRORS
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

// MONGOOSE
mongoose
  .connect(process.env.DATABASE)
  .then((result) => {
    app.listen(8080, () => {
      console.log("🎵 server is running on port 8080 🎵");
    });
  })
  .catch((err) => {
    console.log(err);
  });
