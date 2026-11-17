export const capitalize = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

export const firstName = (name?: string | null) => name?.trim().split(/\s+/)[0] ?? '';
