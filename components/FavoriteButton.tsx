"use client";

import { Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoriteButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "관심단지 해제" : "관심단지 추가"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={`grid h-8 w-8 place-items-center rounded-full transition ${
        active
          ? "text-amber-400"
          : "text-slate-300 hover:text-amber-400"
      } ${className}`}
    >
      <Star size={20} strokeWidth={2} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
