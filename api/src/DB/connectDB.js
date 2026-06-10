import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const res = await mongoose.connect("mongodb://localhost:27017");
    console.log("connected to DB" + res.connection.name);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
