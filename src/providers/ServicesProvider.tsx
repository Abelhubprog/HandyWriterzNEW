import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, type UseQueryOptions } from '@tanstack/react-query';
import { cloudflareDb } from '@/lib/cloudflare';
import { toast } from 'react-hot-toast';
import databaseService from '@/services/databaseService';

interface Service {
  id: string;
  title: string; // databaseService returns 'title' field
  name?: string; // backup field
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ServiceLink {
  path: string;
  label: string;
  slug: string;
  description: string;
  likes: number;
  comments: number;
}

interface ServicesContextType {
  services: ServiceLink[];
  isLoading: boolean;
  error: Error | null;
  refetchServices: () => Promise<void>;
  likeService: (serviceId: string) => Promise<void>;
  unlikeService: (serviceId: string) => Promise<void>;
  isLiked: (serviceId: string) => Promise<boolean>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const queryOptions: UseQueryOptions<ServiceLink[], Error> = {
    queryKey: ['services'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      try {
        // Use the migrated database service
        const servicesData = await databaseService.getServices();
        
        if (!servicesData || servicesData.length === 0) return [];

        // In development, use mock data for counts to reduce database noise
        const isDevelopment = import.meta.env.DEV;
        let commentCountMap: Record<string, number> = {};
        let likesCountMap: Record<string, number> = {};

        if (isDevelopment) {
          // Use mock data in development to reduce noise
          commentCountMap = servicesData.reduce((acc, service) => {
            acc[service.id] = 0;
            return acc;
          }, {} as Record<string, number>);
          
          likesCountMap = servicesData.reduce((acc, service) => {
            acc[service.id] = 0;
            return acc;
          }, {} as Record<string, number>);
        } else {
          // Only fetch real counts in production
          const commentsPromises = servicesData.slice(0, 3).map(async (service: Service) => {
            try {
              const result = await cloudflareDb.query(
                'SELECT COUNT(*) as count FROM comments WHERE service_id = ?',
                [service.id]
              );
              return {
                serviceId: service.id,
                count: result.results?.[0]?.count || 0
              };
            } catch (e) {
              return { serviceId: service.id, count: 0 };
            }
          });

          const commentCounts = await Promise.all(commentsPromises);
          commentCountMap = commentCounts.reduce((acc, { serviceId, count }) => {
            acc[serviceId] = count;
            return acc;
          }, {} as Record<string, number>);

          const likesPromises = servicesData.slice(0, 3).map(async (service: Service) => {
            try {
              const result = await cloudflareDb.query(
                'SELECT COUNT(*) as count FROM service_likes WHERE service_id = ?',
                [service.id]
              );
              return {
                serviceId: service.id,
                count: result.results?.[0]?.count || 0
              };
            } catch (e) {
              return { serviceId: service.id, count: 0 };
            }
          });

          const likesCounts = await Promise.all(likesPromises);
          likesCountMap = likesCounts.reduce((acc, { serviceId, count }) => {
            acc[serviceId] = count;
            return acc;
          }, {} as Record<string, number>);
        }

        // Transform the data into the format expected by the UI
        return servicesData.map((service: Service) => ({
          path: `/services/${service.slug}`,
          label: service.title || service.name, // Use title if available, fallback to name
          slug: service.slug,
          description: service.description,
          likes: likesCountMap[service.id] || 0,
          comments: commentCountMap[service.id] || 0,
        }));
      } catch (error) {
        throw error;
      }
    },
    gcTime: 30 * 60 * 1000,
    retry: 2,
  };

  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ServiceLink[], Error>(queryOptions);

  const likeMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const data = await cloudflareDb.insert('service_likes', {
        service_id: serviceId,
        created_at: new Date().toISOString()
      });
      return data;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to like service. Please try again.');
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await cloudflareDb.delete('service_likes', { service_id: serviceId });
      return true;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to unlike service. Please try again.');
    }
  });

  const likeService = async (serviceId: string) => {
    await likeMutation.mutateAsync(serviceId);
  };

  const unlikeService = async (serviceId: string) => {
    await unlikeMutation.mutateAsync(serviceId);
  };

  const isLiked = async (serviceId: string) => {
    try {
      const result = await cloudflareDb.query(
        'SELECT id FROM service_likes WHERE service_id = ? LIMIT 1',
        [serviceId]
      );
      return !!(result.results && result.results.length > 0);
    } catch (error) {
      return false;
    }
  };

  const refetchServices = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <ServicesContext.Provider
      value={{
        services,
        isLoading,
        error,
        refetchServices,
        likeService,
        unlikeService,
        isLiked,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}
