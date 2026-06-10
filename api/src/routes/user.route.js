import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { updateUserProfile } from "../controllers/auth.controller.js";
import { getUserProfile } from "../controllers/auth.controller.js";
import { getAllUsers, deleteUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Profile routes
router.put("/profile", protect, upload.single("image"), updateUserProfile);
router.get("/profile", protect, getUserProfile);

// Admin routes
router.get("/all", protect, getAllUsers);
router.delete("/:id", protect, deleteUser);

export default router;
