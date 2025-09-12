/**
 * Utility functions for formatting data
 */

/**
 * Format a service name by capitalizing each word and replacing hyphens with spaces
 * @param serviceName - The service name to format (e.g., 'adult-health-nursing')
 * @returns The formatted service name (e.g., 'Adult Health Nursing')
 */
export const formatServiceName = (serviceName: string): string => {
  if (!serviceName) return '';
  
  return serviceName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a date string into a readable format
 * @param dateString - The date string to format
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns The formatted date string
 */
export const formatDate = (dateString: string | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options || defaultOptions);
};

/**
 * Format a number as a file size with appropriate units
 * @param bytes - The number of bytes
 * @param decimals - Number of decimal places to show
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Calculate estimated reading time for content
 * @param content Text content to calculate reading time for
 * @param wordsPerMinute Average reading speed (default: 200 words per minute)
 * @returns Reading time in minutes
 */
export const calculateReadTime = (content: string, wordsPerMinute = 200): number => {
  if (!content) return 0;
  
  // Strip HTML tags if present
  const text = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Count words (split by whitespace)
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
};

/**
 * Format a number with commas
 * @param number Number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format a price in the specified currency
 * @param amount Amount to format
 * @param currency Currency code (default: 'USD')
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Truncate text to a specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Convert a string to title case
 * @param text Text to convert
 * @returns Text in title case
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Create a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns The slugified string
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

/**
 * Format duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};