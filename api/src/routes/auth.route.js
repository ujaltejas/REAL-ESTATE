import express from "express";
import {
  login,
  logout,
  register,
  getUserProfile,
  // checkEmai,
} from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.post("/logout", protect, logout);
// router.post("/check-email", checkEmail);

export default router;
