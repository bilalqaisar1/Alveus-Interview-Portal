import fs from "fs";
import { PDFParse } from "pdf-parse";
import path from "path";

/**
 * Extracts text from a PDF file.
 * @param {string} relativePath - Path relative to the backend directory (e.g., /uploads/resumes/...)
 * @returns {Promise<string>} - Extracted text or empty string on error.
 */
export const extractTextFromPDF = async (relativePath) => {
    try {
        // Resolve absolute path. relativePath starts with /uploads/...
        // We need to remove the leading slash and join with process.cwd()
        const absolutePath = path.join(process.cwd(), relativePath.startsWith('/') ? relativePath.substring(1) : relativePath);

        if (!fs.existsSync(absolutePath)) {
            console.error(`PDF File not found at: ${absolutePath}`);
            return "Resume file not found.";
        }

        const dataBuffer = fs.readFileSync(absolutePath);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();

        return result.text.replace(/\n\s*\n/g, '\n').trim(); // Clean up extra newlines
    } catch (error) {
        console.error("PDF Parsing Error:", error.message);
        return `Failed to extract text: ${error.message}`;
    }
};
