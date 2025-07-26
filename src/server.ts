/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { connectRedis } from "./app/config/redis.config";

let server: Server;

const bootStrap = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("✅ Connected to DB");
    server = app.listen(envVars.PORT, () => {
      console.log(`✅ Server in running or prot ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

//IIFE
(async () => {
  await connectRedis();
  await bootStrap();
  await seedSuperAdmin();
})();

//unhandled rejection error
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection detected .. Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
// uncaught rejection error
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception detected .. Server shutting down..", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// signal termination or sigterm
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received.. Server shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received.. Server shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Promise.reject(new Error("Forgot to catch this error")); //unhandled rejection error

// throw new Error("local handlej"); //uncaught rejection error

/**
 * ------ Error Handle ------
 *
 *  unhandled rejection error
 *  uncaught rejection error
 *  signal termination or sigterm// server jekhne host okra like aws/gcloud/digital ocean tara kisokkhon er jonno server off korar jonno signal pathai, ta gracefully handle korar jonnno use kora SIGTERM and SIGINT hoche developer ra jokhon gracefully ctrl+c die shutdown dei tokon use oi
 *
 *
 * */
