import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Download,
  Upload,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  RefreshCw,
  XCircle
} from 'lucide-react';

// Import Cloudflare D1 client (aliased as supabase)
import { supabase } from '../../lib/supabaseClient';
import { documentSubmissionService } from '../../services/documentSubmissionService';

interface Submission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceType: string;
  subjectArea: string;
  wordCount: number;
  studyLevel: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  files: Array<{ name: string; url: string; size: number }>;
  createdAt: string;
  price?: number;
  paymentStatus: 'unpaid' | 'paid' | 'partial' | 'refunded';
}

interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch submissions from D1 database
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch submissions from orders table
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Transform orders into submissions format
      const transformedSubmissions: Submission[] = ordersData.map((order: any) => ({
        id: order.id || `order-${Date.now()}`,
        userId: order.user_id,
        userName: order.client_name || 'Unknown User',
        userEmail: order.client_email || 'No email provided',
        serviceType: order.service_type || 'Not specified',
        subjectArea: order.subject_area || 'Not specified',
        wordCount: order.word_count || 0,
        studyLevel: order.study_level || 'Not specified',
        dueDate: order.due_date || new Date().toISOString(),
        status: order.status || 'pending',
        files: order.files || [],
        createdAt: order.created_at || new Date().toISOString(),
        price: order.price || 0,
        paymentStatus: order.payment_status || 'unpaid',
        instructions: order.instructions || 'No instructions provided',
        module: order.module || 'Not specified'
      }));

      setSubmissions(transformedSubmissions);

      // Calculate stats from real data
      const stats: DashboardStats = {
        totalSubmissions: transformedSubmissions.length,
        pendingSubmissions: transformedSubmissions.filter(s => s.status === 'pending').length,
        completedSubmissions: transformedSubmissions.filter(s => s.status === 'completed').length,
        totalRevenue: transformedSubmissions
          .filter(s => s.paymentStatus === 'paid')
          .reduce((sum, s) => sum + (s.price || 0), 0),
        activeUsers: new Set(transformedSubmissions.map(s => s.userId)).size,
        newUsersThisWeek: 0 // We would need additional queries for this
      };

      // Try to get user count from users table if exists
      try {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' });
          
        if (count !== null) {
          stats.activeUsers = count;
        }
      } catch (userCountError) {
      }

      setStats(stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // Check if the URL is already a valid absolute URL
      if (!/^https?:\/\//.test(fileUrl)) {
        // If not, it might be a relative path - try to get a signed download URL
        try {
          const response = await fetch(`/api/download?path=${encodeURIComponent(fileUrl)}`, {
            headers: {
              'Authorization': `Bearer ${user?.id}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              fileUrl = data.url;
            }
          }
        } catch (signedUrlError) {
        }
      }
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      toast.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: Submission['status']) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      // Find the submission in the current state
      const submission = submissions.find(sub => sub.id === submissionId);
      
      if (!submission) {
        throw new Error('Submission not found');
      }
      
      // Update status in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
      
      if (error) {
        throw error;
      }
      
      // Track state change for workflow
      let actionTaken = '';
      if (newStatus === 'in-progress' && submission.status === 'pending') {
        actionTaken = 'started working on';
      } else if (newStatus === 'completed' && submission.status !== 'completed') {
        actionTaken = 'completed';
      } else if (newStatus === 'rejected' && submission.status !== 'rejected') {
        actionTaken = 'rejected';
      }

      // Create activity log entry
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user?.id,
            action_type: 'status_change',
            target_id: submissionId,
            description: `Admin ${actionTaken} order ${submissionId}`,
            old_value: submission.status,
            new_value: newStatus,
            created_at: new Date().toISOString()
          });
      } catch (logError) {
        // Non-blocking - proceed anyway
      }
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );
      
      // Update stats based on new status
      setStats(prev => {
        const newStats = {...prev};
        if (newStatus === 'completed' && submission.status !== 'completed') {
          newStats.completedSubmissions++;
          newStats.pendingSubmissions = Math.max(0, newStats.pendingSubmissions - 1);
        } else if (newStatus === 'pending' && submission.status === 'completed') {
          newStats.completedSubmissions = Math.max(0, newStats.completedSubmissions - 1);
          newStats.pendingSubmissions++;
        }
        return newStats;
      });
      
      // Send notification to user
      await sendStatusUpdateEmail(submission, newStatus);
      
      toast.dismiss(loadingToast);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const sendStatusUpdateEmail = async (submission: Submission, newStatus: Submission['status']) => {
    try {
      // Prepare email data
      const emailData = {
        to: submission.userEmail,
        subject: `Your order status has been updated to ${newStatus} - HandyWriterz`,
        orderId: submission.id,
        userName: submission.userName,
        serviceType: submission.serviceType,
        newStatus,
        message: getStatusUpdateMessage(newStatus)
      };

      // Send via API
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Email send failed with status ${response.status}`);
      }

    } catch (error) {
      // Non-blocking error - UI flow continues
    }
  };

  // Helper to generate appropriate message based on status
  const getStatusUpdateMessage = (status: Submission['status']) => {
    switch (status) {
      case 'in-progress':
        return 'We have started working on your document. Our expert writers are now crafting your content according to your requirements.';
      case 'completed':
        return 'Great news! Your document is now complete and ready for review. Please log in to your dashboard to download your files.';
      case 'rejected':
        return 'We regret to inform you that we cannot proceed with your order as submitted. Our team will contact you shortly to discuss alternatives.';
      default:
        return 'Your order status has been updated. Please log in to your dashboard for more details.';
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subjectArea.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


      await fetch('/api/send-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
    } catch (error) {
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // Check if the URL is already a valid absolute URL
      if (!/^https?:\/\//.test(fileUrl)) {
        // If not, it might be a relative path - try to get a signed download URL
        try {
          const response = await fetch(`/api/download?path=${encodeURIComponent(fileUrl)}`, {
            headers: {
              'Authorization': `Bearer ${user?.id}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              fileUrl = data.url;
            }
          }
        } catch (signedUrlError) {
        }
      }
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      toast.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const sendMessageToUser = async (submission: Submission) => {
    try {
      // Prepare message data
      const messageData = {
        orderId: submission.id,
        userId: submission.userId,
        userEmail: submission.userEmail,
        adminId: user?.id,
        subject: `Update on your ${submission.serviceType} order`,
        // We'd have a real message form in production
        message: 'This is a notification about your order. Please check your dashboard for updates.',
        timestamp: new Date().toISOString()
      };

      // Send via API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusBadge = (status: Submission['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Submission['paymentStatus']) => {
    const statusConfig = {
      unpaid: { color: 'bg-red-100 text-red-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      partial: { color: 'bg-yellow-100 text-yellow-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.fullName || user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <Link
                to="/admin/settings"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/content/new"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700">Create Content</span>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">Manage Users</span>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-700">View Analytics</span>
            </Link>
            
            <Link
              to="/admin/services"
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Settings className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-700">Manage Services</span>
            </Link>
          </div>
        </div>

        {/* Submissions Management */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{submission.userName}</p>
                        <p className="text-sm text-gray-500">{submission.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{submission.serviceType}</p>
                        <p className="text-sm text-gray-500">{submission.subjectArea}</p>
                        <p className="text-xs text-gray-400">{submission.wordCount.toLocaleString()} words</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(submission.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {getPaymentStatusBadge(submission.paymentStatus)}
                        <p className="text-sm text-gray-900 mt-1">£{submission.price?.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowSubmissionDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => sendMessageToUser(submission)}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Send Message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Implement email functionality
                            const subject = `Re: Your ${submission.serviceType} Order`;
                            const body = `Dear ${submission.userName},\n\nRegarding your order ${submission.id}...\n\nBest regards,\nHandyWriterz Team`;
                            window.open(`mailto:${submission.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                          }}
                          className="p-1 text-purple-600 hover:text-purple-700"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        
                        <div className="relative group">
                          <button className="p-1 text-gray-600 hover:text-gray-700">
                            <Download className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              {submission.files.map((file, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(file.url, file.name)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {file.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Details Modal */}
      {showSubmissionDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Submission Details</h2>
                <button
                  onClick={() => setShowSubmissionDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.userName}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.userEmail}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.serviceType}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.subjectArea}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word Count</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.wordCount.toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Study Level</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.studyLevel}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedSubmission.dueDate).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-sm text-gray-900">£{selectedSubmission.price?.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value as Submission['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
                <div className="space-y-2">
                  {selectedSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file.url, file.name)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => sendMessageToUser(selectedSubmission)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </button>
                
                <button
                  onClick={() => uploadResponseFile(selectedSubmission)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {selectedSubmission && showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Upload Response for {selectedSubmission.userName}</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Order: {selectedSubmission.serviceType} ({selectedSubmission.wordCount} words)</p>
              <p className="text-sm text-gray-600">Due Date: {new Date(selectedSubmission.dueDate).toLocaleDateString()}</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center">
              {uploadProgress > 0 ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full mb-2">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    id="responseFile" 
                    className="hidden"
                    multiple
                    onChange={handleResponseFileSelect}
                  />
                  <label htmlFor="responseFile" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOCX, or other document files</p>
                  </label>
                </>
              )}
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Selected Files:</h4>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="truncate">{file.name}</span>
                      <button 
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleResponseUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  // Handle response file selection
  const handleResponseFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Remove a selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Open upload modal for a submission
  const uploadResponseFile = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSelectedFiles([]);
    setUploadProgress(0);
    setShowUploadModal(true);
  };

  // Handle response file upload
  const handleResponseUpload = async () => {
    if (!selectedSubmission || selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const uploadToast = toast.loading('Uploading response files...');

    try {
      // Use cloudflare upload service in production
      const bucketFolder = `admin/responses/${selectedSubmission.id}/${Date.now()}`;
      const uploadedFiles: Array<{ name: string; url: string; path: string; size: number }> = [];
      
      // Upload each file with progress tracking
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = Math.round(((i / selectedFiles.length) * 100));
        setUploadProgress(progress);
        
        try {
          const result = await documentSubmissionService.uploadToR2Worker(
            file,
            `${bucketFolder}/${file.name}`
          );
          
          if (result.success && result.url) {
            uploadedFiles.push({
              name: file.name,
              url: result.url,
              path: `${bucketFolder}/${file.name}`,
              size: file.size
            });
          } else {
            throw new Error(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`);
          }
        } catch (fileError) {
          toast.error(`Error uploading ${file.name}`)
          // Continue with other files
        }
      }
      
      // Update order with response files
      if (uploadedFiles.length > 0) {
        // Update order in database
        const { error } = await supabase
          .from('orders')
          .update({
            response_files: uploadedFiles,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedSubmission.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === selectedSubmission.id
              ? {
                  ...sub,
                  status: 'completed',
                  responseFiles: [...(sub.responseFiles || []), ...uploadedFiles]
                }
              : sub
          )
        );
        
        // Send notification email about the response
        await sendStatusUpdateEmail(selectedSubmission, 'completed');
        
        toast.dismiss(uploadToast);
        toast.success(`${uploadedFiles.length} response file(s) uploaded successfully`);
        setShowUploadModal(false);
      } else {
        throw new Error('No files were uploaded successfully');
      }
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error('Failed to upload response files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

export default AdminDashboard; 