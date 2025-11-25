import jwt from "jsonwebtoken";

const generateToken = (userData) => {
  return jwt.sign({ id: userData._id, name: userData.name, email: userData.email, role: userData.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
