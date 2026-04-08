import {
  sanitizeFilename,
  formatFileSize,
  generateDefaultTitle,
  formatDate,
} from '../src/utils/pdfUtils';

describe('sanitizeFilename', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('My Document')).toBe('My_Document');
  });

  it('removes unsafe characters', () => {
    expect(sanitizeFilename('doc/file:name*test')).toBe('doc_file_name_test');
  });

  it('trims whitespace', () => {
    expect(sanitizeFilename('  hello  ')).toBe('hello');
  });

  it('limits length to 100 characters', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeFilename(long).length).toBe(100);
  });

  it('allows dots and hyphens', () => {
    expect(sanitizeFilename('file-name.pdf')).toBe('file-name.pdf');
  });
});

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});

describe('generateDefaultTitle', () => {
  it('returns a non-empty string', () => {
    const title = generateDefaultTitle();
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('starts with "Document_"', () => {
    const title = generateDefaultTitle();
    expect(title.startsWith('Document_')).toBe(true);
  });

  it('does not contain spaces', () => {
    const title = generateDefaultTitle();
    expect(title).not.toContain(' ');
  });
});

describe('formatDate', () => {
  it('returns a string for a valid ISO date', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes year information', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z');
    expect(result).toContain('2024');
  });
});
