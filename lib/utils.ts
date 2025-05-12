import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compares two subject names to check if they're likely to be the same
 * Handles common variations like spaces, casing, and common word differences
 */
export function compareSubjectNames(name1?: string, name2?: string): boolean {
  if (!name1 || !name2) return false;
  
  // Normalize both names (lowercase, remove extra spaces, common variations)
  const normalize = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/fundamentle/g, 'fundamental')
      .replace(/fundamentals/g, 'fundamental')
      .replace(/\bfundamentals\b/g, 'fundamental')
      .replace(/\bmaths\b/g, 'math')
      .replace(/\bmathematics\b/g, 'math');
  };
  
  const normalized1 = normalize(name1);
  const normalized2 = normalize(name2);
  
  // Check for exact match after normalization
  if (normalized1 === normalized2) return true;
  
  // Create subject specific patterns to prevent cross-matches
  // Map of common subjects with specific patterns to match
  const specificSubjects: Record<string, string[]> = {
    'powerpoint': ['powerpoint', 'power point', 'ms powerpoint', 'microsoft powerpoint'],
    'excel': ['excel', 'ms excel', 'microsoft excel', 'spreadsheet'],
    'word': ['word', 'ms word', 'microsoft word'],
    'fundamental': ['fundamental', 'fundamentals', 'fundamentle', 'basic'],
    'computer': ['computer', 'pc', 'computing'],
    'internet': ['internet', 'web', 'www'],
    'windows': ['windows', 'win', 'microsoft windows', 'operating system']
  };
  
  // Check if the names belong to different specific subject categories
  const getSpecificSubject = (name: string): string | null => {
    for (const [subject, patterns] of Object.entries(specificSubjects)) {
      if (patterns.some(pattern => name.includes(pattern))) {
        return subject;
      }
    }
    return null;
  };
  
  const specificSubject1 = getSpecificSubject(normalized1);
  const specificSubject2 = getSpecificSubject(normalized2);
  
  // If both names match specific subjects but they're different, return false
  if (specificSubject1 && specificSubject2 && specificSubject1 !== specificSubject2) {
    console.log(`Subject mismatch: "${name1}" (${specificSubject1}) vs "${name2}" (${specificSubject2})`);
    return false;
  }
  
  // Check if one contains the other, but ONLY if they don't have conflicting subject categories
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Check for significant overlap by splitting into words
  const words1 = normalized1.split(' ').filter(w => w.length > 2);
  const words2 = normalized2.split(' ').filter(w => w.length > 2);
  
  // If there are common significant words
  const commonWords = words1.filter(w => words2.includes(w));
  if (commonWords.length > 0 && 
      (commonWords.length >= words1.length / 2 || commonWords.length >= words2.length / 2)) {
    return true;
  }
  
  return false;
}
