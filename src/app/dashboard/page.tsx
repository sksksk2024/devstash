"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <Input type="search" placeholder="Search..." className="w-64" />
            <Button>New Item</Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-[calc(100vh-60px)]">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Item Types</h2>
            <ul className="space-y-2">
              <li>Snippets</li>
              <li>Prompts</li>
              <li>Commands</li>
              <li>Notes</li>
              <li>Links</li>
            </ul>

            <h2 className="font-semibold mt-6 mb-4">Collections</h2>
            <ul className="space-y-2">
              <li>React Patterns</li>
              <li>Python Snippets</li>
              <li>AI Prompts</li>
              <li>Terminal Commands</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h2>Main Content Area</h2>
          <p className="text-muted-foreground mt-2">
            Dashboard content will go here
          </p>
        </main>
      </div>
    </div>
  );
}
