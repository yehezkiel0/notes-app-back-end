require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const routes = require("./routes");

const init = async () => {
  // Database connection
  const mongoUri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(mongoUri);
    console.log("Terhubung ke MongoDB");
  } catch (err) {
    console.error("Gagal terhubung ke MongoDB:", err);
  }

  const server = Hapi.Server({
    port: 5000,
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
      files: {
        relativeTo: path.join(__dirname, ".."),
      },
    },
  });

  // Register plugins
  await server.register([Inert, Vision]);

  // Serve static files from uploads directory
  server.route({
    method: "GET",
    path: "/uploads/{param*}",
    handler: {
      directory: {
        path: path.join(__dirname, "..", "uploads"),
        listing: false,
      },
    },
  });

  server.route(routes);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
