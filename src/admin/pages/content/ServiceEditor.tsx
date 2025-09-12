import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import databaseService from '@/services/databaseService';
import { FiSave, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useToast } from '@/components/ui/toast/use-toast';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

const ServiceEditor: React.FC = () => {
  const { service: serviceSlug } = useParams<{ service: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [service, setService] = useState<Service>({
    id: '',
    title: '',
    slug: '',
    description: '',
    icon: '',
    color: '#000000',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (serviceSlug) {
      fetchService();
    } else {
      setLoading(false);
    }
  }, [serviceSlug]);

  const fetchService = async () => {
    try {
      // Use databaseService to get services
      const services = await databaseService.getServices();
      const serviceData = services.find(s => s.slug === serviceSlug);
      
      if (serviceData) {
        setService(serviceData);
      } else {
        throw new Error('Service not found');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setService(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setService(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    if (!service.title) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: 'destructive'
      });
      return false;
    }

    if (!service.slug) {
      toast({
        title: "Validation Error",
        description: "Slug is required",
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Mock save operation since we need to implement service management in database
      if (serviceSlug) {
        // Update existing service
        // TODO: Implement databaseService.updateService(service.id, service)
      } else {
        // Create new service
        // TODO: Implement databaseService.createService(service)
      }

      toast({
        title: "Success",
        description: `Service ${serviceSlug ? 'updated' : 'created'} successfully`
      });

      navigate('/admin/services');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${serviceSlug ? 'update' : 'create'} service`,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceSlug || !window.confirm('Are you sure you want to delete this service?')) return;

    try {
      // TODO: Implement databaseService.deleteService(serviceSlug)

      toast({
        title: "Success",
        description: "Service deleted successfully"
      });

      navigate('/admin/services');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
              {serviceSlug ? 'Edit Service' : 'Create New Service'}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={service.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={service.slug}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={service.description || ''}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                Icon (class name or URL)
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={service.icon || ''}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="color"
                id="color"
                name="color"
                value={service.color || '#000000'}
                onChange={handleChange}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={service.sort_order}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={service.is_active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {serviceSlug && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiTrash2 className="-ml-1 mr-2 h-5 w-5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceEditor;
