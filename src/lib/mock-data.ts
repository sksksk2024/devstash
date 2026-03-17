export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  itemCount: number;
  color: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  contentType: "TEXT" | "FILE" | "URL";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  language?: string;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  itemType: ItemType;
  collectionIds: string[];
}

// Current logged in user
export const currentUser: User = {
  id: "user_1",
  name: "Demo User",
  email: "demo@devstash.io",
  isPro: true,
};

// System item types (seeded)
export const itemTypes: ItemType[] = [
  {
    id: "type_snippet",
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    id: "type_prompt",
    name: "prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
  },
  {
    id: "type_command",
    name: "command",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
  },
  {
    id: "type_note",
    name: "note",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
  },
  {
    id: "type_file",
    name: "file",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
  },
  {
    id: "type_image",
    name: "image",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
  },
  {
    id: "type_link",
    name: "link",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
  },
];

// Collections
export const collections: Collection[] = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 3,
    color: "#3b82f6",
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 2,
    color: "#10b981",
  },
  {
    id: "col_3",
    name: "AI Prompts",
    description: "Prompts for code generation",
    isFavorite: true,
    itemCount: 4,
    color: "#8b5cf6",
  },
  {
    id: "col_4",
    name: "Terminal Commands",
    description: "Useful CLI commands",
    isFavorite: false,
    itemCount: 2,
    color: "#f97316",
  },
];

// Items
export const items: Item[] = [
  {
    id: "item_1",
    title: "useEffect Cleanup Pattern",
    description: "Proper cleanup in useEffect to prevent memory leaks",
    contentType: "TEXT",
    content: `useEffect(() => {
  const controller = new AbortController();

  fetchData(controller.signal).catch(() => {});

  return () => controller.abort();
}, []);`,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    lastUsedAt: new Date("2025-03-15"),
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-10"),
    itemType: itemTypes[0], // snippet
    collectionIds: ["col_1"],
  },
  {
    id: "item_2",
    title: "Python List Comprehension",
    description: "Elegant way to create lists in Python",
    contentType: "TEXT",
    content: `# Basic list comprehension
squares = [x**2 for x in range(10)]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Nested comprehension
matrix = [[i*j for j in range(3)] for i in range(3)]`,
    language: "python",
    isFavorite: false,
    isPinned: false,
    lastUsedAt: new Date("2025-03-12"),
    createdAt: new Date("2025-03-08"),
    updatedAt: new Date("2025-03-08"),
    itemType: itemTypes[0], // snippet
    collectionIds: ["col_2"],
  },
  {
    id: "item_3",
    title: "GPT System Prompt for Code Review",
    description: "System prompt for thorough code reviews",
    contentType: "TEXT",
    content: `You are a senior software engineer conducting a code review.

Focus on:
1. Code quality and readability
2. Potential bugs or edge cases
3. Performance implications
4. Security vulnerabilities
5. Best practices and conventions

Provide specific, actionable feedback with code examples when possible.`,
    language: undefined,
    isFavorite: true,
    isPinned: false,
    lastUsedAt: new Date("2025-03-16"),
    createdAt: new Date("2025-03-05"),
    updatedAt: new Date("2025-03-05"),
    itemType: itemTypes[1], // prompt
    collectionIds: ["col_3"],
  },
  {
    id: "item_4",
    title: "curl POST with JSON",
    description: "Common curl command for API testing",
    contentType: "TEXT",
    content: `curl -X POST https://api.example.com/endpoint \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"key": "value", "nested": {"data": 123}}'`,
    language: undefined,
    isFavorite: false,
    isPinned: false,
    lastUsedAt: new Date("2025-03-14"),
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
    itemType: itemTypes[2], // command
    collectionIds: ["col_4"],
  },
  {
    id: "item_5",
    title: "React Custom Hook: useLocalStorage",
    description: "Sync state with localStorage",
    contentType: "TEXT",
    content: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    lastUsedAt: new Date("2025-03-17"),
    createdAt: new Date("2025-03-06"),
    updatedAt: new Date("2025-03-06"),
    itemType: itemTypes[0], // snippet
    collectionIds: ["col_1", "col_3"],
  },
  {
    id: "item_6",
    title: "Project Setup Notes",
    description: "Important notes for new project initialization",
    contentType: "TEXT",
    content: `## Project Setup Checklist

- [ ] Initialize git repository
- [ ] Create .env.example with required vars
- [ ] Set up ESLint and Prettier
- [ ] Configure CI/CD pipeline
- [ ] Add README with setup instructions
- [ ] Document API endpoints
- [ ] Set up monitoring/logging`,
    language: undefined,
    isFavorite: false,
    isPinned: false,
    lastUsedAt: new Date("2025-03-11"),
    createdAt: new Date("2025-03-09"),
    updatedAt: new Date("2025-03-09"),
    itemType: itemTypes[3], // note
    collectionIds: [],
  },
  {
    id: "item_7",
    title: "Next.js API Route Template",
    description: "Standard template for API routes",
    contentType: "TEXT",
    content: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process and return
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    lastUsedAt: new Date("2025-03-13"),
    createdAt: new Date("2025-03-07"),
    updatedAt: new Date("2025-03-07"),
    itemType: itemTypes[0], // snippet
    collectionIds: ["col_1"],
  },
  {
    id: "item_8",
    title: "DevStash Documentation",
    description: "Link to project documentation",
    contentType: "URL",
    url: "https://github.com/sksksk2024/devstash",
    isFavorite: true,
    isPinned: false,
    lastUsedAt: new Date("2025-03-16"),
    createdAt: new Date("2025-03-02"),
    updatedAt: new Date("2025-03-02"),
    itemType: itemTypes[6], // link
    collectionIds: [],
  },
];
