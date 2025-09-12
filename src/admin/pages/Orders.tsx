import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDownload, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiClock, 
  FiFileText, 
  FiUser,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiEdit3,
  FiSend,
  FiFilter,
  FiSearch,
  FiArrowRight,
  FiEye
} from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cloudflareDb } from '@/lib/cloudflare';
import { formatDate } from '@/utils/formatters';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string;
  service_type: string;
  subject_area: string;
  word_count: number;
  study_level: string;
  due_date: string;
  module: string;
  instructions: string;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  files: Array<{ name: string; url: string; path: string }>;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  payment_status?: 'paid' | 'unpaid' | 'partial' | 'refunded';
}

interface OrderMessage {
  id: string;
  order_id: string;
  sender_type: 'admin' | 'user';
  message: string;
  files?: Array<{ name: string; url: string }>;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch both orders and submissions
      const [ordersResult, submissionsResult] = await Promise.all([
        // Fetch traditional orders
        cloudflareDb.prepare(`
          SELECT 
            o.*,
            u.email as user_email,
            u.name as user_name
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
        `).all(),
        
        // Fetch new submissions from our document upload system
        fetch('/api/submissions').then(r => r.ok ? r.json() : { submissions: [] })
      ]);

      const ordersData: Order[] = [];
      
      // Process traditional orders
      if (ordersResult.results) {
        const processedOrders = ordersResult.results.map((order: any) => ({
          ...order,
          files: JSON.parse(order.files || '[]'),
          payment_status: order.payment_status || 'unpaid',
          source: 'traditional'
        }));
        ordersData.push(...processedOrders);
      }

      // Process submissions from new system
      if (submissionsResult.submissions) {
        const processedSubmissions = submissionsResult.submissions.map((submission: any) => ({
          id: submission.id,
          user_id: submission.user_id,
          service_type: submission.metadata?.serviceType || 'general',
          subject_area: submission.metadata?.subject || submission.metadata?.subjectArea || 'Not specified',
          word_count: submission.metadata?.wordCount || 0,
          study_level: submission.metadata?.academicLevel || submission.metadata?.studyLevel || 'Not specified',
          due_date: submission.metadata?.deadline || submission.metadata?.dueDate || '',
          module: submission.metadata?.module || '',
          instructions: submission.metadata?.instructions || '',
          price: submission.metadata?.price || 0,
          status: submission.status || 'pending',
          files: JSON.parse(submission.files || '[]'),
          created_at: submission.created_at,
          updated_at: submission.updated_at || submission.created_at,
          user_email: submission.user_email || submission.user_id,
          user_name: submission.user_name || 'User',
          payment_status: submission.payment_status || 'unpaid',
          source: 'submission'
        }));
        ordersData.push(...processedSubmissions);
      }

      // Sort by creation date
      ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setOrders(ordersData);
    } catch (error) {
      toast.error('Failed to load orders');
      
      // Mock data for development
      setOrders([
        {
          id: 'order_1',
          user_id: 'user_1',
          service_type: 'Essay',
          subject_area: 'Adult Health Nursing',
          word_count: 2500,
          study_level: 'Level 6',
          due_date: '2024-01-20',
          module: 'Advanced Clinical Practice',
          instructions: 'Please write about evidence-based practice in adult health nursing...',
          price: 150,
          status: 'pending',
          files: [
            { name: 'assignment_brief.pdf', url: '/files/brief.pdf', path: 'orders/user_1/brief.pdf' },
            { name: 'reading_list.docx', url: '/files/reading.docx', path: 'orders/user_1/reading.docx' }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_email: 'student@university.ac.uk',
          user_name: 'John Student',
          payment_status: 'paid'
        },
        {
          id: 'order_2',
          user_id: 'user_2',
          service_type: 'Dissertation',
          subject_area: 'Mental Health Nursing',
          word_count: 15000,
          study_level: 'Level 7',
          due_date: '2024-02-15',
          module: 'Mental Health Research',
          instructions: 'Research on cognitive behavioral therapy effectiveness...',
          price: 850,
          status: 'in_progress',
          files: [
            { name: 'proposal.pdf', url: '/files/proposal.pdf', path: 'orders/user_2/proposal.pdf' }
          ],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          user_email: 'researcher@student.com',
          user_name: 'Sarah Researcher',
          payment_status: 'partial'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.subject_area.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.price - a.price;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await cloudflareDb.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).bind(newStatus, new Date().toISOString(), orderId).run();

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: 'paid' | 'unpaid' | 'partial' | 'refunded') => {
    try {
      await cloudflareDb.prepare(`
        UPDATE orders 
        SET payment_status = ?, updated_at = ?
        WHERE id = ?
      `).bind(newStatus, new Date().toISOString(), orderId).run();

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const sendMessage = async () => {
    if (!selectedOrder || !newMessage.trim()) return;

    try {
      const messageId = `msg_${Date.now()}`;
      
      // Save message to database
      await cloudflareDb.prepare(`
        INSERT INTO order_messages (id, order_id, sender_type, message, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(messageId, selectedOrder.id, 'admin', newMessage, new Date().toISOString()).run();

      // Add to local state
      const newMsg: OrderMessage = {
        id: messageId,
        order_id: selectedOrder.id,
        sender_type: 'admin',
        message: newMessage,
        created_at: new Date().toISOString()
      };

      setOrderMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      toast.success('Message sent to user');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student orders, track progress, and communicate with users
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="date">Date Created</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, user, service..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
          
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                selectedOrder?.id === order.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">#{order.id}</h3>
                  <p className="text-sm text-gray-600">{order.user_name} • {order.user_email}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.payment_status || 'unpaid')}`}>
                    {order.payment_status || 'unpaid'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{order.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span>{order.subject_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Words:</span>
                  <span>{order.word_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due:</span>
                  <span>{formatDate(order.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">£{order.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {formatDate(order.created_at)}
                </span>
                <div className="flex items-center space-x-2">
                  <FiFileText className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{order.files.length} files</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No orders found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedOrder ? (
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>
                    <p className="text-gray-600">{selectedOrder.user_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">£{selectedOrder.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</div>
                  </div>
                </div>
                
                {/* Status Updates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={selectedOrder.payment_status || 'unpaid'}
                      onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value as any)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Service Type:</span>
                    <p className="font-medium">{selectedOrder.service_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject Area:</span>
                    <p>{selectedOrder.subject_area}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Word Count:</span>
                    <p>{selectedOrder.word_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Study Level:</span>
                    <p>{selectedOrder.study_level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <p>{formatDate(selectedOrder.due_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Module:</span>
                    <p>{selectedOrder.module || 'Not specified'}</p>
                  </div>
                </div>
                
                {selectedOrder.instructions && (
                  <div>
                    <span className="text-gray-600 text-sm">Instructions:</span>
                    <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedOrder.instructions}</p>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="space-y-4">
                <h3 className="font-medium">Uploaded Files ({selectedOrder.files.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <button
                        onClick={() => downloadFile(file.url, file.name)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        <FiDownload className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messaging */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Communication</h3>
                
                {/* Message Input */}
                <div className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message to the user..."
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FiSend className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FiEye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;