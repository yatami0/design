import { clsx, type ClassValue } from "clsx"

// 🟥 素材層で唯一書き換えた 1 行（shadcn 既定は "tailwind-merge" 直輸入）。
// ① Tokens 層の語彙を教えた twMerge に差し替える。理由は tw-merge.ts の冒頭。
import { twMerge } from "@/lib/tw-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
