import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties,
  managePropertyImages,
  contactPropertyOwner,
} from "../controllers/property.controller.js";


const router = express.Router();

// Get all properties with filters
router.get("/", getAllProperties);

// Get user's properties - specific route must come before parameterized routes
router.get("/user", protect, getUserProperties);
router.get("/user/:userId", protect, getUserProperties);

// Get single property
router.get("/:id", getPropertyById);

// Create property with image upload
router.post("/", protect, upload.array("images", 10), createProperty);

// Update property
router.put("/:id", protect, upload.array("images", 10), updateProperty);

// Delete property
router.delete("/:id", protect, deleteProperty);

// Manage property images (add/remove)
router.patch("/:id/images", protect, upload.array("images", 10), managePropertyImages);

// Contact property owner
router.post("/:id/contact", contactPropertyOwner);



// Get all properties for admin
// router.get("/test",(req,res)=>{
//     console.log("router works!")
// });
// router.post("/test",(req,res)=>{
//     console.log("router works!")
// });
// router.put("/test",(req,res)=>{
//     console.log("router works!")
// });
// router.delete("/test",(req,res)=>{
//     console.log("router works!")
// });

export default router;
