import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    test('should merge class names', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    test('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      
      expect(result).toBe('base-class active-class');
    });

    test('should merge tailwind classes correctly', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4'); // px-4 overrides px-2
    });

    test('should handle arrays', () => {
      const result = cn(['text-sm', 'font-bold'], 'text-red-500');
      expect(result).toBe('text-sm font-bold text-red-500');
    });

    test('should handle objects', () => {
      const result = cn({
        'text-blue-500': true,
        'text-red-500': false,
        'font-bold': true,
      });
      
      expect(result).toBe('text-blue-500 font-bold');
    });

    test('should handle null and undefined', () => {
      const result = cn('base', null, undefined, 'end');
      expect(result).toBe('base end');
    });

    test('should handle empty strings', () => {
      const result = cn('', 'text-red-500', '');
      expect(result).toBe('text-red-500');
    });
  });
});

// Additional utility functions that would be in a real project
describe('Format Utils', () => {
  describe('formatCurrency', () => {
    test('should format BRL currency', () => {
      expect(formatCurrency(79.9, 'BRL')).toBe('R$ 79,90');
      expect(formatCurrency(1234.56, 'BRL')).toBe('R$ 1.234,56');
      expect(formatCurrency(0, 'BRL')).toBe('R$ 0,00');
    });

    test('should format USD currency', () => {
      expect(formatCurrency(79.9, 'USD')).toBe('$79.90');
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    test('should handle negative values', () => {
      expect(formatCurrency(-100, 'BRL')).toBe('-R$ 100,00');
      expect(formatCurrency(-50.5, 'USD')).toBe('-$50.50');
    });
  });

  describe('formatDate', () => {
    test('should format dates in pt-BR', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('15/01/2024');
      expect(formatDate(date, 'full')).toBe('15 de janeiro de 2024');
    });

    test('should format relative dates', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      expect(formatRelativeDate(yesterday)).toBe('ontem');
      expect(formatRelativeDate(lastWeek)).toContain('dias atrás');
    });

    test('should format time', () => {
      const date = new Date('2024-01-15T15:45:30');
      expect(formatTime(date)).toBe('15:45');
      expect(formatTime(date, true)).toBe('15:45:30');
    });
  });

  describe('formatNumber', () => {
    test('should format large numbers', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1000000)).toBe('1.000.000');
      expect(formatNumber(1234.56)).toBe('1.234,56');
    });

    test('should format with abbreviations', () => {
      expect(formatNumberShort(1000)).toBe('1K');
      expect(formatNumberShort(1500)).toBe('1.5K');
      expect(formatNumberShort(1000000)).toBe('1M');
      expect(formatNumberShort(1500000)).toBe('1.5M');
    });

    test('should format percentages', () => {
      expect(formatPercentage(0.15)).toBe('15%');
      expect(formatPercentage(0.1567)).toBe('15.67%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    test('should format bytes to human readable', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    test('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1536000)).toBe('1.46 MB');
    });
  });
});

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@company.co.uk',
        'first+last@email.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      const validPasswords = [
        'Test123!@#',
        'SecureP@ss123',
        'MyStr0ng!Pass',
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    test('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',
        'nouppercaseornumber!',
        'NoSpecialChar123',
        'NO LOWERCASE 123!',
        '12345678',
        '',
      ];

      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });

    test('should provide specific error messages', () => {
      expect(getPasswordError('short')).toContain('8 caracteres');
      expect(getPasswordError('nouppercase123!')).toContain('maiúscula');
      expect(getPasswordError('NOLOWERCASE123!')).toContain('minúscula');
      expect(getPasswordError('NoNumbers!')).toContain('número');
      expect(getPasswordError('NoSpecial123')).toContain('especial');
    });
  });

  describe('validateCPF', () => {
    test('should validate correct CPF', () => {
      const validCPFs = [
        '11144477735', // Without formatting
        '111.444.777-35', // With formatting
      ];

      validCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    test('should reject invalid CPF', () => {
      const invalidCPFs = [
        '00000000000',
        '11111111111',
        '12345678901',
        '111.444.777-36', // Wrong check digit
        'abc.def.ghi-jk',
        '',
      ];

      invalidCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });
  });
});

describe('String Utils', () => {
  describe('truncateText', () => {
    test('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
      expect(truncateText(longText, 50)).toBe(longText); // No truncation needed
    });

    test('should handle custom ellipsis', () => {
      const text = 'Truncate this text';
      expect(truncateText(text, 10, '***')).toBe('Truncate***');
    });
  });

  describe('slugify', () => {
    test('should create URL-safe slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This & That')).toBe('this-and-that');
      expect(slugify('Ação & Reação')).toBe('acao-and-reacao');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('capitalize', () => {
    test('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });

    test('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');
    });
  });
});

describe('Array Utils', () => {
  describe('chunk', () => {
    test('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(chunk(arr, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      expect(chunk(arr, 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
    });
  });

  describe('unique', () => {
    test('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('shuffle', () => {
    test('should randomize array order', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr);
      // Very unlikely to be in same order (but possible)
    });
  });
});

describe('Object Utils', () => {
  describe('pick', () => {
    test('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    test('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(omit(obj, ['b', 'd'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('deepClone', () => {
    test('should create deep copy', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });
  });
});

// Helper function implementations (these would be in actual utils files)
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

function formatDate(date: Date, format?: string): string {
  if (format === 'full') {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
  }
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `${days} dias atrás`;
}

function formatTime(date: Date, withSeconds = false): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds && { second: '2-digit' }),
  }).format(date);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatNumberShort(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(value * 100 % 1 === 0 ? 0 : 2)}%`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password: string): boolean {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

function getPasswordError(password: string): string {
  if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Senha deve conter letra maiúscula';
  if (!/[a-z]/.test(password)) return 'Senha deve conter letra minúscula';
  if (!/\d/.test(password)) return 'Senha deve conter número';
  if (!/[@$!%*?&]/.test(password)) return 'Senha deve conter caractere especial';
  return '';
}

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
}

function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáäâãåą]/g, 'a')
    .replace(/[èéëêę]/g, 'e')
    .replace(/[ìíïîį]/g, 'i')
    .replace(/[òóöôõø]/g, 'o')
    .replace(/[ùúüûų]/g, 'u')
    .replace(/[çć]/g, 'c')
    .replace(/[ñń]/g, 'n')
    .replace(/[ß]/g, 'ss')
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function capitalizeWords(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result as Omit<T, K>;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}