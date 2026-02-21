import { execSync } from "child_process";

function isWindowsMountPath(path: string): boolean {
  return /^\/mnt\/[a-z]\//i.test(path);
}

export function isWslRuntime(): boolean {
  return Boolean(process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP);
}

function listCommandPaths(command: string): string[] {
  try {
    const output = execSync(`which -a ${command} 2>/dev/null || true`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    })
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return [...new Set(output)];
  } catch {
    return [];
  }
}

export function resolveNativeCommandPath(command: string): string | null {
  const candidates = listCommandPaths(command);
  if (candidates.length === 0) return null;

  if (!isWslRuntime()) return candidates[0];

  for (const candidate of candidates) {
    if (!isWindowsMountPath(candidate)) return candidate;
  }

  return null;
}
