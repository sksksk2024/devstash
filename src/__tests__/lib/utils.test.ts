import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", true && "active", false && "inactive");
    expect(result).toBe("base active");
  });

  it("should merge conflicting Tailwind classes using twMerge", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("should handle array inputs", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("should handle object inputs", () => {
    const result = cn({ "bg-red-500": true, "bg-blue-500": false });
    expect(result).toBe("bg-red-500");
  });

  it("should handle undefined and null values", () => {
    const result = cn("class1", undefined, null, "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
