import { env } from '@/env';

// Cloudflare D1 Database Client
export interface CloudflareDB {
  prepare(query: string): CloudflareStatement;
  batch(statements: CloudflareStatement[]): Promise<CloudflareResult[]>;
  exec(query: string): Promise<CloudflareExecResult>;
}

export interface CloudflareStatement {
  bind(...values: any[]): CloudflareStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<CloudflareResult>;
  all<T = any>(): Promise<CloudflareResult<T>>;
}

export interface CloudflareResult<T = any> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    size_after: number;
  };
}

export interface CloudflareExecResult {
  count: number;
  duration: number;
}

// Database connection - will be injected by Cloudflare Workers
declare const DB: CloudflareDB;

// Helper class to mimic Supabase-like API
export class CloudflareQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: string[] = [];
  private orderByClause: string = '';
  private limitClause: string = '';
  private values: any[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push(`${column} = ?`);
    this.values.push(value);
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push(`${column} != ?`);
    this.values.push(value);
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push(`${column} > ?`);
    this.values.push(value);
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push(`${column} >= ?`);
    this.values.push(value);
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push(`${column} < ?`);
    this.values.push(value);
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push(`${column} <= ?`);
    this.values.push(value);
    return this;
  }

  like(column: string, value: string) {
    this.whereConditions.push(`${column} LIKE ?`);
    this.values.push(value);
    return this;
  }

  in(column: string, values: any[]) {
    const placeholders = values.map(() => '?').join(', ');
    this.whereConditions.push(`${column} IN (${placeholders})`);
    this.values.push(...values);
    return this;
  }

  order(column: string, ascending: boolean = true) {
    this.orderByClause = `ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`;
    return this;
  }

  limit(count: number) {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }

  private buildQuery(operation: 'SELECT' | 'DELETE'): string {
    let query = '';
    
    if (operation === 'SELECT') {
      query = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    } else if (operation === 'DELETE') {
      query = `DELETE FROM ${this.tableName}`;
    }

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }

    if (this.limitClause) {
      query += ` ${this.limitClause}`;
    }

    return query;
  }

  async execute(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const query = this.buildQuery('SELECT');
      const stmt = DB.prepare(query).bind(...this.values);
      const result = await stmt.all();

      if (result.success) {
        return { data: result.results || [], error: null };
      } else {
        return { data: null, error: result.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async single(): Promise<{ data: any | null; error: string | null }> {
    this.limit(1);
    const result = await this.execute();
    return {
      data: result.data && result.data.length > 0 ? result.data[0] : null,
      error: result.error
    };
  }

  async delete(): Promise<{ error: string | null }> {
    try {
      const query = this.buildQuery('DELETE');
      const stmt = DB.prepare(query).bind(...this.values);
      const result = await stmt.run();

      if (result.success) {
        return { error: null };
      } else {
        return { error: result.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  update(data: Record<string, any>) {
    return new CloudflareUpdateBuilder(this.tableName, data, this.whereConditions, this.values);
  }
}

// Insert/Update operations
export class CloudflareInsertBuilder {
  private tableName: string;
  private data: Record<string, any> = {};

  constructor(tableName: string, data: Record<string, any>) {
    this.tableName = tableName;
    this.data = data;
  }

  async execute(): Promise<{ data: any | null; error: string | null }> {
    try {
      const columns = Object.keys(this.data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(this.data);

      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const stmt = DB.prepare(query).bind(...values);
      const result = await stmt.run();

      if (result.success) {
        return { data: { id: result.meta.last_row_id, ...this.data }, error: null };
      } else {
        return { data: null, error: result.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export class CloudflareUpsertBuilder {
  private tableName: string;
  private data: Record<string, any> = {};

  constructor(tableName: string, data: Record<string, any>) {
    this.tableName = tableName;
    this.data = data;
  }

  async execute(): Promise<{ data: any | null; error: string | null }> {
    try {
      const columns = Object.keys(this.data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(this.data);
      
      // Use INSERT OR REPLACE for upsert functionality
      const query = `INSERT OR REPLACE INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const stmt = DB.prepare(query).bind(...values);
      const result = await stmt.run();

      if (result.success) {
        return { data: { id: result.meta.last_row_id, ...this.data }, error: null };
      } else {
        return { data: null, error: result.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Update operations
export class CloudflareUpdateBuilder {
  private tableName: string;
  private data: Record<string, any> = {};
  private whereConditions: string[];
  private values: any[];

  constructor(tableName: string, data: Record<string, any>, whereConditions: string[], values: any[]) {
    this.tableName = tableName;
    this.data = data;
    this.whereConditions = whereConditions;
    this.values = values;
  }

  async execute(): Promise<{ error: string | null }> {
    try {
      const setClause = Object.keys(this.data).map(key => `${key} = ?`).join(', ');
      const updateValues = [...Object.values(this.data), ...this.values];
      
      let query = `UPDATE ${this.tableName} SET ${setClause}`;
      
      if (this.whereConditions.length > 0) {
        query += ` WHERE ${this.whereConditions.join(' AND ')}`;
      }

      const stmt = DB.prepare(query).bind(...updateValues);
      const result = await stmt.run();

      if (result.success) {
        return { error: null };
      } else {
        return { error: result.error || 'Unknown error' };
      }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Main Cloudflare client that mimics Supabase API
export class CloudflareClient {
  from(tableName: string) {
    return new CloudflareQueryBuilder(tableName);
  }

  insert(tableName: string, data: Record<string, any>) {
    return new CloudflareInsertBuilder(tableName, data);
  }

  upsert(tableName: string, data: Record<string, any>) {
    return new CloudflareUpsertBuilder(tableName, data);
  }

  // Storage operations for Cloudflare R2
  storage = {
    from: (bucketName: string) => ({
      upload: async (path: string, file: File | Blob): Promise<{ data: any | null; error: string | null }> => {
        try {
          // This would integrate with Cloudflare R2 API
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`/api/storage/${bucketName}/${path}`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            return { data, error: null };
          } else {
            const errorText = await response.text();
            return { data: null, error: errorText };
          }
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          };
        }
      },      getPublicUrl: (path: string) => {
        return {
          data: { publicUrl: `https://your-r2-domain.com/${path}` }
        };
      },

      createSignedUrl: async (path: string, expiresIn: number = 3600): Promise<{ data: any | null; error: string | null }> => {
        try {
          const response = await fetch('/api/storage/signed-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path, expiresIn }),
          });

          if (response.ok) {
            const data = await response.json();
            return { data, error: null };
          } else {
            const errorText = await response.text();
            return { data: null, error: errorText };
          }
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Failed to create signed URL' 
          };
        }
      }
    })
  };
}

// Export the main client instance
export const cloudflare = new CloudflareClient();

// Helper function for safe queries with error handling
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: string | null }>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    return await queryFn();
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
};

// Export types for use in other files
export type { CloudflareDB, CloudflareStatement, CloudflareResult };
