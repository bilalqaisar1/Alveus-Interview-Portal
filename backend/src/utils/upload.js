import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), "uploads", "temp");

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const fileName = `upload-${timestamp}${fileExtension}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

export default upload;
