import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import uploadImage from "../utils/cloudinary.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create a new property with image uploads
export const createProperty = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      status, 
      price, 
      address, 
      city, 
      state, 
      lat, 
      lng, 
      bedrooms, 
      bathrooms, 
      area, 
      parking 
    } = req.body;

    // Check property limit for regular users
    if (req.user.role === "user") {
      const userProperties = await Property.countDocuments({ owner: req.user.id });
      if (userProperties >= 5) {
        return res.status(403).json({ 
          success: false, 
          message: "Regular users can only add up to 5 properties. Please upgrade to agent role for unlimited properties." 
        });
      }
    }

    // Validate required fields
    if (!title || !description || !type || !price || !address || !city || !state) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Handle image uploads
    const imageFiles = req.files;
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Upload images to Cloudinary
    const imagePromises = imageFiles.map(file => uploadImage(file.path));
    const imageUrls = await Promise.all(imagePromises);

    // Format images for database
    const images = imageUrls.map(url => ({
      url,
      public_id: url.split('/').pop().split('.')[0]
    }));

    // Create property object
    const newProperty = new Property({
      title,
      description,
      type,
      status: status || "for-sale",
      price: Number(price),
      location: {
        address,
        city,
        state,
        coordinates: {
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null
        }
      },
      features: {
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        area: area ? Number(area) : null,
        parking: parking ? Number(parking) : null
      },
      images,
      owner: req.user.id
    });

    // Save property to database
    const savedProperty = await newProperty.save();

    // Add property to user's listings
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { listings: savedProperty._id } }
    );

    res.status(201).json({
      success: true,
      property: savedProperty
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating property", 
      error: error.message 
    });
  }
};

// Get all properties with filtering
export const getAllProperties = async (req, res) => {
  try {
    const { 
      type, 
      status, 
      city, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      bathrooms,
      sort = "-createdAt" 
    } = req.query;
    
    // Build query
    let query = {};

    // Apply filters if provided
    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query["location.city"] = new RegExp(city, "i");
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Features
    if (bedrooms) query["features.bedrooms"] = { $gte: Number(bedrooms) };
    if (bathrooms) query["features.bathrooms"] = { $gte: Number(bathrooms) };

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
      .populate("owner", "username email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      properties
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching properties", 
      error: error.message 
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "username email avatar role");

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    
    // Check if error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error fetching property", 
      error: error.message 
    });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    
    // Find property
    let property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }
    
    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update this property" 
      });
    }
    
    // Handle image uploads if any
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => uploadImage(file.path));
      const imageUrls = await Promise.all(imagePromises);
      
      newImages = imageUrls.map(url => ({
        url,
        public_id: url.split('/').pop().split('.')[0]
      }));
    }
    
    // Handle removed images
    let currentImages = [...property.images];
    if (req.body.removedImages) {
      const removedImageIds = JSON.parse(req.body.removedImages);
      currentImages = currentImages.filter(img => !removedImageIds.includes(img._id.toString()));
    }
    
    // Prepare update data
    const updateData = {
      ...req.body
    };
    
    // Handle nested objects
    if (req.body.address || req.body.city || req.body.state || req.body.lat || req.body.lng) {
      updateData.location = {
        ...property.location,
        address: req.body.address || property.location.address,
        city: req.body.city || property.location.city,
        state: req.body.state || property.location.state
      };
      
      if (req.body.lat || req.body.lng) {
        updateData.location.coordinates = {
          lat: req.body.lat ? Number(req.body.lat) : property.location.coordinates.lat,
          lng: req.body.lng ? Number(req.body.lng) : property.location.coordinates.lng
        };
      }
    }
    
    // Handle features
    if (req.body.bedrooms || req.body.bathrooms || req.body.area || req.body.parking) {
      updateData.features = {
        ...property.features,
        bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : property.features.bedrooms,
        bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : property.features.bathrooms,
        area: req.body.area ? Number(req.body.area) : property.features.area,
        parking: req.body.parking ? Number(req.body.parking) : property.features.parking
      };
    }
    
    // Update images array
    updateData.images = [...currentImages, ...newImages];
    
    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updateData,
      { new: true, runValidators: true }
    ).populate("owner", "username email avatar");
    
    res.status(200).json({
      success: true,
      property: updatedProperty
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating property", 
      error: error.message 
    });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    
    // Find property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }
    
    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this property" 
      });
    }
    
    // Remove property from user's listings
    await User.findByIdAndUpdate(
      property.owner,
      { $pull: { listings: propertyId } }
    );
    
    // Delete property
    await Property.findByIdAndDelete(propertyId);
    
    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting property", 
      error: error.message 
    });
  }
};

// Get user's properties
export const getUserProperties = async (req, res) => {
  try {
    // Check for userId in both params and query to support both approaches
    const userId = req.params.userId || req.query.userId || req.user.id;
    
    const properties = await Property.find({ owner: userId })
      .sort("-createdAt");
    
    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error("Error fetching user properties:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user properties", 
      error: error.message 
    });
  }
};

// Add/remove property image
export const managePropertyImages = async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { action } = req.query; // 'add' or 'remove'
    
    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid action. Use 'add' or 'remove'" 
      });
    }
    
    // Find property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }
    
    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to modify this property" 
      });
    }
    
    if (action === 'add') {
      // Add new images
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No images provided" 
        });
      }
      
      // Upload images to Cloudinary
      const imagePromises = req.files.map(file => uploadImage(file.path));
      const imageUrls = await Promise.all(imagePromises);
      
      // Format images for database
      const newImages = imageUrls.map(url => ({
        url,
        public_id: url.split('/').pop().split('.')[0]
      }));
      
      // Update property with new images
      const updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { $push: { images: { $each: newImages } } },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        message: "Images added successfully",
        property: updatedProperty
      });
    } else {
      // Remove image
      const { imageId } = req.body;
      
      if (!imageId) {
        return res.status(400).json({ 
          success: false, 
          message: "Image ID is required" 
        });
      }
      
      // Update property by removing the image
      const updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { $pull: { images: { public_id: imageId } } },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        message: "Image removed successfully",
        property: updatedProperty
      });
    }
  } catch (error) {
    console.error("Error managing property images:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error managing property images", 
      error: error.message 
    });
  }
};

// Contact property owner
export const contactPropertyOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, message } = req.body;

    console.log(req.body);

    // Find property and populate owner details
    const property = await Property.findById(id).populate("owner", "email username");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: property.owner.email,
      subject: `New Interest in Your Property: ${property.title}`,
      html: `
        <h2>Someone is interested in your property!</h2>
        <h3>Property Details:</h3>
        <p><strong>Title:</strong> ${property.title}</p>
        <p><strong>Location:</strong> ${property.location.address}, ${property.location.city}, ${property.location.state}</p>
        
        <h3>Interested Party Details:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        
        <h3>Message:</h3>
        <p>${message}</p>
        
        <p>You can reply directly to this email to contact the interested party.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully to the property owner"
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message
    });
  }
};