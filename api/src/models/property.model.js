import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["house", "apartment", "commercial"],
    },
    status: {
      type: String,
      required: true,
      enum: ["for-sale", "for-rent", "sold", "rented"],
      default: "for-sale",
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    features: {
      bedrooms: Number,
      bathrooms: Number,
      area: Number,
      parking: Number,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
