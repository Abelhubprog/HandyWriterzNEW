import React, { useState, useEffect } from 'react';
import { d1Client } from '@/lib/d1Client';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useToast } from '@/components/ui/toast/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  service_id: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    service_id: ''
  });
  const { toast } = useToast();

  // Fetch categories and services
  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await d1Client
        .from('categories')
        .select(`
          *,
          services (
            id,
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .single();

      const { data } = result || {};
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const result = await d1Client
        .from('services')
        .select('*')
        .order('title')
        .single();

      const { data } = result || {};
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
    }
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.service_id) {
        toast({
          title: "Validation Error",
          description: "Name and service are required",
          variant: 'destructive'
        });
        return;
      }

      await d1Client
        .from('categories')
        .insert({
          name: newCategory.name,
          description: newCategory.description,
          service_id: newCategory.service_id,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, '-')
        })
        .single();

      toast({
        title: "Success",
        description: "Category created successfully"
      });

      setNewCategory({ name: '', description: '', service_id: '' });
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: 'destructive'
      });
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await d1Client
        .from('categories')
        .update(updates)
        .eq('id', id)
        .single();

      toast({
        title: "Success",
        description: "Category updated successfully"
      });

      setEditingId(null);
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await d1Client
        .from('categories')
        .delete()
        .eq('id', id)
        .single();

      toast({
        title: "Success",
        description: "Category deleted successfully"
      });

      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      </div>

      {/* Create new category form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Category</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Service
            </label>
            <select
              id="service"
              value={newCategory.service_id}
              onChange={(e) => setNewCategory(prev => ({ ...prev, service_id: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Create Category
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={category.name}
                      title={`Edit ${category.name}`}
                      aria-label={`Edit category name ${category.name}`}
                      onChange={(e) => {
                        const updatedCategories = categories.map(c =>
                          c.id === category.id ? { ...c, name: e.target.value } : c
                        );
                        setCategories(updatedCategories);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <select
                      value={category.service_id}
                      title="Select service"
                      aria-label="Select service for category"
                      onChange={(e) => {
                        const updatedCategories = categories.map(c =>
                          c.id === category.id ? { ...c, service_id: e.target.value } : c
                        );
                        setCategories(updatedCategories);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {services.find(s => s.id === category.service_id)?.title}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <textarea
                      value={category.description || ''}
                      title={`Edit description for ${category.name}`}
                      aria-label={`Edit category description for ${category.name}`}
                      onChange={(e) => {
                        const updatedCategories = categories.map(c =>
                          c.id === category.id ? { ...c, description: e.target.value } : c
                        );
                        setCategories(updatedCategories);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={2}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === category.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateCategory(category.id, category)}
                        className="text-green-600 hover:text-green-900"
                        title="Save changes"
                        aria-label="Save changes"
                      >
                        <FiSave className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel editing"
                        aria-label="Cancel editing"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingId(category.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title={`Edit ${category.name}`}
                        aria-label={`Edit category ${category.name}`}
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                        title={`Delete ${category.name}`}
                        aria-label={`Delete category ${category.name}`}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
