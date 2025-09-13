// Utility function to test authentication
export const testAuth = async (token: string) => {
  try {
    const response = await fetch('/api/submissions/user/test', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Auth test successful:', data);
      return { success: true, data };
    } else {
      const error = await response.json();
      console.error('Auth test failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('Auth test error:', error);
    return { success: false, error };
  }
};