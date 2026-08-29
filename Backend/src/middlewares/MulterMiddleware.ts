import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { HttpException } from "@/exceptions/HttpException";

interface RequestWithApiGateway extends Request {
  isApiGateway?: boolean;
  files?: Express.Multer.File[];
}

// Ensure the uploads directory exists
const uploadDir = "leaves/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage (temporary local storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Initialize Multer
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
}).array("files", 10); // Allow up to 10 files

/**
 * Enhanced middleware to handle multiple file uploads from both direct calls and API Gateway
 */
const multerMiddleware = (req: RequestWithApiGateway, res: Response, next: NextFunction) => {
    console.log('Multer middleware called');
    console.log('Request details:', {
        isApiGateway: req.isApiGateway,
        hasFiles: !!(req.files && req.files.length > 0),
        contentType: req.headers['content-type'],
        method: req.method,
        url: req.url
    });

    // If files were already processed by API Gateway middleware, skip multer
    if (req.isApiGateway && req.files && req.files.length > 0) {
        console.log(`Using API Gateway processed files: ${req.files.length} files`);
        return next();
    }

    // Use multer for direct uploads (not through API Gateway)
    console.log('Using multer for file processing...');
    upload(req, res, (error: any) => {
        if (error instanceof multer.MulterError) {
            console.error('Multer error:', error);
            return next(new HttpException(400, `Multer error: ${error.message}`));
        } else if (error) {
            console.error('Upload error:', error);
            return next(new HttpException(400, `Error uploading files: ${error.message}`));
        }

        console.log('Multer processing result:', {
            hasFiles: !!(req.files && (req.files as Express.Multer.File[]).length > 0),
            fileCount: req.files ? (req.files as Express.Multer.File[]).length : 0
        });

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            console.error('No files uploaded after multer processing');
            return next(new HttpException(400, "No files uploaded"));
        }

        console.log(`Using multer processed files: ${(req.files as Express.Multer.File[]).length} files`);
        next();
    });
};

export default multerMiddleware;