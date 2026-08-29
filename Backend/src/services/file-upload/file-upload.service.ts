import { threadId } from "worker_threads";
import { deleteFileFromS3, uploadFileToS3 } from "@/utils/s3";
import { Service } from "typedi";
import { FILE_UPLOAD_SERVICE_TOKEN, IFileUploadService } from "@/interfaces/file-upload/file-upload.service.interface";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: FILE_UPLOAD_SERVICE_TOKEN, type: FileUploadService })
export class FileUploadService implements IFileUploadService {

    public async uploadFileToS3(filePath: string, fileName: string, mimeType: string): Promise<any> {
        try {

            const uploadedFile = await uploadFileToS3(filePath, fileName, mimeType);
            return uploadedFile
        } catch (error) {
            throw new HttpException(400, error)
        }
    }
    
    public async deleteFileFromS3(fileName: string): Promise<any> {
        try {
            await deleteFileFromS3(fileName);
        } catch (error) {
            throw new HttpException(400, error)
        }
    }

}