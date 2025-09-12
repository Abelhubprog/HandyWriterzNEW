import { supabase } from './supabase';

// Mock services data for development
const mockServices = [
  {
    id: '1',
    name: 'Essay Writing',
    slug: 'essay-writing',
    description: 'Professional essay writing services',
    is_active: true,
    display_order: 1,
    price: 20,
    features: ['Expert writers', 'Original content', 'Timely delivery']
  },
  {
    id: '2',
    name: 'Research Writing',
    slug: 'research-writing',
    description: 'Academic research and writing assistance',
    is_active: true,
    display_order: 2,
    price: 35,
    features: ['In-depth research', 'Academic standards', 'Citations included']
  },
  {
    id: '3',
    name: 'Turnitin Check',
    slug: 'turnitin-check',
    description: 'Plagiarism detection and analysis',
    is_active: true,
    display_order: 3,
    price: 5,
    features: ['Detailed report', 'Quick turnaround', 'Similarity analysis']
  }
];

// Get all active services
export async function getServices() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      return { services: mockServices, error: null };
    }
    
    return { services: services || mockServices, error: null };
  } catch (error) {
    return { services: mockServices, error: null };
  }
}

// Get a single service by slug
export async function getServiceBySlug(slug: string) {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      // Fallback to mock data
      const mockService = mockServices.find(s => s.slug === slug);
      if (mockService) {
        return { service: mockService, error: null };
      }
      throw error;
    }
    return { service, error: null };
  } catch (error) {
    const mockService = mockServices.find(s => s.slug === slug);
    return { service: mockService || null, error };
  }
}

// Create a new order (requires authentication)
export async function createOrder(orderData: {
  title: string;
  description?: string;
  service_id?: string;
  price?: number;
  due_date?: string;
  user_id?: string; // Accept user_id from Clerk
}) {
  try {
    // User authentication is handled by Clerk on the frontend
    // The user_id should be passed in from the component
    if (!orderData.user_id) {
      throw new Error('User ID is required to create an order');
    }
    
    // Generate a unique order number
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp.toString().slice(-6)}${randomSuffix}`;
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        order_number: orderNumber,
        title: orderData.title,
        description: orderData.description || '',
        price: orderData.price || null,
        due_date: orderData.due_date || null,
        status: 'pending',
        payment_status: 'pending'
      });
    
    if (error) {
      // Return mock order data for development
      const mockOrder = {
        id: Date.now().toString(),
        user_id: orderData.user_id,
        order_number: orderNumber,
        title: orderData.title,
        description: orderData.description || '',
        price: orderData.price || null,
        due_date: orderData.due_date || null,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      };
      return { order: mockOrder, error: null };
    }
    
    // Create a conversation for this order (skip if database is not available)
    try {
      const { error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: orderData.user_id,
          subject: `Order: ${orderData.title}`,
          order_id: order?.id || Date.now().toString(),
          order_number: orderNumber,
          status: 'active'
        });
      
      if (convError) {
      }
    } catch (convError) {
    }
    
    return { order: order || {}, error: null };
  } catch (error) {
    return { order: null, error };
  }
}

// Get user orders (requires authentication)
export async function getUserOrders(userId?: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required to view orders');
    }
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { orders: [], error: null };
    }
    
    return { orders: orders || [], error: null };
  } catch (error) {
    return { orders: [], error };
  }
}

// Get a single order by ID (requires authentication)
export async function getOrderById(orderId: string, userId?: string, isAdmin = false) {
  try {
    if (!userId && !isAdmin) {
      throw new Error('User ID is required to view an order');
    }
    
    let query = supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);
    
    // If not admin, restrict to user's own orders
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: order, error } = await query.single();
    
    if (error) {
      return { order: null, error };
    }
    return { order, error: null };
  } catch (error) {
    return { order: null, error };
  }
}

// Update order status (admin only)
export async function updateOrderStatus(orderId: string, status: string, paymentStatus?: string, isAdmin = false) {
  try {
    // Admin check should be done at the component level with Clerk
    if (!isAdmin) {
      throw new Error('Only admins can update order status');
    }
    
    const updates: any = { status };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }
    
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return { order, error: null };
  } catch (error) {
    return { order: null, error };
  }
}

// Upload file for an order
export async function uploadOrderFile(orderId: string, file: File) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to upload files');
    }
    
    // Get order to verify ownership or admin status
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    if (!isAdmin) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      if (order.user_id !== user.id) {
        throw new Error('You do not have permission to upload files for this order');
      }
    }
    
    // Create file path
    const fileExt = file.name.split('.').pop();
    const filePath = `orders/${orderId}/${Date.now()}.${fileExt}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(filePath);
    
    // Update order with file URL
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ file_url: urlData.publicUrl })
      .eq('id', orderId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return { order: updatedOrder, url: urlData.publicUrl, error: null };
  } catch (error) {
    return { order: null, url: null, error };
  }
}
