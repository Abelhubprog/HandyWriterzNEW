import { cloudflareDb } from './cloudflare';

// Function to sync a Clerk user to Cloudflare D1
export const syncUserToCloudflare = async (clerkUser: any) => {
    if (!clerkUser) return null;

    try {
        // Check if user already exists in Cloudflare D1
        const existingUsers = await cloudflareDb.select('users', { clerk_id: clerkUser.id }, 1);

        if (existingUsers && existingUsers.length > 0) {
            // User exists, update user data
            const existingUser = existingUsers[0];
            
            const userData = {
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
                email: clerkUser.emailAddresses[0]?.emailAddress || existingUser.email,
                avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
                last_login: new Date().toISOString(),
            };

            const updatedUser = await cloudflareDb.update('users', userData, { id: existingUser.id });
            return updatedUser;
        } else {
            // User doesn't exist, create new user
            const userData = {
                clerk_id: clerkUser.id,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                role: 'user', // Default role for new users
                avatar_url: clerkUser.imageUrl || `https://ui-avatars.com/api/?name=${clerkUser.firstName}+${clerkUser.lastName}&background=random`,
                status: 'active',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
            };

            const newUser = await cloudflareDb.insert('users', userData);
            return newUser;
        }
    } catch (error) {
        throw error;
    }
};

// Function to get a user's Cloudflare D1 record by Clerk ID
export const getUserByClerkId = async (clerkId: string) => {
    try {
        const users = await cloudflareDb.select('users', { clerk_id: clerkId }, 1);
        return users && users.length > 0 ? users[0] : null;
    } catch (error) {
        return null;
    }
};

// Check if a user has admin privileges
export const isAdmin = async (clerkId: string) => {
    try {
        const user = await getUserByClerkId(clerkId);
        return user && (user.role === 'admin' || user.role === 'editor');
    } catch (error) {
        return false;
    }
};

// Promote a user to admin
export const promoteToAdmin = async (userId: string) => {
    try {
        const data = await cloudflareDb.update('users', { role: 'admin' }, { id: userId });
        return data;
    } catch (error) {
        throw error;
    }
};

// Update a user's status (active/inactive/pending)
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
        const data = await cloudflareDb.update('users', { status }, { id: userId });
        return data;
    } catch (error) {
        throw error;
    }
};

// Export backward-compatible names
export const syncUserToSupabase = syncUserToCloudflare;

export default {
    syncUserToSupabase: syncUserToCloudflare,
    syncUserToCloudflare,
    getUserByClerkId,
    isAdmin,
    promoteToAdmin,
    updateUserStatus
}; 