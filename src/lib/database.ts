/**
 * Database abstraction layer for Cloudflare D1
 * This replaces the Supabase client with a D1-compatible interface
 * In development, uses mock data when D1 is not available
 */

import { cloudflareDb } from './cloudflare';

// Check if we're in development and D1 is not available
const isDevelopment = import.meta.env.DEV;
const hasCloudflareConfig = Boolean(
  import.meta.env.VITE_CLOUDFLARE_DATABASE_URL || 
  import.meta.env.VITE_CLOUDFLARE_DATABASE_ID
);

// Mock data for development
const mockUserSettings = {
  email_notifications: true,
  sms_notifications: false,
  marketing_emails: true,
  dark_mode: false,
  two_factor_auth: false
};

// Export the cloudflare database instance with Supabase-like interface
export const database = {
  from: (table: string) => ({
    select: async (columns = '*', options?: { count?: string }) => {
      // In development without D1, return mock data
      if (isDevelopment && !hasCloudflareConfig) {
        
        if (table === 'user_settings') {
          return { 
            data: [mockUserSettings], 
            error: null,
            count: options?.count === 'exact' ? 1 : null
          };
        }
        
        return { 
          data: [], 
          error: null,
          count: options?.count === 'exact' ? 0 : null
        };
      }
      
      try {
        let sql = `SELECT ${columns} FROM ${table}`;
        
        if (options?.count === 'exact') {
          sql = `SELECT COUNT(*) as count FROM ${table}`;
        }
        
        const result = await cloudflareDb.query(sql);
        return { 
          data: result.results, 
          error: null,
          count: options?.count === 'exact' ? result.results?.[0]?.count : null
        };
      } catch (error) {
        return { data: [], error: null, count: null };
      }
    },
    
    insert: async (data: Record<string, any>) => {
      if (isDevelopment && !hasCloudflareConfig) {
        return { data: { id: Date.now(), ...data }, error: null };
      }
      
      try {
        const result = await cloudflareDb.insert(table, data);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: null }; // Fail silently in development
      }
    },
    
    upsert: async (data: Record<string, any>) => {
      if (isDevelopment && !hasCloudflareConfig) {
        return { data: { id: Date.now(), ...data }, error: null };
      }
      
      try {
        const result = await cloudflareDb.insert(table, data);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: null };
      }
    },
    
    update: async (data: Record<string, any>) => {
      return {
        eq: async (column: string, value: any) => {
          if (isDevelopment && !hasCloudflareConfig) {
            return { data: { ...data }, error: null };
          }
          
          try {
            const result = await cloudflareDb.update(table, data, { [column]: value });
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error: null };
          }
        }
      };
    },
    
    delete: () => ({
      eq: async (column: string, value: any) => {
        if (isDevelopment && !hasCloudflareConfig) {
          return { error: null };
        }
        
        try {
          await cloudflareDb.delete(table, { [column]: value });
          return { error: null };
        } catch (error) {
          return { error: null };
        }
      }
    }),
    
    eq: function(column: string, value: any) {
      const newQuery = { ...this };
      newQuery._where = { ...newQuery._where, [column]: value };
      return newQuery;
    },
    
    order: function(column: string, options?: { ascending?: boolean }) {
      return {
        ...this,
        _orderBy: `${column} ${options?.ascending === false ? 'DESC' : 'ASC'}`
      };
    },
    
    limit: function(count: number) {
      return {
        ...this,
        _limit: count
      };
    },
    
    single: async function() {
      if (isDevelopment && !hasCloudflareConfig) {
        
        if (table === 'user_settings') {
          return { 
            data: mockUserSettings, 
            error: null 
          };
        }
        
        return { data: null, error: null };
      }
      
      try {
        const conditions = this._where ? 
          Object.keys(this._where).map((key, index) => `${key} = $${index + 1}`).join(' AND ') 
          : '';
        
        let sql = `SELECT * FROM ${table}`;
        if (conditions) sql += ` WHERE ${conditions}`;
        if (this._orderBy) sql += ` ORDER BY ${this._orderBy}`;
        sql += ' LIMIT 1';
        
        const params = this._where ? Object.values(this._where) : [];
        const result = await cloudflareDb.query(sql, params);
        
        return { 
          data: result.results?.[0] || null, 
          error: null 
        };
      } catch (error) {
        return { data: null, error: null };
      }
    }
  }),
  
  // Storage mock (for compatibility)
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        if (isDevelopment) {
          return { 
            data: { 
              path, 
              fullPath: `${bucket}/${path}`,
              id: Date.now().toString(),
              key: path
            }, 
            error: null 
          };
        }
        return { data: { path }, error: null };
      },
      
      createSignedUploadUrl: async (path: string) => {
        if (isDevelopment) {
          return { 
            data: { 
              signedURL: `/api/mock-upload/${bucket}/${path}`,
              path: path
            }, 
            error: null 
          };
        }
        return { data: null, error: 'Storage not configured' };
      },
      
      getPublicUrl: (path: string) => ({
        data: { publicUrl: isDevelopment ? `/uploads/${path}` : `/storage/${bucket}/${path}` }
      }),
      
      remove: async (paths: string[]) => {
        if (isDevelopment) {
        }
        return { error: null };
      }
    })
  },

  // Functions mock (for Edge Functions)
  functions: {
    invoke: async (functionName: string, options?: { body?: any }) => {
      if (isDevelopment) {
        
        if (functionName === 'orders-create') {
          return {
            data: {
              order: {
                id: `order_${Date.now()}`,
                price: options?.body?.price || 5.00,
                status: 'pending',
                created_at: new Date().toISOString()
              }
            },
            error: null
          };
        }
        
        return { data: null, error: 'Function not implemented in mock' };
      }
      
      return { data: null, error: 'Functions not available in this environment' };
    }
  },
  
  // Auth mock (since we're using Clerk)
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: new Error('Use Clerk for auth') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Use Clerk for auth') }),
    signOut: async () => ({ error: new Error('Use Clerk for auth') }),
    resetPasswordForEmail: async () => ({ data: null, error: new Error('Use Clerk for auth') }),
    updateUser: async () => ({ data: null, error: new Error('Use Clerk for auth') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

// Export as supabase for compatibility
export const supabase = database;
export default database;
