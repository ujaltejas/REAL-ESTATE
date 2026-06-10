import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dcxu367zg",
  api_key: "192186788824314",
  api_secret: "dR_xSMM5OE_R_OA_zsCs49hYT98",
});

const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    fs.unlinkSync(file);
    return result.secure_url;
  } catch (error) {
    console.log("error in cloudinary", error);
    fs.unlinkSync(file);
  }
};

export default uploadImage;

// import { v2 as cloudinary } from "cloudinary";

// (async function () {
//   // Configuration
//   cloudinary.config({
//     cloud_name: "dcxu367zg",
//     api_key: "192186788824314",
//     api_secret: "<your_api_secret>", // Click 'View API Keys' above to copy your API secret
//   });

//   // Upload an image
//   const uploadResult = await cloudinary.uploader
//     .upload(
//       "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//       {
//         public_id: "shoes",
//       }
//     )
//     .catch((error) => {
//       console.log(error);
//     });

//   console.log(uploadResult);

//   // Optimize delivery by resizing and applying auto-format and auto-quality
//   const optimizeUrl = cloudinary.url("shoes", {
//     fetch_format: "auto",
//     quality: "auto",
//   });

//   console.log(optimizeUrl);

//   // Transform the image: auto-crop to square aspect_ratio
//   const autoCropUrl = cloudinary.url("shoes", {
//     crop: "auto",
//     gravity: "auto",
//     width: 500,
//     height: 500,
//   });

//   console.log(autoCropUrl);
// })();
