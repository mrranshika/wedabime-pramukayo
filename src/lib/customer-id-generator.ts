// Optimized Customer ID Generator Utility
export class CustomerIDGenerator {
  private static letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Generate customer IDs on demand instead of all at once
  static generateNextID(usedIDs: string[]): string {
    // Start with simple single-letter prefixes for better performance
    const prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (const prefix of prefixes) {
      for (let num = 0; num <= 999; num++) {
        for (const letter of this.letters.slice(0, 10)) { // A-J only for performance
          for (let suffix = 1; suffix <= 99; suffix++) {
            const numStr = num.toString().padStart(3, '0');
            const suffixStr = suffix.toString().padStart(2, '0');
            const id = `${prefix}-${numStr}${letter}${suffixStr}`;
            
            if (!usedIDs.includes(id)) {
              return id;
            }
          }
        }
      }
    }
    
    // If single-letter IDs are exhausted, try double-letter prefixes
    const doublePrefixes = ['AA', 'AB', 'AC', 'AD', 'AE'];
    for (const prefix of doublePrefixes) {
      for (let num = 0; num <= 999; num++) {
        for (const letter of this.letters.slice(0, 10)) { // A-J only for performance
          for (let suffix = 1; suffix <= 99; suffix++) {
            const numStr = num.toString().padStart(3, '0');
            const suffixStr = suffix.toString().padStart(2, '0');
            const id = `${prefix}-${numStr}${letter}${suffixStr}`;
            
            if (!usedIDs.includes(id)) {
              return id;
            }
          }
        }
      }
    }
    
    // Fallback if all IDs are used (shouldn't happen in practice)
    return 'ZZZ-999z99';
  }
  
  // Validate customer ID format
  static validateID(id: string): boolean {
    const pattern = /^[A-Z]{1,4}-\d{3}[A-Z]\d{2}$/;
    return pattern.test(id);
  }
  
  // Parse customer ID components
  static parseID(id: string): {
    prefix: string;
    number: number;
    letter: string;
    suffix: number;
  } | null {
    if (!this.validateID(id)) return null;
    
    const match = id.match(/^([A-Z]{1,4})-(\d{3})([A-Z])(\d{2})$/);
    if (!match) return null;
    
    return {
      prefix: match[1],
      number: parseInt(match[2]),
      letter: match[3],
      suffix: parseInt(match[4])
    };
  }
  
  // Compare two customer IDs for sorting
  static compareIDs(id1: string, id2: string): number {
    const parsed1 = this.parseID(id1);
    const parsed2 = this.parseID(id2);
    
    if (!parsed1 || !parsed2) return 0;
    
    // Compare prefix length first
    if (parsed1.prefix.length !== parsed2.prefix.length) {
      return parsed1.prefix.length - parsed2.prefix.length;
    }
    
    // Compare prefix alphabetically
    if (parsed1.prefix !== parsed2.prefix) {
      return parsed1.prefix.localeCompare(parsed2.prefix);
    }
    
    // Compare number
    if (parsed1.number !== parsed2.number) {
      return parsed1.number - parsed2.number;
    }
    
    // Compare letter
    if (parsed1.letter !== parsed2.letter) {
      return parsed1.letter.localeCompare(parsed2.letter);
    }
    
    // Compare suffix
    return parsed1.suffix - parsed2.suffix;
  }
  
  // Generate a batch of IDs for preview (limited to prevent memory issues)
  static generatePreviewIDs(count: number = 10): string[] {
    const ids: string[] = [];
    const prefixes = ['A', 'B', 'C'];
    
    for (const prefix of prefixes) {
      for (let num = 0; num <= 5 && ids.length < count; num++) {
        for (const letter of this.letters.slice(0, 5)) {
          for (let suffix = 1; suffix <= 5 && ids.length < count; suffix++) {
            const numStr = num.toString().padStart(3, '0');
            const suffixStr = suffix.toString().padStart(2, '0');
            ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
          }
        }
      }
    }
    
    return ids.slice(0, count);
  }
}