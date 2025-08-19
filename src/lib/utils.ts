import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLogoBase64 = async (): Promise<string> => {
  const response = await fetch('https://www.latinstorehouse.com/wp-content/uploads/2021/02/LATIN-STORE-HOUSE.png');
  const blob = await response.blob();
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

    