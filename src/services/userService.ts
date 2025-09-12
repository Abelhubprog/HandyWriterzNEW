import databaseService from '@/services/databaseService';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'author' | 'user';
  status: 'active' | 'inactive' | 'pending';
  bio?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export const userService = {
  /**
   * Get users with filters and pagination
   */
  async getUsers(filters: UserFilters = {}, page = 1, pageSize = 10) {
    try {
      let users = await databaseService.read('profiles');

      // Apply filters
      if (filters.role) {
        users = users.filter(user => user.role === filters.role);
      }

      if (filters.status) {
        users = users.filter(user => user.status === filters.status);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        users = users.filter(user =>
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = users.length;
      const offset = (page - 1) * pageSize;
      const paginatedUsers = users.slice(offset, offset + pageSize);

      return {
        data: paginatedUsers,
        count: total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  },

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const users = await databaseService.read('profiles', { id });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create user profile
   */
  async createUser(userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const newUser = {
        full_name: userData.full_name || '',
        email: userData.email || '',
        avatar_url: userData.avatar_url,
        role: userData.role || 'user',
        status: userData.status || 'active',
        bio: userData.bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await databaseService.create('profiles', newUser);
      return result;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const updateData = {
        ...userData,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await databaseService.update('profiles', id, updateData);
      
      // Return updated user
      return await this.getUser(id);
    } catch (error) {
      return null;
    }
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      await databaseService.delete('profiles', id);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(id: string, role: string): Promise<boolean> {
    try {
      await databaseService.update('profiles', id, {
        role,
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update user status
   */
  async updateUserStatus(id: string, status: string): Promise<boolean> {
    try {
      await databaseService.update('profiles', id, {
        status,
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<boolean> {
    try {
      await databaseService.update('profiles', id, {
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    try {
      const users = await databaseService.read('profiles');
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        pending: users.filter(u => u.status === 'pending').length,
        admins: users.filter(u => u.role === 'admin').length,
        editors: users.filter(u => u.role === 'editor').length,
        authors: users.filter(u => u.role === 'author').length,
        users: users.filter(u => u.role === 'user').length
      };

      return stats;
    } catch (error) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        admins: 0,
        editors: 0,
        authors: 0,
        users: 0
      };
    }
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const users = await databaseService.read('profiles');
      
      const searchLower = query.toLowerCase();
      return users.filter(user =>
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      return [];
    }
  }
};

export default userService;