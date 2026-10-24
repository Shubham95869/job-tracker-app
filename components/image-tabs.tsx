"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState("organize"); // organize, hired, boards

  return (
    <section className="border-t border-border bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Tabs */}
          <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              onClick={() => setActiveTab("organize")}
              variant={activeTab === "organize" ? "default" : "secondary"}
              className="h-auto w-full whitespace-normal px-3 py-3 text-sm"
              aria-pressed={activeTab === "organize"}
            >
              Organize Applications
            </Button>
            <Button
              onClick={() => setActiveTab("hired")}
              variant={activeTab === "hired" ? "default" : "secondary"}
              className="h-auto w-full whitespace-normal px-3 py-3 text-sm"
              aria-pressed={activeTab === "hired"}
            >
              Get Hired
            </Button>
            <Button
              onClick={() => setActiveTab("boards")}
              variant={activeTab === "boards" ? "default" : "secondary"}
              className="h-auto w-full whitespace-normal px-3 py-3 text-sm"
              aria-pressed={activeTab === "boards"}
            >
              Manage Boards
            </Button>
          </div>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-border shadow-xl">
            {activeTab === "organize" && (
              <Image
                src="/hero-images/hero1.png"
                alt="Organize Applications"
                width={1200}
                height={800}
              />
            )}

            {activeTab === "hired" && (
              <Image
                src="/hero-images/hero2.png"
                alt="Job applications organized in Kanban columns"
                width={1200}
                height={800}
              />
            )}

            {activeTab === "boards" && (
              <Image
                src="/hero-images/hero3.png"
                alt="Add job application dialog with structured fields"
                width={1200}
                height={800}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
