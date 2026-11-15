import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAttendanceStatus(percentage: number): {
  color: string;
  badgeBg: string;
  badgeBorder: string;
  label: string;
  glow: string;
} {
  if (percentage >= 75) {
    return {
      color: "#34D399",
      badgeBg: "rgba(52, 211, 153, 0.12)",
      badgeBorder: "rgba(52, 211, 153, 0.25)",
      label: "Safe Zone (≥75%)",
      glow: "rgba(52, 211, 153, 0.4)",
    };
  } else if (percentage >= 65) {
    return {
      color: "#FBBF24",
      badgeBg: "rgba(251, 191, 36, 0.12)",
      badgeBorder: "rgba(251, 191, 36, 0.25)",
      label: "Warning Zone (65-74%)",
      glow: "rgba(251, 191, 36, 0.4)",
    };
  } else {
    return {
      color: "#F87171",
      badgeBg: "rgba(248, 113, 113, 0.12)",
      badgeBorder: "rgba(248, 113, 113, 0.25)",
      label: "Critical Low (<65%)",
      glow: "rgba(248, 113, 113, 0.4)",
    };
  }
}

// Bunk / Recovery calculation
// Target attendance is 75% (0.75)
export function getBunkAdvice(attended: number, total: number, target: number = 75): {
  canBunk: number;
  needToAttend: number;
  text: string;
  status: "safe" | "warning" | "critical";
} {
  if (total === 0) {
    return { canBunk: 0, needToAttend: 0, text: "No classes yet", status: "safe" };
  }

  const currentPct = (attended / total) * 100;
  const targetRatio = target / 100;

  if (currentPct >= target) {
    // How many classes can be bunked such that (attended) / (total + x) >= targetRatio
    // attended >= targetRatio * total + targetRatio * x
    // x <= (attended - targetRatio * total) / targetRatio
    const canBunk = Math.floor((attended - targetRatio * total) / targetRatio);
    return {
      canBunk: Math.max(0, canBunk),
      needToAttend: 0,
      text: canBunk > 0 ? `Can skip ${canBunk} class${canBunk > 1 ? "es" : ""}` : "On the verge (0 margin)",
      status: canBunk > 1 ? "safe" : "warning",
    };
  } else {
    // How many classes must be attended consecutively such that (attended + y) / (total + y) >= targetRatio
    // attended + y >= targetRatio * total + targetRatio * y
    // y * (1 - targetRatio) >= targetRatio * total - attended
    // y >= (targetRatio * total - attended) / (1 - targetRatio)
    const needToAttend = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
    return {
      canBunk: 0,
      needToAttend: Math.max(1, needToAttend),
      text: `Attend next ${needToAttend} for ${target}%`,
      status: "critical",
    };
  }
}
