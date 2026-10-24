"use client";

import { Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <nav
      aria-label="Primary"
      className="border-b border-border bg-background text-foreground"
      onKeyDown={(event) => {
        if (event.key === "Escape" && mobileOpen) {
          closeMobileMenu();
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="container mx-auto flex h-16 min-w-0 items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-lg font-semibold text-primary md:text-xl"
          onClick={closeMobileMenu}
        >
          <Briefcase aria-hidden="true" className="size-5 shrink-0" />
          <span className="truncate">Job Tracker</span>
        </Link>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-foreground",
                })}
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {session.user.name?.trim().charAt(0).toUpperCase() ||
                          session.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex min-w-0 flex-col space-y-1">
                        <p className="truncate text-sm font-medium leading-none">
                          {session.user.name || "Account"}
                        </p>
                        <p className="truncate text-xs leading-none text-muted-foreground">
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
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-foreground",
                })}
              >
                Log In
              </Link>
              <Link href="/sign-up" className={buttonVariants()}>
                Start for free
              </Link>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        hidden={!mobileOpen}
        className="border-t border-border bg-background px-4 py-3 md:hidden"
      >
        <div className="container mx-auto grid gap-2">
          {session?.user ? (
            <>
              <div className="min-w-0 px-2 py-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {session.user.name || "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={buttonVariants({
                  variant: "ghost",
                  className: "h-11 w-full justify-start",
                })}
              >
                Dashboard
              </Link>
              <SignOutButton
                asMenuItem={false}
                className="min-h-11 cursor-pointer px-2.5 text-left"
              />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                onClick={closeMobileMenu}
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 w-full",
                })}
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className={buttonVariants({
                  className: "h-11 w-full",
                })}
              >
                Start for free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
