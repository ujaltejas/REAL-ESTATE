import jwt from "jsonwebtoken";

const generateToken = (id, role, res) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side access
    secure: true, // Ensures HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
  });
};

export default generateToken;
