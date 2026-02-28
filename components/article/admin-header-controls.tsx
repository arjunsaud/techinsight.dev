"use client";

import { Eye, EyeOff, Loader2, Save, Send } from "lucide-react";

import { useAdminStudioControls } from "@/components/article/admin-studio-context";
import { Button } from "@/components/ui/button";

export function ArticleHeaderControls() {
  const { isSaving, isPreviewMode, saveDraft, savePublished, togglePreview } =
    useAdminStudioControls();

  return (
    <div className="flex items-center gap-2">
      <Button
        className="gap-2"
        size="sm"
        onClick={saveDraft}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSaving ? "Saving..." : "Save"}
      </Button>

      <Button className="gap-2" onClick={togglePreview} variant="outline" size="sm">
        {isPreviewMode ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {isPreviewMode ? "Back to Edit" : "Preview"}
      </Button>

      {!isPreviewMode && (
        <Button
          className="gap-2"
          variant="outline"
          size="sm"
          onClick={savePublished}
          disabled={isSaving}
        >
          <Send className="h-4 w-4" />
          Publish
        </Button>
      )}
    </div>
  );
}
