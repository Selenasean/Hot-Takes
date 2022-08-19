const express = require("express");
const mongoose = require("mongoose");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");
const path = require("path");

/**
 * Connects database and application
 */
mongoose
  .connect(
    "mongodb+srv://Nalese:011192@clusterpiiquante.3e4dwil.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

/**
 * Add headers to all kind of request
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json()); // Provides the body of the request

app.use("/images", express.static(path.join(__dirname, "images"))); // stockage of the images
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
