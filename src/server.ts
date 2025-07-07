import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

let server: Server;

const bootStrap = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://L2firstTodoWithExpress:lUOIN3OiXl6rSacd@cluster0.v7fwagz.mongodb.net/ph-tour-db?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to DB");
    server = app.listen(5000, () => {
      console.log("✅ Server in running or prot 5000");
    });
  } catch (error) {
    console.log(error);
  }
};

bootStrap();
