import { UpesProfilePictureInfo } from "@/types/student";

export const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

/**
 * Resolves a UPES ProfilePictureInfo object or string into a usable, displayable image URL.
 * Automatically routes UPES internal paths (/edutech/documents/...) through the local /api/avatar proxy.
 */
export function getProfilePictureUrl(
  info?: string | UpesProfilePictureInfo | null,
  fallback: string = FALLBACK_AVATAR
): string {
  if (!info) {
    return fallback;
  }

  // Case 1: UPES API Object schema
  // { "FilePath": "/edutech/documents/iemsfilecontainer/<filename>.jpeg", "ContainerName": "iemsfilecontainer" }
  if (typeof info === "object" && info !== null) {
    const filePath = info.FilePath?.trim();
    if (!filePath) return fallback;

    // If it's already an absolute URL
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    // Pass relative path through /api/avatar endpoint
    const container = info.ContainerName || "iemsfilecontainer";
    return `/api/avatar?path=${encodeURIComponent(filePath)}&container=${encodeURIComponent(container)}`;
  }

  // Case 2: String URL or FilePath
  if (typeof info === "string") {
    const trimmed = info.trim();
    if (!trimmed) return fallback;

    // If it's already an external absolute URL or data URL
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }

    // If it's a UPES relative edutech document path
    if (trimmed.startsWith("/edutech/") || trimmed.includes("iemsfilecontainer") || trimmed.startsWith("/")) {
      return `/api/avatar?path=${encodeURIComponent(trimmed)}`;
    }

    return trimmed;
  }

  return fallback;
}
