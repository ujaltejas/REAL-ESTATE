import app from "./app.js";
import connectDB from "./DB/connectDB.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
