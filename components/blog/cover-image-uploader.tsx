"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { blogService } from "@/services/blog-service";

interface CoverImageUploaderProps {
  url: string;
  onChange: (url: string) => void;
  accessToken: string;
}

export function CoverImageUploader({
  url,
  onChange,
  accessToken,
}: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const draft = await blogService.getUploadDraft(file.name, accessToken);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", draft.apiKey);
      formData.append("timestamp", draft.timestamp.toString());
      formData.append("signature", draft.signature);
      formData.append("folder", draft.folder);
      if (draft.uploadPreset) {
        formData.append("upload_preset", draft.uploadPreset);
      }

      const response = await fetch(draft.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const result = await response.json();
      onChange(result.secure_url);
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error("Failed to upload cover image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (url) {
    return (
      <div className="group relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl border bg-muted/20">
        <img
          src={url}
          alt="Cover"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Change
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />
      <Button
        variant="ghost"
        className="h-auto flex-col items-start gap-1 p-0 hover:bg-transparent"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <div className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">Add cover image</span>
        </div>
      </Button>
    </div>
  );
}
