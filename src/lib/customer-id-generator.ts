// Customer ID Generator Utility
export class CustomerIDGenerator {
  private static letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Generate all possible customer IDs in the format A-000a01 to ZZZZ-999z99
  static generateAllIDs(): string[] {
    const ids: string[] = [];
    
    // Single letter prefix (A-Z)
    for (let prefix of this.letters) {
      for (let num = 0; num <= 999; num++) {
        for (let letter of this.letters) {
          for (let suffix = 1; suffix <= 99; suffix++) {
            const numStr = num.toString().padStart(3, '0');
            const suffixStr = suffix.toString().padStart(2, '0');
            ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
          }
        }
      }
    }
    
    // Double letter prefix (AA-ZZ)
    for (let firstLetter of this.letters) {
      for (let secondLetter of this.letters) {
        const prefix = firstLetter + secondLetter;
        for (let num = 0; num <= 999; num++) {
          for (let letter of this.letters) {
            for (let suffix = 1; suffix <= 99; suffix++) {
              const numStr = num.toString().padStart(3, '0');
              const suffixStr = suffix.toString().padStart(2, '0');
              ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
            }
          }
        }
      }
    }
    
    // Triple letter prefix (AAA-ZZZ)
    for (let firstLetter of this.letters) {
      for (let secondLetter of this.letters) {
        for (let thirdLetter of this.letters) {
          const prefix = firstLetter + secondLetter + thirdLetter;
          for (let num = 0; num <= 999; num++) {
            for (let letter of this.letters) {
              for (let suffix = 1; suffix <= 99; suffix++) {
                const numStr = num.toString().padStart(3, '0');
                const suffixStr = suffix.toString().padStart(2, '0');
                ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
              }
            }
          }
        }
      }
    }
    
    // Four letter prefix (AAAA-ZZZZ)
    for (let firstLetter of this.letters) {
      for (let secondLetter of this.letters) {
        for (let thirdLetter of this.letters) {
          for (let fourthLetter of this.letters) {
            const prefix = firstLetter + secondLetter + thirdLetter + fourthLetter;
            for (let num = 0; num <= 999; num++) {
              for (let letter of this.letters) {
                for (let suffix = 1; suffix <= 99; suffix++) {
                  const numStr = num.toString().padStart(3, '0');
                  const suffixStr = suffix.toString().padStart(2, '0');
                  ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
                }
              }
            }
          }
        }
      }
    }
    
    return ids;
  }
  
  // Generate next available customer ID
  static generateNextID(usedIDs: string[]): string {
    const allIDs = this.generateAllIDs();
    const availableIDs = allIDs.filter(id => !usedIDs.includes(id));
    return availableIDs[0] || 'ZZZZ-999z99'; // Fallback if all IDs are used
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
}