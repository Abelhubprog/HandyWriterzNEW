import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  User, 
  Edit2, 
  Trash2, 
  Shield, 
  UserX,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { isAdmin, updateUserRole } from '@/lib/auth';
import { getAllUsers } from '@/lib/admin';
import { cloudflareDb } from '@/lib/cloudflare';

// User management dashboard component
const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [adminChecked, setAdminChecked] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/login'); // Redirect non-admins
      }
      setAdminChecked(true);
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  // Load users when admin status is confirmed
  useEffect(() => {
    if (!adminChecked) return;
    
    const loadUsers = async () => {
      setIsLoading(true);
      
      const { users, error } = await getAllUsers();
      
      if (error) {
      } else {
        setUsers(users || []);
      }
      
      setIsLoading(false);
    };
    
    loadUsers();
  }, [adminChecked]);
  
  // Filtered users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search query filter
    const matchesSearch = 
      !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    // Role filter
    const matchesRole =
      roleFilter === 'all' ||
      user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // Handle user roles
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      setIsLoading(true);
      
      const { user, error } = await updateUserRole(userId, newRole);
      
      if (error) {
        alert(`Error updating role: ${error.message}`);
      } else {
        // Update user in the list
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        ));
      }
      
      setIsLoading(false);
    }
  };
  
  // Handle user status toggle
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${statusText} this user?`)) {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', userId);
      
      if (error) {
        alert(`Error updating status: ${error.message}`);
      } else {
        // Update user in the list
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: newStatus }
            : user
        ));
      }
      
      setIsLoading(false);
    }
  };
  
  // Handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'role-user' | 'role-editor' | 'role-admin') => {
    if (selectedUsers.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (action === 'delete') {
        // In a real app, you might want to archive users instead of deleting them
        alert('User deletion is disabled in this demo for safety. In a real application, consider archiving users instead.');
      } else if (action === 'activate' || action === 'deactivate') {
        const isActive = action === 'activate';
        
        // Update status for each selected user
        for (const userId of selectedUsers) {
          await supabase
            .from('profiles')
            .update({ is_active: isActive })
            .eq('id', userId);
        }
        
        // Update the list
        setUsers(users.map(user => 
          selectedUsers.includes(user.id)
            ? { ...user, is_active: isActive }
            : user
        ));
      } else if (action.startsWith('role-')) {
        const role = action.replace('role-', '') as 'user' | 'editor' | 'admin';
        
        // Update role for each selected user
        for (const userId of selectedUsers) {
          await updateUserRole(userId, role);
        }
        
        // Update the list
        setUsers(users.map(user => 
          selectedUsers.includes(user.id)
            ? { ...user, role }
            : user
        ));
      }
      
      // Clear selection
      setSelectedUsers([]);
    } catch (error) {
      alert('An error occurred while performing the bulk action.');
    }
    
    setIsLoading(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (!adminChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </form>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-2 bg-gray-100 rounded-lg flex items-center gap-4">
          <span className="text-sm font-medium">{selectedUsers.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('role-user')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Set as User
            </button>
            <button
              onClick={() => handleBulkAction('role-editor')}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              Set as Editor
            </button>
            <button
              onClick={() => handleBulkAction('role-admin')}
              className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
            >
              Set as Admin
            </button>
          </div>
        </div>
      )}
      
      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600 mr-3"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-gray-500">No users found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar_url}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'editor' | 'user')}
                        className={`text-sm px-2 py-1 border rounded ${
                          user.role === 'admin' 
                            ? 'bg-amber-50 border-amber-200 text-amber-800' 
                            : user.role === 'editor'
                            ? 'bg-purple-50 border-purple-200 text-purple-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(user.last_login)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit User"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={`${
                            user.is_active
                              ? 'text-gray-500 hover:text-gray-700'
                              : 'text-green-500 hover:text-green-700'
                          }`}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.is_active ? (
                            <UserX className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
