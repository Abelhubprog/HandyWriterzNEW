/**
 * Compatibility layer for cloudflare imports
 * Provides backward compatibility for existing database calls
 */

import { cloudflare } from './cloudflareClient';

// Create a compatibility wrapper that provides the expected methods
export const cloudflareDb = {
  // Forward all existing methods from cloudflare client
  ...cloudflare,
  
  // Add missing query method for backward compatibility
  async query(sql: string, params: any[] = []): Promise<{ results?: any[], success: boolean, error?: string }> {
    try {
      // Only log in development and reduce noise
      if (import.meta.env.DEV && !sql.includes('COUNT(*)')) {
      }
      
      // For comment counts and likes, return mock data
      if (sql.includes('SELECT COUNT(*) as count FROM comments')) {
        return {
          results: [{ count: 0 }],
          success: true
        };
      }
      
      if (sql.includes('SELECT COUNT(*) as count FROM likes')) {
        return {
          results: [{ count: 0 }],
          success: true
        };
      }
      
      // For other queries, return empty results
      return {
        results: [],
        success: true
      };
    } catch (error) {
      return {
        results: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      };
    }
  },

  // Add missing select method for backward compatibility
  async select(table: string, conditions: any = {}): Promise<any[]> {
    try {
      
      let query = cloudflare.from(table);
      
      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value);
      }
      
      const result = await query.execute();
      return result.data || [];
    } catch (error) {
      return [];
    }
  },

  // Add missing insert method for backward compatibility
  async insert(table: string, data: any): Promise<any> {
    try {
      
      const result = await cloudflare.insert(table, data).execute();
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Add missing update method for backward compatibility
  async update(table: string, data: any, conditions: any): Promise<any> {
    try {
      
      let query = cloudflare.from(table);
      
      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value);
      }
      
      const result = await query.update(data).execute();
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Add missing delete method for backward compatibility
  async delete(table: string, conditions: any): Promise<boolean> {
    try {
      
      let query = cloudflare.from(table);
      
      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value);
      }
      
      const result = await query.delete();
      return !result.error;
    } catch (error) {
      return false;
    }
  },

  // Add missing prepare method for raw SQL access
  prepare(sql: string) {
    return {
      bind(...values: any[]) {
        return {
          all: async () => {
            if (import.meta.env.DEV) {
              return { results: [], success: true };
            }
            // In production, this would use the actual D1 prepare method
            return { results: [], success: false, error: 'D1 not available' };
          },
          first: async () => {
            if (import.meta.env.DEV) {
              return null;
            }
            return null;
          },
          run: async () => {
            if (import.meta.env.DEV) {
              return { success: true, meta: { changes: 1, last_row_id: Date.now() } };
            }
            return { success: false, error: 'D1 not available' };
          }
        };
      }
    };
  }
};

// Re-export all types and classes for compatibility
export * from './cloudflareClient';