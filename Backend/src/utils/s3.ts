import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { HttpException } from "@/exceptions/HttpException";
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } from "@/config";
import { logger } from "./logger";

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!
    }
});

export const uploadFileToS3 = async (filePath: string, fileName: string, mimeType: string): Promise<string> => {
    try {
        // Verify file exists before attempting upload
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Get file stats to ensure it's not empty
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            throw new Error(`File is empty: ${filePath}`);
        }

        logger.info(`Uploading file: ${fileName}, size: ${stats.size} bytes, type: ${mimeType}`);

        // Read file as buffer instead of stream for better error handling
        const fileBuffer = fs.readFileSync(filePath);

        const uploadParams = {
            Bucket: AWS_S3_BUCKET_NAME!,
            Key: `leaves/${fileName}`,
            Body: fileBuffer,
            ContentType: mimeType,
            // Add these parameters to ensure proper handling
            ContentLength: stats.size,
            // Optional: Add cache control and metadata
            CacheControl: 'max-age=31536000', // 1 year cache
            Metadata: {
                'original-name': fileName,
                'upload-timestamp': new Date().toISOString()
            }
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        const result = await s3.send(uploadCommand);
        
        logger.info(`Successfully uploaded ${fileName} to S3. ETag: ${result.ETag}`);
        
        // Clean up local file only after successful upload
        fs.unlinkSync(filePath);
        
        // Return the correct S3 URL
        return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/leaves/${fileName}`;
        
    } catch (error) {
        logger.error(`Error uploading file ${fileName}:`, error);
        
        // Clean up local file even if upload fails
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                logger.error(`Error cleaning up local file ${filePath}:`, unlinkError);
            }
        }
        
        throw new HttpException(500, `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const deleteFileFromS3 = async (fileName: string): Promise<void> => {
    try {
        const bucketName = AWS_S3_BUCKET_NAME!; // Use consistent bucket name variable
        const objectKey = `leaves/${fileName}`; // Include the full path to match upload

        // First try to delete the current version
        try {
            const deleteParams = {
                Bucket: bucketName,
                Key: objectKey,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
            logger.info(`Deleted current version of ${fileName}`);
        } catch (error) {
            logger.warn(`Could not delete current version of ${fileName}:`, error);
        }

        // Then handle versioned objects if versioning is enabled
        try {
            const { Versions } = await s3.send(new ListObjectVersionsCommand({ 
                Bucket: bucketName, 
                Prefix: objectKey 
            }));

            if (Versions && Versions.length > 0) {
                for (const version of Versions) {
                    if (version.Key === objectKey) { // Ensure exact match
                        const deleteParams = {
                            Bucket: bucketName,
                            Key: objectKey,
                            VersionId: version.VersionId,
                        };
                        await s3.send(new DeleteObjectCommand(deleteParams));
                    }
                }
                logger.info(`Deleted all versions of ${fileName}`);
            }
        } catch (versionError) {
            // Versioning might not be enabled, which is fine
            logger.info(`Versioning not enabled or no versions found for ${fileName}`);
        }

    } catch (error) {
        logger.error("Error deleting file from S3:", error);
        throw new HttpException(500, `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};