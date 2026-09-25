"use client";

import { Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg md:text-xl font-semibold text-primary"
        >
          <Briefcase />
          Job Tracker
        </Link>

        {/* Desktop nav — hidden below md */}
        <div className="hidden md:flex items-center gap-4">
            
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-700 hover:text-black">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {session.user.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <SignOutButton />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-700 hover:text-black">
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-primary hover:bg-primary/90">
                  Start for free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — hidden at md and above */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown panel */}

{mobileOpen && (
  <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
    {session?.user ? (
      <div className="rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent hover:text-accent-foreground">
            Dashboard
          </div>
        </Link>

        <SignOutButton asMenuItem={false} />
      </div>
    ) : (
      <>
        <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
          <Button variant="ghost" className="w-full justify-start">Log In</Button>
        </Link>
        <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
          <Button className="w-full bg-primary hover:bg-primary/90">Start for free</Button>
        </Link>
      </>
    )}
  </div>
)}
    </nav>
  );
}