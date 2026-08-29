// hooks/useFileUpload.ts
import { ORDER_API } from '@/endpoints/rest-api/order';
import { useState } from 'react';


export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadFiles = async (files: File[]): Promise<string[]> => {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
            const formData = new FormData();
            
            // Add files to form data
            files.forEach((file, index) => {
                formData.append('files', file);
            });

            // Simulate progress (you can replace this with actual progress tracking if your API supports it)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + 10;
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 200);

            const response = await ORDER_API.UPLOAD_FILE(formData);
            
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.error) {
                throw new Error(response.message || 'Failed to upload files');
            }

            // Extract URLs from response
            const urls = response.data.map((item: any) => item.url);
            return urls;

        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    return {
        uploadFiles,
        isUploading,
        uploadProgress
    };
};