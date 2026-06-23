import React from "react";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  user: User | null;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <div className={cn("relative flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600", className)}>
      {user?.photoURL ? (
        <Image src={user.photoURL} alt={user.displayName} fill className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold text-white uppercase">
          {user?.displayName?.charAt(0) || "U"}
        </span>
      )}
    </div>
  );
}
