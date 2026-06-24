const RESERVED_WORDS = new Set([
  'admin', 'civicmind', 'support', 'help', 'official', 'government', 
  'police', 'fire', 'municipal', 'ward', 'city', 'api', 'dashboard',
  'report', 'verify', 'explore', 'feed', 'settings', 'profile',
  'login', 'signup', 'null', 'undefined', 'root', 'system'
]);

export function isValidUsername(username: string): { valid: boolean, error: string | null } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters long' };
  }
  
  if (!/^[a-z0-9_.]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, underscores, and dots' };
  }
  
  if (username.startsWith('.') || username.startsWith('_')) {
    return { valid: false, error: 'Username cannot start with a dot or underscore' };
  }
  
  if (username.endsWith('.') || username.endsWith('_')) {
    return { valid: false, error: 'Username cannot end with a dot or underscore' };
  }
  
  if (username.includes('..')) {
    return { valid: false, error: 'Username cannot contain consecutive dots' };
  }
  
  if (username.includes('__')) {
    return { valid: false, error: 'Username cannot contain consecutive underscores' };
  }
  
  if (username.includes('._') || username.includes('_.')) {
    return { valid: false, error: 'Username cannot contain a dot followed by an underscore or vice versa' };
  }
  
  if (RESERVED_WORDS.has(username)) {
    return { valid: false, error: 'This username is reserved and cannot be used' };
  }
  
  return { valid: true, error: null };
}

export function normalizeUsername(input: string): string {
  let cleaned = input.toLowerCase().trim();
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

export function generateUsernameSuggestions(displayName: string, existingUsernames: string[]): string[] {
  const existingSet = new Set(existingUsernames);
  const suggestions: string[] = [];
  
  const parts = displayName.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  
  const first = parts[0] || 'user';
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  
  const generateRandomDigits = (n: number) => {
    return Math.floor(Math.random() * Math.pow(10, n)).toString().padStart(n, '0');
  };
  
  // Candidates based on rules
  const candidates: string[] = [];
  
  if (first && last) {
    candidates.push(`${first}${last}`); // rajeshkumar
    candidates.push(`${first}.${last}`); // rajesh.kumar
    candidates.push(`${first}_${last[0]}`); // rajesh_k
    candidates.push(`${first[0]}.${last}${generateRandomDigits(2)}`); // r.kumar + 2 digits
  } else {
    candidates.push(`${first}`);
    candidates.push(`${first}${generateRandomDigits(2)}`);
    candidates.push(`${first}.${generateRandomDigits(2)}`);
    candidates.push(`${first}_${generateRandomDigits(2)}`);
  }
  candidates.push(`${first}${generateRandomDigits(3)}`); // rajesh + 3 digits
  
  // Ensure valid and non-existing
  for (const candidate of candidates) {
    if (suggestions.length >= 5) break;
    const { valid } = isValidUsername(candidate);
    if (valid && !existingSet.has(candidate)) {
      suggestions.push(candidate);
    }
  }
  
  // If we still need more suggestions
  while (suggestions.length < 5) {
    const fallback = `${first}${generateRandomDigits(4)}`;
    const { valid } = isValidUsername(fallback);
    if (valid && !existingSet.has(fallback) && !suggestions.includes(fallback)) {
      suggestions.push(fallback);
    }
  }
  
  return suggestions;
}

export function formatUsername(username: string): string {
  return `@${username}`;
}

export function getUsernameColor(username: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316'  // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
