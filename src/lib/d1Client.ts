// Cloudflare D1 database client
// This replaces the Supabase client

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = any>(): Promise<D1Result<T>>;
}

interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface D1ExecResult {
  success: boolean;
  meta: {
    duration: number;
  };
}

// Check if running in development mode
const isDevelopmentMode = (): boolean => {
  return import.meta.env.MODE === 'development' || 
         typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1');
};

// Get the database API URL
const getDatabaseApiUrl = (): string => {
  // Use local API in development, production API in production
  if (isDevelopmentMode()) {
    return 'http://localhost:8788/api/database';
  }
  
  return import.meta.env.VITE_CLOUDFLARE_DATABASE_URL || 
         `${window.location.origin}/api/database`;
};

// D1 client that works in both development and production
class MockD1Client {
  private db: D1Database | null = null;

  constructor() {
    // In development, we'll use a mock implementation
    // In production with Cloudflare Workers, this will use the actual D1 binding
    if (typeof window !== 'undefined') {
      // Browser environment - use IndexedDB or localStorage as fallback
      this.initializeMockDatabase();
    }
  }

  private initializeMockDatabase() {
    // Mock implementation for development
    this.db = {
      prepare: (query: string) => ({
        bind: (...values: any[]) => ({
          first: async () => null,
          run: async () => ({ success: true, meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 0, rows_written: 0 } }),
          all: async () => ({ results: [], success: true, meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 0, rows_written: 0 } }),
          bind: (...args: any[]) => this
        } as any),
        first: async () => null,
        run: async () => ({ success: true, meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 0, rows_written: 0 } }),
        all: async () => ({ results: [], success: true, meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 0, rows_written: 0 } })
      }),
      exec: async () => ({ success: true, meta: { duration: 0 } }),
      batch: async () => []
    };
  }

  // Helper method to call the database API
  private async callDatabaseApi(path: string, method: string, body?: any): Promise<any> {
    try {
      // In development mode, use mock data
      if (isDevelopmentMode() && typeof window !== 'undefined') {
        
        // Add mock data for various tables in development mode
        if (path.startsWith('/query/profiles')) {
          // Extract user_id from filter if present
          let userId = 'mock-user-id';
          try {
            if (path.includes('filter=')) {
              const filterParam = new URLSearchParams(path.split('?')[1]).get('filter');
              if (filterParam) {
                const filters = JSON.parse(filterParam);
                const userIdFilter = filters.find((f: any) => f.column === 'id');
                if (userIdFilter) userId = userIdFilter.value;
              }
            }
          } catch (e) {
          }
          
          return {
            data: [{
              id: userId,
              full_name: 'Test User',
              avatar_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
              email: 'test@example.com',
              created_at: new Date().toISOString(),
              phone: '+1234567890',
              bio: 'This is a mock user profile for development.',
              notification_preferences: {
                email: true,
                push: true,
                sms: false
              }
            }],
            error: null
          };
        }
        
        return { data: [], error: null };
      }
      
      // In production, call the real API
      const url = `${getDatabaseApiUrl()}${path}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
  
  // Supabase-compatible API methods
  from(table: string) {
    return {
      select: (columns = '*') => {
        let filters = [];
        let orderColumn = '';
        let orderAscending = true;
        let limitValue = 0;
        let offsetValue = 0;
        
        const selectObj = {
          eq: (column: string, value: any) => {
            // Store the filter for later chaining
            filters.push({ column, operator: '=', value });
            
            return {
              single: async () => {
                // Call API with filter
                const params = new URLSearchParams({
                  filter: JSON.stringify(filters),
                  limit: '1'
                });
                
                const result = await this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
                return { 
                  data: result.data?.[0] || null, 
                  error: result.error 
                };
              },
              limit: (count: number) => {
                limitValue = count;
                return {
                  single: async () => {
                    // Call API with filter and limit
                    const params = new URLSearchParams({
                      filter: JSON.stringify(filters),
                      limit: '1'
                    });
                    
                    const result = await this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
                    return { 
                      data: result.data?.[0] || null, 
                      error: result.error 
                    };
                  }
                };
              },
              order: (column: string, options?: { ascending?: boolean }) => {
                orderColumn = column;
                orderAscending = options?.ascending !== false;
                
                // Call API with filter and order
                const params = new URLSearchParams({
                  filter: JSON.stringify(filters),
                  orderBy: column,
                  ascending: String(orderAscending)
                });
                
                if (limitValue > 0) {
                  params.append('limit', String(limitValue));
                }
                
                return this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
              }
            };
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            orderColumn = column;
            orderAscending = options?.ascending !== false;
            
            // Call API with order
            const params = new URLSearchParams({
              orderBy: column,
              ascending: String(orderAscending)
            });
            
            if (limitValue > 0) {
              params.append('limit', String(limitValue));
            }
            
            return this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
          },
          range: (from: number, to: number) => {
            offsetValue = from;
            limitValue = to - from + 1;
            
            return {
              order: (column: string, options?: { ascending?: boolean }) => {
                orderColumn = column;
                orderAscending = options?.ascending !== false;
                
                return {
                  single: async () => {
                    // Call API with range, order
                    const params = new URLSearchParams({
                      orderBy: column,
                      ascending: String(orderAscending),
                      limit: String(limitValue),
                      offset: String(offsetValue)
                    });
                    
                    const result = await this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
                    return { data: result.data, error: result.error };
                  }
                };
              }
            };
          },
          single: async () => {
            // Call API for single record
            const params = new URLSearchParams({
              limit: '1'
            });
            
            const result = await this.callDatabaseApi(`/query/${table}?${params}`, 'GET');
            return { 
              data: result.data?.[0] || null, 
              error: result.error 
            };
          },
          limit: (count: number) => {
            limitValue = count;
            return selectObj;
          }
        };
        
        return selectObj;
      },
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            // Insert and return the inserted record
            return await this.callDatabaseApi(`/insert/${table}`, 'POST', { data });
          }
        }),
        single: async () => {
          // Just insert
          return await this.callDatabaseApi(`/insert/${table}`, 'POST', { data });
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          execute: async () => {
            // Update with filter
            const filter = [{ column, value }];
            return await this.callDatabaseApi(`/update/${table}`, 'PUT', { data, filter });
          },
          single: async () => {
            // Update with filter, return single
            const filter = [{ column, value }];
            return await this.callDatabaseApi(`/update/${table}`, 'PUT', { data, filter });
          }
        }),
        single: async () => {
          // Update without filter
          return await this.callDatabaseApi(`/update/${table}`, 'PUT', { data });
        }
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            // Delete with filter
            const filter = [{ column, value }];
            return await this.callDatabaseApi(`/delete/${table}`, 'DELETE', { filter });
          }
        })
      }),
      upsert: (data: any) => ({
        single: async () => {
          // Use custom SQL for upsert
          // This is simplified and may need adjustment based on your schema
          const table_columns = Object.keys(data).join(',');
          const values = Object.values(data);
          const placeholders = values.map(() => '?').join(',');
          
          const sql = `
            INSERT INTO ${table} (${table_columns})
            VALUES (${placeholders})
            ON CONFLICT DO UPDATE SET
            ${Object.keys(data).map(k => `${k} = EXCLUDED.${k}`).join(', ')}
            RETURNING *
          `;
          
          return await this.callDatabaseApi(`/sql`, 'POST', { 
            sql, 
            params: values 
          });
        }
      })
    };
  }

  // Auth API (will be handled by Clerk)
  get auth() {
    return {
      signUp: async (options: { email: string; password: string }) => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async (options: { email: string; password: string }) => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null })
    };
  }

  // Storage API (will use Cloudflare R2)
  get storage() {
    return {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => ({ data: null, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        remove: async (paths: string[]) => ({ data: null, error: null })
      })
    };
  }

  // RPC functions
  rpc(functionName: string, params?: any) {
    return {
      single: async () => ({ data: null, error: null })
    };
  }
  
  // Realtime functionality (mock implementation)
  channel(channelName: string) {
    
    // Store callbacks to simulate realtime events
    const callbacks: {event: string; filter: any; callback: Function}[] = [];
    
    // Create a channel object that supports proper chaining
    const channelObj = {
      on: (event: string, filter: any, callback: (payload: any) => void) => {
        // Store the callback for potential future use
        callbacks.push({ event, filter, callback });
        // Return the channel object itself to allow chaining
        return channelObj;
      },
      subscribe: () => {
        
        // Simulate an initial message if this is messages table
        // This helps verify the subscription is working
        if (callbacks.length > 0 && callbacks[0].filter?.table === 'messages') {
          setTimeout(() => {
            try {
              const mockPayload = { 
                new: { 
                  id: `mock-${Date.now()}`,
                  content: 'This is a simulated message from the mock service',
                  user_id: callbacks[0].filter?.filter?.split('=')[1]?.replace(/['"`]/g, '') || 'unknown',
                  sender_type: 'system',
                  created_at: new Date().toISOString(),
                  is_read: false
                }
              };
              callbacks[0].callback(mockPayload);
            } catch (err) {
            }
          }, 2000); // Send after 2 seconds
        }
        
        return { 
          channel: channelName, 
          status: 'SUBSCRIBED',
          // Store subscription details for potential future use
          _callbacks: callbacks
        };
      }
    };
    
    return channelObj;
  }
  
  removeChannel(subscription: any) {
    return true;
  }
}

// Export the client
export const d1Client = new MockD1Client();

// Backward compatibility - export as supabase
export const supabase = d1Client;
export default d1Client;
