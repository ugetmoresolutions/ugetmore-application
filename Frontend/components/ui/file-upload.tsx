"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  id?: string; // Add ID prop
  className?: string;
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  disabled = false, 
className,
  multiple = true, 
  maxFiles = 10,
  accept = "image/*",
  id // Destructure the new id prop
}: FileUploadProps) {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;

    const newFiles = multiple ? acceptedFiles : [acceptedFiles[0]];
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, multiple, maxFiles, disabled, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    disabled,
    multiple
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-slate-900 bg-slate-50' : 'border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-900'}
            `}
          >
            <input 
              {...getInputProps()} 
              id={id} // Pass the id to the actual file input
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the files here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPEG, PNG, GIF, WebP (Max: {maxFiles} files)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Selected Files ({files.length})</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}