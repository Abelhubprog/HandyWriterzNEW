import { D1Database } from '@cloudflare/workers-types';
import { authenticateUser, createErrorResponse, createSuccessResponse } from './auth';

interface Env {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // Authenticate user for all database operations
    const authResult = await authenticateUser(request, env);
    if (!authResult.success) {
      return createErrorResponse(
        authResult.error.message, 
        authResult.error.status, 
        authResult.error.code
      );
    }
    
    // Parse request body if present
    const requestBody = request.method !== 'GET' ? await request.json() : null;
    
    // Extract operation details from the URL or body
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/database', '');
    const pathParts = path.split('/').filter(Boolean);
    
    // Handle database operations based on path and method
    if (request.method === 'GET') {
      // Query operations
      if (pathParts[0] === 'query') {
        const table = pathParts[1];
        const params = Object.fromEntries(url.searchParams);
        
        // Basic query functionality
        let query = `SELECT * FROM ${table}`;
        const values = [];
        
        // Handle filtering
        if (params.filter) {
          const filters = JSON.parse(params.filter);
          if (filters.length > 0) {
            query += ' WHERE ';
            query += filters.map((f, i) => {
              values.push(f.value);
              return `${f.column} = ?`;
            }).join(' AND ');
          }
        }
        
        // Handle ordering
        if (params.orderBy) {
          query += ` ORDER BY ${params.orderBy} ${params.ascending === 'true' ? 'ASC' : 'DESC'}`;
        }
        
        // Handle pagination
        if (params.limit) {
          query += ` LIMIT ${parseInt(params.limit, 10)}`;
          if (params.offset) {
            query += ` OFFSET ${parseInt(params.offset, 10)}`;
          }
        }
        
        // Execute query
        const stmt = env.DB.prepare(query);
        const result = values.length > 0 ? await stmt.bind(...values).all() : await stmt.all();
        
        return createSuccessResponse({ data: result.results });
      }
    } 
    else if (request.method === 'POST') {
      // Insert operations
      if (pathParts[0] === 'insert') {
        const table = pathParts[1];
        const data = requestBody.data;
        
        // Prepare columns and values for INSERT
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(col => data[col]);
        
        // Build and execute INSERT query
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...values).all();
        
        return createSuccessResponse({ data: result.results[0] });
      }
      // Custom SQL operations
      else if (pathParts[0] === 'sql') {
        const { sql, params } = requestBody;
        
        // Execute custom SQL
        const stmt = env.DB.prepare(sql);
        const result = params ? await stmt.bind(...params).all() : await stmt.all();
        
        return createSuccessResponse({ data: result.results });
      }
    }
    else if (request.method === 'PUT') {
      // Update operations
      if (pathParts[0] === 'update') {
        const table = pathParts[1];
        const { data, filter } = requestBody;
        
        // Prepare SET clause and WHERE clause
        const setColumns = Object.keys(data).map(col => `${col} = ?`).join(', ');
        const setValues = Object.values(data);
        
        let whereClause = '';
        let whereValues = [];
        
        if (filter) {
          whereClause = ' WHERE ' + filter.map(f => `${f.column} = ?`).join(' AND ');
          whereValues = filter.map(f => f.value);
        }
        
        // Build and execute UPDATE query
        const query = `UPDATE ${table} SET ${setColumns}${whereClause} RETURNING *`;
        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...[...setValues, ...whereValues]).all();
        
        return createSuccessResponse({ data: result.results[0] });
      }
    }
    else if (request.method === 'DELETE') {
      // Delete operations
      if (pathParts[0] === 'delete') {
        const table = pathParts[1];
        const filter = requestBody.filter;
        
        // Build WHERE clause
        let whereClause = '';
        let whereValues = [];
        
        if (filter) {
          whereClause = ' WHERE ' + filter.map(f => `${f.column} = ?`).join(' AND ');
          whereValues = filter.map(f => f.value);
        }
        
        // Build and execute DELETE query
        const query = `DELETE FROM ${table}${whereClause} RETURNING *`;
        const stmt = env.DB.prepare(query);
        const result = whereValues.length > 0 ? await stmt.bind(...whereValues).all() : await stmt.all();
        
        return createSuccessResponse({ data: result.results });
      }
    }
    
    // Default response for unhandled routes
    return createErrorResponse(
      'Invalid operation', 
      400, 
      'INVALID_OPERATION'
    );
  } catch (error) {
    console.error('Database API error:', error);
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
};