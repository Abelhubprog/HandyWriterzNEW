import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Lock, Star, Crown } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'basic' | 'standard' | 'premium';
  requiredFeature?: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan,
  requiredFeature,
  fallback,
  showUpgrade = true,
}) => {
  const { has } = useAuth();

  // Check if user has required plan or feature
  const hasAccess = React.useMemo(() => {
    if (requiredPlan && !has({ plan: requiredPlan })) {
      return false;
    }
    if (requiredFeature && !has({ feature: requiredFeature })) {
      return false;
    }
    return true;
  }, [has, requiredPlan, requiredFeature]);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'standard':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'premium':
        return <Crown className="h-6 w-6 text-pink-500" />;
      default:
        return <Lock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'Basic';
      case 'standard':
        return 'Standard';
      case 'premium':
        return 'Premium';
      default:
        return 'subscription';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'standard':
        return 'border-purple-200 bg-purple-50';
      case 'premium':
        return 'border-pink-200 bg-pink-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border rounded-lg p-6 text-center ${getPlanColor(requiredPlan || '')}`}>
      <div className="flex justify-center mb-4">
        {getPlanIcon(requiredPlan || '')}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {requiredPlan
          ? `${getPlanName(requiredPlan)} Plan Required`
          : 'Subscription Required'
        }
      </h3>
      
      <p className="text-gray-600 mb-4">
        {requiredPlan
          ? `This feature is available to ${getPlanName(requiredPlan)} subscribers and above.`
          : requiredFeature
          ? `This feature requires the "${requiredFeature}" subscription feature.`
          : 'This feature requires an active subscription to access.'
        }
      </p>

      {showUpgrade && (
        <div className="space-y-3">
          <Link
            to="/pricing"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            View Plans & Upgrade
          </Link>
          <div className="text-sm text-gray-500">
            <Link to="/contact" className="hover:text-gray-700 underline">
              Questions? Contact our sales team
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionGuard;