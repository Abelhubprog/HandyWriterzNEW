import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cloudflareDb } from '@/lib/cloudflare';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  _count?: {
    categories: number;
    content: number;
  };
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Get services data
      const servicesData = await cloudflareDb.select('services');

      // Get categories count for each service
      const categoriesCountQuery = await cloudflareDb.query(
        'SELECT service_id, COUNT(*) as count FROM categories GROUP BY service_id'
      );

      // Get content count for each service  
      const contentCountQuery = await cloudflareDb.query(
        'SELECT service_id, COUNT(*) as count FROM posts GROUP BY service_id'
      );

      const categoriesCount = categoriesCountQuery.results || [];
      const contentCount = contentCountQuery.results || [];

      // Combine the data
      const servicesWithCounts = servicesData.map((service: Service) => ({
        ...service,
        _count: {
          categories: categoriesCount.find((c: any) => c.service_id === service.id)?.count || 0,
          content: contentCount.find((c: any) => c.service_id === service.id)?.count || 0
        }
      }));

      setServices(servicesWithCounts);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await cloudflareDb.delete('services', { id: serviceId });

      toast.success('Service deleted successfully');

      await fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
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
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <Link
          to="/admin/services/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
          Add Service
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {service.icon && (
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: service.color || '#e5e7eb' }}
                        >
                          <i className={`${service.icon} text-white`}></i>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {service.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{service.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {service._count?.categories} Categories
                    </div>
                    <div className="text-sm text-gray-500">
                      {service._count?.content} Content Items
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        to={`/admin/services/edit/${service.slug}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit service"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title={`Delete ${service.title}`}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No services found. Create your first service to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
