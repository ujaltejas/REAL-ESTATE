// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// export const protect = async (req, res, next) => {
//   let token = req.headers.authorization || req.header("x-auth-token");

//   if (token && token.startsWith("Bearer ")) {
//     token = token.split(" ")[1];
//   } else if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "default_secret"
//     );

//     // Attach user data (excluding password) to request object
//     req.user = await User.findById(decoded.id).select("-password");

//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ message: "Token expired, please login again" });
//     }
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Correct ES Module Export
// export default protect;

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.log("error in auth middleware", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;
