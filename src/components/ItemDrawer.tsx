"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Pin, Copy, Edit, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { ItemWithDetails } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ItemDrawer({
  itemId,
  open,
  onOpenChange,
}: ItemDrawerProps) {
  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && itemId) {
      fetchItem(itemId);
    } else {
      setItem(null);
      setIsEditMode(false);
      setFormData({
        title: "",
        description: "",
        content: "",
        url: "",
        language: "",
        tags: "",
      });
      setErrors({});
    }
  }, [open, itemId]);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        url: item.url || "",
        language: item.language || "",
        tags: item.tags?.map((t) => t.tag.name).join(", ") || "",
      });
    }
  }, [item]);

  const fetchItem = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
      toast.error("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim() || null,
        url: formData.url.trim() || null,
        language: formData.language.trim() || null,
        tags: tagsArray,
      };

      const response = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setErrors(result.errors);
          toast.error("Please fix the validation errors");
        } else {
          toast.error(result.error || "Failed to save changes");
        }
        return;
      }

      toast.success("Item updated successfully");
      setItem(result.data);
      setIsEditMode(false);
      setErrors({});
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        url: item.url || "",
        language: item.language || "",
        tags: item.tags?.map((t) => t.tag.name).join(", ") || "",
      });
    }
    setErrors({});
    setIsEditMode(false);
    toast.info("Changes discarded");
  };

  const handleAction = async (action: string) => {
    if (action === "edit") {
      setIsEditMode(true);
    } else {
      toast.info(`${action} action will be implemented later`);
    }
  };

  const renderEditForm = () => {
    const itemType = item?.itemType;
    const isLinkType = item?.contentType === "URL";
    const isTextType = item?.contentType === "TEXT";
    const itemTypeName = itemType?.name?.toLowerCase() || "";
    const isSnippetOrCommand = ["snippet", "command"].includes(itemTypeName);

    return (
      <div className="py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("favorite")}
              title="Favorite"
            >
              <Heart
                className={`h-5 w-5 ${
                  item?.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("pin")}
              title="Pin"
            >
              <Pin
                className={`h-5 w-5 ${
                  item?.isPinned ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("copy")}
              title="Copy"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !formData.title.trim()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {isTextType && (
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium mb-1"
              >
                Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter content"
                rows={6}
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content[0]}
                </p>
              )}
            </div>
          )}

          {isLinkType && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                URL
              </label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className={errors.url ? "border-destructive" : ""}
              />
              {errors.url && (
                <p className="text-sm text-destructive mt-1">{errors.url[0]}</p>
              )}
            </div>
          )}

          {isSnippetOrCommand && (
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium mb-1"
              >
                Language
              </label>
              <Input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="e.g., typescript, python, bash"
              />
            </div>
          )}

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Comma-separated tags (e.g., react, hooks, performance)"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Separate tags with commas
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-2">Non-editable fields</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{item?.itemType.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Collections:</span>
                <p className="font-medium">
                  {item?.collections && item.collections.length > 0
                    ? item.collections.map((c) => c.collection.name).join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewMode = () => {
    const itemData = item;
    const createdAt = itemData?.createdAt ? new Date(itemData.createdAt) : null;
    const updatedAt = itemData?.updatedAt ? new Date(itemData.updatedAt) : null;
    const lastUsedAt = itemData?.lastUsedAt
      ? new Date(itemData.lastUsedAt)
      : null;

    return (
      <div className="py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("favorite")}
              title="Favorite"
            >
              <Heart
                className={`h-5 w-5 ${
                  item?.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("pin")}
              title="Pin"
            >
              <Pin
                className={`h-5 w-5 ${
                  item?.isPinned ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("copy")}
              title="Copy"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("edit")}
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAction("delete")}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${item?.itemType.color}20`,
                color: item?.itemType.color,
              }}
            >
              {item?.itemType.name}
            </span>
            {item?.language && (
              <span className="text-sm text-muted-foreground capitalize">
                {item.language}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">{item?.title}</h2>

          {item?.description && (
            <p className="text-muted-foreground mb-4">{item.description}</p>
          )}

          {item?.contentType === "TEXT" && item.content && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Content</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                {item.content}
              </pre>
            </div>
          )}

          {item?.contentType === "URL" && item.url && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">URL</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {item.url}
              </a>
            </div>
          )}

          {item?.contentType === "FILE" && item.fileUrl && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">File</h3>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {item.fileName || "Download file"}
              </a>
              {item.fileSize && (
                <p className="text-sm text-muted-foreground mt-1">
                  {(item.fileSize / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
          )}

          {item?.collections && item.collections.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Collections</h3>
              <div className="flex flex-wrap gap-2">
                {item.collections.map(({ collection }) => (
                  <span
                    key={collection.id}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                  >
                    {collection.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            {createdAt && <p>Created: {createdAt.toLocaleDateString()}</p>}
            {updatedAt && <p>Updated: {updatedAt.toLocaleDateString()}</p>}
            {lastUsedAt && <p>Last used: {lastUsedAt.toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit Item" : "Item Details"}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="space-x-2">
                <div className="h-8 bg-muted rounded inline-block w-20"></div>
                <div className="h-8 bg-muted rounded inline-block w-20"></div>
              </div>
            </div>
          </div>
        ) : item ? (
          isEditMode ? (
            renderEditForm()
          ) : (
            renderViewMode()
          )
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Item not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
