import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with class names */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}