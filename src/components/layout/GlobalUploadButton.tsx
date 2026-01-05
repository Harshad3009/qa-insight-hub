import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadReports } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export function GlobalUploadButton() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const xmlFiles = fileArray.filter((file) => file.name.endsWith('.xml'));
    const invalidCount = fileArray.length - xmlFiles.length;

    if (invalidCount > 0) {
      toast({
        title: 'Invalid file type',
        description: `${invalidCount} file(s) skipped. Only XML files are allowed.`,
        variant: 'destructive',
      });
    }

    if (xmlFiles.length > 0) {
      setFiles((prev) => [...prev, ...xmlFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const runIds = await uploadReports(files);
      
      toast({
        title: 'Upload successful',
        description: `${runIds.length} report(s) processed. Refresh to see updates.`,
      });
      
      setOpen(false);
      setFiles([]);
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the reports. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Test Reports</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload your JUnit XML reports to analyze test results
          </DialogDescription>
        </DialogHeader>

        <div
          className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : files.length > 0
              ? 'border-success bg-success/5'
              : 'border-border hover:border-muted-foreground'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          />

          {files.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <p className="text-foreground font-medium">
                {files.length} file(s) selected
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {(totalSize / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-muted-foreground">
                Click or drop to add more files
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-medium">Drop your XML files here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse (multiple files supported)</p>
              </div>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="gap-2 bg-gradient-to-r from-primary to-accent"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
