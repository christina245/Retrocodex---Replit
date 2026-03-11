const ALLOWED = /^[a-zA-Z0-9._-]+$/;

export function validateUsername(value: string): string | null {
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 30) return "Username must be 30 characters or fewer.";
  if (!ALLOWED.test(value))
    return "Username may only contain letters, numbers, underscores ( _ ), dots ( . ), and hyphens ( - ).";
  return null;
}
