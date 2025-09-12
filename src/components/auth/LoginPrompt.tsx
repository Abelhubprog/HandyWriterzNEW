import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Heart, 
  MessageSquare, 
  Bookmark,
  Star,
  ThumbsUp
} from 'lucide-react';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'comment' | 'like' | 'bookmark' | 'share' | 'vote';
  title?: string;
  description?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({
  isOpen,
  onClose,
  action,
  title,
  description
}) => {
  const { isSignedIn } = useAuth();
  const { openSignIn, openSignUp } = useClerk();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already signed in, close the prompt
  React.useEffect(() => {
    if (isSignedIn) {
      onClose();
    }
  }, [isSignedIn, onClose]);

  const getActionConfig = () => {
    const configs = {
      comment: {
        icon: MessageSquare,
        title: 'Join the Conversation',
        description: 'Sign in to share your thoughts and engage with our community',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      like: {
        icon: Heart,
        title: 'Show Your Appreciation',
        description: 'Sign in to like posts and show support for content you love',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      bookmark: {
        icon: Bookmark,
        title: 'Save for Later',
        description: 'Sign in to bookmark articles and build your personal reading list',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      share: {
        icon: Star,
        title: 'Share This Content',
        description: 'Sign in to share articles with your network and track your shares',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      vote: {
        icon: ThumbsUp,
        title: 'Cast Your Vote',
        description: 'Sign in to vote on content and help others discover the best articles',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }
    };

    return configs[action];
  };

  const actionConfig = getActionConfig();
  const ActionIcon = actionConfig.icon;

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await openSignIn({
        redirectUrl: window.location.href,
        afterSignInUrl: window.location.href
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await openSignUp({
        redirectUrl: window.location.href,
        afterSignUpUrl: window.location.href
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className={`p-6 pb-4 ${actionConfig.bgColor} ${actionConfig.borderColor} border-b`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 ${actionConfig.bgColor} rounded-full border ${actionConfig.borderColor}`}>
                  <ActionIcon className={`h-6 w-6 ${actionConfig.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {title || actionConfig.title}
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {description || actionConfig.description}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Benefits */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm">What you get with an account:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>Comment and engage with our community</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Like and save your favorite content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-green-500" />
                    <span>Build your personal reading list</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <span>Personalized content recommendations</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></div>
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Create Free Account
                </button>
                
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-t-2 border-gray-600 rounded-full"></div>
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Sign In to Existing Account
                </button>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                  Your email is safe with us - we never spam.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPrompt;