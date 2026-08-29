import { Token } from "typedi";

export interface IFileUploadService {
    uploadFileToS3(filePath: string, fileName: string, mimeType: string): Promise<any>
    deleteFileFromS3(fileName: string): Promise<void>;
}

export const FILE_UPLOAD_SERVICE_TOKEN = new Token<IFileUploadService>("IFileUploadService");