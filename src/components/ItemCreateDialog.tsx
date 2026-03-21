"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { XIcon, PlusIcon } from "lucide-react";
import { createItem } from "@/actions/items";
import { toast } from "sonner";

interface ItemCreateDialogProps {
  children: React.ReactNode;
  onItemCreated?: () => void;
}

const ITEM_TYPES = [
  { name: "snippet", label: "Snippet", icon: "Code" },
  { name: "prompt", label: "Prompt", icon: "Sparkles" },
  { name: "command", label: "Command", icon: "Terminal" },
  { name: "note", label: "Note", icon: "StickyNote" },
  { name: "link", label: "Link", icon: "Link" },
] as const;

export default function ItemCreateDialog({
  children,
  onItemCreated,
}: ItemCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "snippet" as const,
    title: "",
    description: "",
    content: "",
    language: "",
    url: "",
    tags: [] as string[],
    tagInput: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine content type based on item type
      const contentType = formData.type === "link" ? "URL" : "TEXT";

      // Prepare data for API
      const apiData = {
        title: formData.title,
        description: formData.description || null,
        contentType,
        itemTypeName: formData.type,
        tags: formData.tags,
      };

      // Add type-specific fields
      if (
        formData.type === "snippet" ||
        formData.type === "command" ||
        formData.type === "prompt" ||
        formData.type === "note"
      ) {
        apiData.content = formData.content;
      }

      if (formData.type === "snippet" || formData.type === "command") {
        apiData.language = formData.language || undefined;
      }

      if (formData.type === "link") {
        apiData.url = formData.url;
      }

      // Call server action
      const result = await createItem(apiData);

      if (result.success) {
        toast.success("Item created successfully!");
        setOpen(false);
        onItemCreated?.();

        // Reset form
        setFormData({
          type: "snippet",
          title: "",
          description: "",
          content: "",
          language: "",
          url: "",
          tags: [],
          tagInput: "",
        });
      } else {
        toast.error(result.error || "Failed to create item");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (
      formData.tagInput.trim() &&
      !formData.tags.includes(formData.tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: "",
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Create a new item for your collection. Select a type and fill in the
            required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {ITEM_TYPES.map((type) => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: type.name }))
                  }
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                    formData.type === type.name
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-lg mb-1">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div>
            <label htmlFor="title" className="text-sm font-medium mb-2 block">
              Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter a title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium mb-2 block"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter a description"
              rows={2}
            />
          </div>

          {/* Type-Specific Fields */}
          {(formData.type === "snippet" ||
            formData.type === "command" ||
            formData.type === "prompt" ||
            formData.type === "note") && (
            <div>
              <label
                htmlFor="content"
                className="text-sm font-medium mb-2 block"
              >
                Content *
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter content"
                rows={6}
                required
              />
            </div>
          )}

          {(formData.type === "snippet" || formData.type === "command") && (
            <div>
              <label
                htmlFor="language"
                className="text-sm font-medium mb-2 block"
              >
                Language
              </label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, language: e.target.value }))
                }
                placeholder="e.g., typescript, python, bash"
              />
            </div>
          )}

          {formData.type === "link" && (
            <div>
              <label htmlFor="url" className="text-sm font-medium mb-2 block">
                URL *
              </label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={formData.tagInput}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagInput: e.target.value }))
                }
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
              />
              <Button
                type="button"
                onClick={addTag}
                size="icon"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
