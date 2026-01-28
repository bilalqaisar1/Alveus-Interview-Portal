import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

const companyAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token;
    console.log("MiddleWare received token:", token);

    if (!token) {
      console.log("No token found in headers");
      return res.status(401).json({ message: "Unauthorized login again" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decodedToken);

    const company = await Company.findById(decodedToken.id).select("-password");

    if (!company) {
      console.log("Company not found for id:", decodedToken.id);
      return res.status(404).json({ message: "User not found" });
    }

    req.companyData = company;

    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized login again" });
  }
};

export default companyAuthMiddleware;
