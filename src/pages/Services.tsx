import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { cloudflareDb } from '@/lib/cloudflare';
import { toast } from 'react-hot-toast';
import {
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  ThumbsUp,
  Users,
  GraduationCap,
  Brain,
  BookOpen,
  Clock,
  Star,
  Sparkles,
  Zap
} from 'lucide-react';

interface ServiceContent {
  id: string;
  title: string;
  description: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  anonymous_likes: number;
  shares: number;
  comments_count: number;
}

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadServices();
  }, [currentPage]);

  const loadServices = async () => {
    try {
      const offset = (currentPage - 1) * pageSize;
      const result = await cloudflareDb.query(`
        SELECT 
          id, title, description, content, author_id, created_at, updated_at,
          0 as likes, 0 as anonymous_likes, 0 as shares, 0 as comments_count
        FROM content 
        WHERE status = 'published' 
        ORDER BY created_at DESC 
        LIMIT ${pageSize} OFFSET ${offset}
      `);
      setServices(result.results || []);
    } catch (error) {
      toast.error('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    try {
      // Placeholder for like functionality - would integrate with interactions system
      toast.success('Like functionality coming soon!');
    } catch (error) {
      toast.error('Unable to like content. Please try again.');
    }
  };

  const handleShare = async (contentId: string, platform: string) => {
    try {
      // Placeholder for share functionality
      if (navigator.share) {
        await navigator.share({
          title: 'HandyWriterz Services',
          url: window.location.href
        });
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Unable to share content. Please try again.');
    }
  };

  const handleComment = async (contentId: string, comment: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    try {
      // Placeholder for comment functionality
      toast.success('Comment functionality coming soon!');
    } catch (error) {
      toast.error('Unable to add comment. Please try again.');
    }
  };

  const serviceCategories = [
    {
      icon: GraduationCap,
      title: "Adult Health Nursing",
      path: "/services/adult-health-nursing",
      description: "Comprehensive support for adult nursing studies and research"
    },
    {
      icon: Brain,
      title: "Mental Health Nursing",
      path: "/services/mental-health-nursing",
      description: "Expert guidance in mental health nursing concepts and practice"
    },
    {
      icon: Heart,
      title: "Child Nursing",
      path: "/services/child-nursing",
      description: "Specialized support for pediatric nursing education"
    },
    {
      icon: BookOpen,
      title: "Special Education",
      path: "/services/special-education",
      description: "Professional assistance in special education studies"
    },
    {
      icon: Users,
      title: "Social Work",
      path: "/services/social-work",
      description: "Expert support for social work studies and research"
    },
    {
      icon: Sparkles,
      title: "AI Services",
      path: "/services/ai",
      description: "Cutting-edge AI-powered academic assistance"
    },
    {
      icon: Zap,
      title: "Crypto",
      path: "/services/crypto",
      description: "Blockchain and cryptocurrency research support"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Services Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert academic assistance in nursing, social work, and special education
          </p>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={category.path}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <Icon className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600">{category.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Latest Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Updates</h2>
          <div className="space-y-8">
            {services.map((service) => (
              <div key={service.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {/* Interaction Buttons */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(service.id)}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    <span>{service.likes + service.anonymous_likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(service.id, 'twitter')}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    <span>{service.shares}</span>
                  </button>
                  
                  <button
                    onClick={() => handleComment(service.id, '')}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>{service.comments_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={services.length < pageSize}
              className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
