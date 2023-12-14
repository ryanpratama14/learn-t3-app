import { type ReadonlyURLSearchParams } from "next/navigation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LOCALE_TAG } from "@/trpc/shared";

export const loadToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const consoleError = (error: string) => {
  console.error(
    `❌ ${getNewDate().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })} 👉 ${error}`
  );
};

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;
  return `${pathname}${queryString}`;
};

export const createSearchParams = (
  params: Record<string, string | string[]>,
  newParams?: URLSearchParams
): URLSearchParams => {
  const updatedParams = new URLSearchParams(newParams);
  for (const [key, values] of Object.entries(params)) {
    if (Array.isArray(values)) {
      for (const value of values) {
        updatedParams.append(key, value);
      }
    } else {
      updatedParams.append(key, values);
    }
  }
  return updatedParams;
};

export const getTodayDate = () => {
  const date = getNewDate();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDateLong = (): string => {
  return getNewDate().toLocaleDateString(LOCALE_TAG, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getNewDate = (dateString?: string): Date => {
  if (dateString) return new Date(dateString);
  return new Date();
};

export const getStartDate = (dateString: string): Date => {
  const updatedDate = getNewDate(dateString);
  updatedDate.setHours(0, 0, 0, 0);
  return updatedDate;
};

export const getEndDate = (dateString: string): Date => {
  const updatedDate = getNewDate(dateString);
  updatedDate.setHours(23, 59, 59, 999);
  return updatedDate;
};


export const getTokenExpiryDate = (): Date => new Date(getNewDate().getTime() + 3600000); // 1 hour;

export const getExpiryDate = ({ days = 0, months = 0 }: { days: number; months: number }): Date => {
  const date = getNewDate();
  date.setDate(date.getDate() + days);
  date.setMonth(date.getMonth() + months);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getExpiryDateFromDate = (dateString: string): Date => {
  const date = getNewDate(dateString);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getTodayExpiryDate = (): Date => {
  const date = getNewDate();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getRemainingMonthsAndDays = (targetDate: Date): { months: number; days: number } => {
  const currentDate = getNewDate();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  let remainingMonths = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
  let remainingDays = targetDay - currentDay;

  if (remainingDays < 0) {
    remainingMonths--;
    const lastMonthDays = new Date(targetYear, targetMonth, 0).getDate();
    remainingDays = lastMonthDays + remainingDays;
  }

  return { months: remainingMonths, days: remainingDays };
};

export const isDateExpired = (expiryDate: Date): boolean => expiryDate <= getNewDate();

export const isDateToday = (date: Date): boolean => {
  const currentDate = getNewDate();
  return (
    date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  );
};

export const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString(LOCALE_TAG, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
type SizeUnit = "B" | "KB" | "MB" | "GB";
type FileSize = `${PowOf2}${SizeUnit}`;

const bytesInUnit: Record<SizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

const powOf2: Record<PowOf2, number> = {
  1: 1,
  2: 2,
  4: 4,
  8: 8,
  16: 16,
  32: 32,
  64: 64,
  128: 128,
  256: 256,
  512: 512,
  1024: 1024,
};

export const isFileSizeAllowed = (maxFileSize: FileSize, fileSize: number): boolean => {
  const fileSizeRegex = /^(\d+)(B|KB|MB|GB)$/;
  const match = maxFileSize.match(fileSizeRegex);
  const size = parseInt(match![1]!, 10);
  const unit = match![2] as SizeUnit;

  const maxSize = powOf2[size as PowOf2] * bytesInUnit[unit as SizeUnit];
  if (fileSize < maxSize) return true;
  return false;
};
