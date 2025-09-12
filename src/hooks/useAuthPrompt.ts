import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

interface AuthPromptState {
  isOpen: boolean;
  action: 'comment' | 'like' | 'bookmark' | 'share' | 'vote';
  title?: string;
  description?: string;
}

export const useAuthPrompt = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [promptState, setPromptState] = useState<AuthPromptState>({
    isOpen: false,
    action: 'comment'
  });

  // Check if user is authenticated and prompt if not
  const requireAuth = useCallback((
    action: AuthPromptState['action'],
    callback?: () => void,
    options?: {
      title?: string;
      description?: string;
      showToast?: boolean;
    }
  ) => {
    if (!isLoaded) {
      // Still loading auth state
      return false;
    }

    if (isSignedIn) {
      // User is authenticated, execute callback
      callback?.();
      return true;
    }

    // User not authenticated, show prompt
    setPromptState({
      isOpen: true,
      action,
      title: options?.title,
      description: options?.description
    });

    if (options?.showToast !== false) {
      const messages = {
        comment: 'Please sign in to join the conversation',
        like: 'Please sign in to like this content',
        bookmark: 'Please sign in to save this article',
        share: 'Please sign in to share this content',
        vote: 'Please sign in to vote on this content'
      };
      
      toast.info(messages[action], {
        duration: 3000,
        icon: '🔒'
      });
    }

    return false;
  }, [isSignedIn, isLoaded]);

  // Specific helper functions for common actions
  const requireAuthForComment = useCallback((callback?: () => void) => {
    return requireAuth('comment', callback, {
      title: 'Join the Discussion',
      description: 'Share your thoughts and connect with our community of professionals'
    });
  }, [requireAuth]);

  const requireAuthForLike = useCallback((callback?: () => void) => {
    return requireAuth('like', callback, {
      title: 'Show Your Support',
      description: 'Like posts to show appreciation and help others discover great content'
    });
  }, [requireAuth]);

  const requireAuthForBookmark = useCallback((callback?: () => void) => {
    return requireAuth('bookmark', callback, {
      title: 'Save for Later',
      description: 'Build your personal library of articles and never lose track of valuable content'
    });
  }, [requireAuth]);

  const requireAuthForShare = useCallback((callback?: () => void) => {
    return requireAuth('share', callback, {
      title: 'Share Knowledge',
      description: 'Help others discover valuable content by sharing it with your network'
    });
  }, [requireAuth]);

  const requireAuthForVote = useCallback((callback?: () => void) => {
    return requireAuth('vote', callback, {
      title: 'Make Your Voice Heard',
      description: 'Vote on content to help shape what our community values most'
    });
  }, [requireAuth]);

  // Close the prompt
  const closePrompt = useCallback(() => {
    setPromptState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Check if user can perform action without showing prompt
  const canPerformAction = useCallback(() => {
    return isLoaded && isSignedIn;
  }, [isLoaded, isSignedIn]);

  return {
    // Main functions
    requireAuth,
    canPerformAction,
    
    // Specific action helpers
    requireAuthForComment,
    requireAuthForLike,
    requireAuthForBookmark,
    requireAuthForShare,
    requireAuthForVote,
    
    // Prompt state management
    promptState,
    closePrompt,
    
    // Auth state
    isAuthenticated: isSignedIn,
    isAuthLoaded: isLoaded
  };
};

export default useAuthPrompt;