import type { BookGroup } from "@prisma/client";
import { useMatches } from "@remix-run/react";
import dayjs from "dayjs";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

function isAdminGroups(groups: any): groups is string[] {
  return groups && Array.isArray(groups);
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useAdminGroupsOfUser(): string[] | undefined {
  const data = useMatchesData("root");
  if (!data || !isAdminGroups(data.adminUserGroups)) {
    return undefined;
  }
  return data.adminUserGroups;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function useIsAdminUser(groupId: BookGroup["id"] | undefined): Boolean {
  const adminGroupsForUser = useAdminGroupsOfUser();
  if (!adminGroupsForUser) {
    throw new Error(
      "No user or bookGroup found in root loader, but user is required by useIsAdminUser. If user is optional, try useOptionalUser instead."
    );
  }

  return adminGroupsForUser.some((id) => id === groupId);
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export type Nullable<T> = T | null;

export const formatDateToInput = (date: Date | string | undefined) =>
  date && dayjs(date).format("YYYY-MM-DD");

export function getBase64(
  file: File
): Promise<string | ArrayBuffer | null | ProgressEvent<FileReader>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
