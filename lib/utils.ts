import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function focusRing() {
  return "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
}

export function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}