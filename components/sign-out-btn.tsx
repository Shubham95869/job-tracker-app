// components/sign-out-btn.tsx
"use client";

import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { cn } from "cn";

interface SignOutButtonProps {
  asMenuItem?: boolean; // true = desktop (inside DropdownMenu), false = mobile panel
  className?: string;
}

export default function SignOutButton({
  asMenuItem = true,
  className,
}: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.data) {
      router.push("/sign-in");
    } else {
      alert("Error signing out");
    }
  };

  if (asMenuItem) {
    return <DropdownMenuItem onClick={handleSignOut}>Log Out</DropdownMenuItem>;
  }

  // Mobile: plain button, styled to match DropdownMenuItem's look
  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
    >
      Log Out
    </button>
  );
}