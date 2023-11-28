import { Prisma } from "@prisma/client";
import { z } from "zod";
import { TRPCError, type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type Pagination } from "~/server/api/schema/schema";

export const PAGINATION_LIMIT = 5;

export const LOCALE_TAG: undefined | string[] = [];

export const MESSAGES_LIST = {
  NOT_FOUND: "Data not found",
  ALREADY_EXISTS: "Data already exists",
  DELETED: "Data has been deleted",
  UNAUTHORIZED: "You are not authorized to access",
};

type A<T extends string> = T extends `${infer U}ScalarFieldEnum` ? U : never;
type Entity = A<keyof typeof Prisma>;
type Keys<T extends Entity> = Extract<keyof (typeof Prisma)[keyof Pick<typeof Prisma, `${T}ScalarFieldEnum`>], string>;

export const prismaExclude = <T extends Entity, K extends Keys<T>>(type: T, omit: K[]) => {
  type Key = Exclude<Keys<T>, K>;
  type TMap = Record<Key, true>;
  const result: TMap = {} as TMap;
  for (const key in Prisma[`${type}ScalarFieldEnum`]) {
    if (!omit.includes(key as K)) {
      result[key as Key] = true;
    }
  }
  return result;
};

export const removeFieldsFromArray = <T extends Record<string, unknown>, K extends keyof T>(
  objects: Array<T>,
  fieldsToRemove: K[]
): Array<Omit<T, K>> => {
  return objects.map((obj) => {
    const updatedObj = structuredClone(obj);
    for (const field of fieldsToRemove) {
      delete updatedObj[field];
    }
    return updatedObj;
  });
};

export const removeFieldsFromObject = <T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  fieldsToRemove: K[]
): Omit<T, K> => {
  const updatedObj = structuredClone(object);
  for (const field of fieldsToRemove) {
    delete updatedObj[field];
  }
  return updatedObj;
};

export const mergeZodSchema = <T extends Entity>(entity: T): z.ZodObject<Record<Keys<T>, z.ZodString>, "strip"> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const entityFields: Keys<T>[] = Object.keys((Prisma as any)[`${entity}ScalarFieldEnum`]) as Keys<T>[];

  const schema = entityFields.reduce((schema, field) => {
    return schema.merge(
      z.object({
        [field]: z.string().optional(),
      })
    );
  }, z.object({}));

  return schema as z.ZodObject<Record<Keys<T>, z.ZodString>, "strip">;
};

export const getZodKeys = (schema: z.ZodType): string[] => {
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return getZodKeys(schema.unwrap());
  }
  if (schema instanceof z.ZodArray) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return getZodKeys(schema.element);
  }
  if (schema instanceof z.ZodObject) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const entries = Object.entries<z.ZodType>(schema.shape);
    return entries.flatMap(([key, value]) => {
      const nested = getZodKeys(value).map((subKey) => `${key}.${subKey}`);
      return nested.length ? nested : key;
    });
  }
  return [];
};

export const getZodEnum = <K extends string>(obj: Record<K, unknown>): z.ZodOptional<z.ZodEnum<[K, ...K[]]>> => {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey!, ...otherKeys]).optional();
};

export const getEnum = <K extends string>(obj: Record<K, unknown>): [K, ...K[]] => {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return [firstKey!, ...otherKeys];
};

export const getEnumKeys = <K extends string>(obj: Record<K, unknown>): K | undefined => {
  const keys = Object.keys(obj) as K[];
  if (keys[0]) return keys[0];
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getUrl = () => {
  return getBaseUrl() + "/api/trpc";
};

export const getPagination = ({ limit = PAGINATION_LIMIT, page }: Pagination) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const getPaginationData = (totalData: number, limit: number = PAGINATION_LIMIT, page: number) => {
  const totalPages = Math.ceil(totalData / limit) || 1;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    limit,
    page,
    totalData,
    totalPages,
    hasNextPage: end < totalData,
    hasPrevPage: start > 0,
    isInvalidPage: page > totalPages || page < 1,
  };
};

export const throwNotFoundError = (data: unknown) => {
  if (!data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: MESSAGES_LIST.NOT_FOUND,
    });
  }
};

export const throwDataExistsError = (data: unknown) => {
  if (data) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: MESSAGES_LIST.ALREADY_EXISTS,
    });
  }
};

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
