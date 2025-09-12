/**
 * Admin Payments Page
 * Manage and view all payments in the system
 * 
 * @file src/pages/admin/payments.tsx
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from 'lucide-react';

// Enhanced UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/enhanced-input';
import { Container, Stack, Grid, Inline } from '@/components/ui/enhanced-layout';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';

// Services
import { paymentService, Payment } from '@/services/paymentService';
import { formatDate, formatCurrency } from '@/lib/utils';

// Mock admin payment data (replace with actual API calls)
const mockAdminPayments: (Payment & { user_email: string; user_name: string })[] = [
  {
    id: 'payment_1',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_email: 'john.doe@example.com',
    user_name: 'John Doe',
    metadata: {
      plan_id: 'basic',
      plan_name: 'Basic Plan',
    },
  },
  {
    id: 'payment_2',
    amount: 59.99,
    currency: 'USD',
    status: 'succeeded',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user_email: 'jane.smith@example.com',
    user_name: 'Jane Smith',
    metadata: {
      plan_id: 'premium',
      plan_name: 'Premium Plan',
    },
  },
  {
    id: 'payment_3',
    amount: 99.99,
    currency: 'USD',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_email: 'bob.wilson@example.com',
    user_name: 'Bob Wilson',
    metadata: {
      plan_id: 'professional',
      plan_name: 'Professional Plan',
    },
  },
];

const AdminPayments: React.FC = () => {
  const { user } = useUser();
  const [payments, setPayments] = useState(mockAdminPayments);
  const [filteredPayments, setFilteredPayments] = useState(mockAdminPayments);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>('all');

  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, payments]);

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        payment =>
          payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.metadata.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RotateCcw className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const successfulPayments = payments.filter(p => p.status === 'succeeded').length;

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Container>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage all payments across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <Grid cols={2} gap="md" className="md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{payments.length}</p>
                  <p className="text-sm text-gray-500">Total Payments</p>
                </div>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{successfulPayments}</p>
                  <p className="text-sm text-gray-500">Successful</p>
                </div>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{pendingPayments}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <Inline gap="md" justify="between" className="flex-wrap">
                <Input
                  placeholder="Search by email, name, or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={16} />}
                  className="min-w-[300px]"
                />
                
                <Inline gap="sm">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    icon={loading ? <LoadingSpinner size="sm" /> : <RefreshCw size={16} />}
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  
                  <Button
                    variant="outline"
                    icon={<Download size={16} />}
                  >
                    Export
                  </Button>
                </Inline>
              </Inline>

              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <Stack gap="xs">
                            <span className="font-medium text-sm">{payment.id}</span>
                            <span className="text-xs text-gray-500">
                              {payment.metadata.plan_name}
                            </span>
                          </Stack>
                        </td>
                        <td className="py-3 px-4">
                          <Stack gap="xs">
                            <span className="font-medium text-sm">{payment.user_name}</span>
                            <span className="text-xs text-gray-500">{payment.user_email}</span>
                          </Stack>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Inline gap="sm" align="center">
                            {getStatusIcon(payment.status)}
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </Inline>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(payment.created_at)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={14} />}
                          >
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search criteria.'
                      : 'Payments will appear here once customers make purchases.'}
                  </p>
                </div>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default AdminPayments;