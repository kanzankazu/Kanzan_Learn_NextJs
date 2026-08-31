/**
 * LikeButton — Client Component
 *
 * This is the interactive leaf component for the dashboard mini project.
 * It's extracted into its own file so the parent (DashboardPage) can stay
 * a Server Component.
 *
 * 'use client' is placed here (not in the parent) to keep the client
 * boundary as small as possible.
 */
"use client";

import { useState } from "react";

interface LikeButtonProps {
  /** Initial like count passed from the server (serializable prop) */
  initialLikes: number;
  /** Label for the item being liked */
  label: string;
}

export function LikeButton({ initialLikes, label }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleClick = () => {
    if (liked) {
      setLikes((l) => l - 1);
      setLiked(false);
    } else {
      setLikes((l) => l + 1);
      setLiked(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`${liked ? "Unlike" : "Like"} ${label}`}
      className={`
        flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
        ${liked
          ? "bg-pink-500/20 border-pink-500/40 text-pink-400"
          : "bg-white/5 border-white/20 text-gray-400 hover:border-white/40"
        }
      `}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{likes}</span>
    </button>
  );
}
