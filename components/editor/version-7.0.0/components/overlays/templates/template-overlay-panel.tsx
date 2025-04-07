import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "../../../contexts/editor-context";
import { TemplateOverlay } from "../../../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates } from "../../../hooks/use-templates";
import { TemplateThumbnail } from "./template-thumbnail";

export const TemplateOverlayPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { setOverlays } = useEditorContext();

  const { templates, isLoading, error } = useTemplates({
    searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the useTemplates hook
  };

  const handleApplyTemplate = (template: TemplateOverlay) => {
    // Replace all existing overlays with the template overlays
    const newOverlays = template.overlays.map((overlayTemplate, index) => ({
      ...overlayTemplate,
      // Generate new IDs for each overlay to avoid conflicts
      id: Math.floor(Math.random() * 1000000) + index,
    }));

    // Update the editor's timeline with the new overlays
    setOverlays(newOverlays);
  };

  const handleImportTemplate = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const template = JSON.parse(content) as TemplateOverlay;
      handleApplyTemplate(template);
    } catch (err) {
      console.error("Failed to import template:", err);
      // You might want to add proper error handling/notification here
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100/40 dark:bg-gray-900/40 h-full scrollbar-hide overflow-hidden">
      <>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-white/5 text-gray-900 dark:text-zinc-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-blue-400"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Import template"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2">
            Error loading templates: {error}
          </div>
        )}

        <ScrollArea className="flex-1 scrollbar-hide overflow-hidden [&_[data-radix-scroll-area-scrollbar]]:!hidden">
          <div className="grid grid-cols-1 gap-2 scrollbar-hide">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm"
                />
              ))
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent transition-colors duration-200"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <CardHeader className="p-3 space-y-3">
                    <div className="aspect-video w-full overflow-hidden rounded-md">
                      <TemplateThumbnail
                        thumbnail={template.thumbnail}
                        name={template.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-sm font-medium">
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex float-right gap-2 text-xs text-muted-foreground">
                        <span className="text-xs float-right">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-gray-500">
                No templates found
              </div>
            )}
          </div>
        </ScrollArea>
      </>
    </div>
  );
};
