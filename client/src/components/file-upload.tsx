import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FileUploadResult } from "@shared/schema";

interface FileUploadProps {
  onFileUploaded: (result: FileUploadResult) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result: FileUploadResult = await response.json();
      onFileUploaded(result);
      
      toast({
        title: "File processed successfully",
        description: `Volume extracted: ${result.volume.toFixed(2)} cm³`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/stp': ['.stp'],
      'application/step': ['.step'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <div className="quote-card rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Upload className="mr-2 text-primary" />
        Upload STP File
      </h2>
      
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`upload-area border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'drag-over border-primary bg-blue-50' : 'border-border hover:border-primary hover:bg-blue-50'
        }`}
        data-testid="upload-area"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-4xl text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          {isDragActive ? 'Drop your STP file here' : 'Drop your STP file here'}
        </p>
        <p className="text-sm text-secondary mb-4">or click to browse</p>
        <button 
          type="button"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
          data-testid="button-choose-file"
        >
          Choose File
        </button>
        <p className="text-xs text-secondary mt-2">Supported: .stp, .step files (Max 50MB)</p>
      </div>

      {/* File Status */}
      {uploadedFile && !isProcessing && !error && (
        <div className="mt-4">
          <div className="info-bg border rounded-md p-3 flex items-center">
            <FileText className="text-primary mr-3" />
            <div className="flex-1">
              <p className="font-medium text-foreground" data-testid="text-uploaded-filename">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-secondary" data-testid="text-uploaded-filesize">
                {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <CheckCircle className="text-success" />
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-4">
          <div className="warning-bg border rounded-md p-3 flex items-center">
            <Loader2 className="text-warning mr-3 animate-spin" />
            <div className="flex-1">
              <p className="font-medium text-foreground" data-testid="text-processing-status">
                Processing file...
              </p>
              <p className="text-sm text-secondary">Extracting volume data</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Status */}
      {error && (
        <div className="mt-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center">
            <AlertCircle className="text-destructive mr-3" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Upload Error</p>
              <p className="text-sm text-secondary" data-testid="text-error-message">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
