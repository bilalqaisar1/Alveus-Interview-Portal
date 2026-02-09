import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized login again" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Try finding a user first
        let user = await User.findById(decodedToken.id).select("-password");
        if (user) {
            req.userData = user;
            return next();
        }

        // If not a user, try finding a company
        let company = await Company.findById(decodedToken.id).select("-password");
        if (company) {
            req.companyData = company;
            return next();
        }

        return res.status(404).json({ success: false, message: "Account not found" });

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized login again" });
    }
};

export default authMiddleware;
