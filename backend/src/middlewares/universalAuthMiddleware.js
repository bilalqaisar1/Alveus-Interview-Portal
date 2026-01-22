import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

const universalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized login again" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Try finding in User first
        let user = await User.findById(decodedToken.id).select("-password");
        if (user) {
            req.userData = user;
            req.userType = "user";
            return next();
        }

        // Try finding in Company
        let company = await Company.findById(decodedToken.id).select("-password");
        if (company) {
            req.companyData = company;
            req.userType = "company";
            return next();
        }

        return res.status(404).json({ message: "Identity not found" });

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized login again" });
    }
};

export default universalAuthMiddleware;
