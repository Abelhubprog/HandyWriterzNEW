import { useAuth } from '@clerk/clerk-react';

export interface SubscriptionPlan {
  name: string;
  features: string[];
  maxPages?: number;
  deliveryDays?: number;
  revisions?: number | 'unlimited';
  support: string;
}

export const subscriptionPlans = {
  free: {
    name: 'Free',
    features: ['basic_access'],
    maxPages: 0,
    deliveryDays: 14,
    revisions: 0,
    support: 'Community'
  },
  basic: {
    name: 'Basic',
    features: ['basic_access', 'plagiarism_check', 'email_support'],
    maxPages: 5,
    deliveryDays: 7,
    revisions: 1,
    support: 'Email'
  },
  standard: {
    name: 'Standard',
    features: ['basic_access', 'plagiarism_check', 'priority_support', 'writer_communication'],
    maxPages: 15,
    deliveryDays: 5,
    revisions: 3,
    support: 'Priority Email'
  },
  premium: {
    name: 'Premium',
    features: ['basic_access', 'plagiarism_check', 'priority_support', 'writer_communication', 'dedicated_manager', 'research_assistance'],
    maxPages: Infinity,
    deliveryDays: 3,
    revisions: 'unlimited' as const,
    support: '24/7 Priority'
  }
} as const;

export type PlanType = keyof typeof subscriptionPlans;

export const useSubscription = () => {
  const { has, isLoaded, isSignedIn } = useAuth();

  const checkPlan = (planName: PlanType) => {
    if (!isLoaded || !isSignedIn) return false;
    return has({ plan: planName });
  };

  const checkFeature = (featureName: string) => {
    if (!isLoaded || !isSignedIn) return false;
    return has({ feature: featureName });
  };

  const getCurrentPlan = (): PlanType => {
    if (!isLoaded || !isSignedIn) return 'free';
    
    // Check from highest to lowest plan
    if (checkPlan('premium')) return 'premium';
    if (checkPlan('standard')) return 'standard';
    if (checkPlan('basic')) return 'basic';
    return 'free';
  };

  const getPlanFeatures = (planName: PlanType): SubscriptionPlan => {
    return subscriptionPlans[planName];
  };

  const canAccessFeature = (featureName: string): boolean => {
    const currentPlan = getCurrentPlan();
    const planFeatures = getPlanFeatures(currentPlan);
    return planFeatures.features.includes(featureName) || checkFeature(featureName);
  };

  const getPageLimit = (): number => {
    const currentPlan = getCurrentPlan();
    return getPlanFeatures(currentPlan).maxPages || 0;
  };

  const getRevisionLimit = (): number | 'unlimited' => {
    const currentPlan = getCurrentPlan();
    return getPlanFeatures(currentPlan).revisions;
  };

  const getDeliveryDays = (): number => {
    const currentPlan = getCurrentPlan();
    return getPlanFeatures(currentPlan).deliveryDays;
  };

  const getSupportLevel = (): string => {
    const currentPlan = getCurrentPlan();
    return getPlanFeatures(currentPlan).support;
  };

  const isUpgradeRequired = (requiredPlan: PlanType): boolean => {
    const currentPlan = getCurrentPlan();
    const planOrder: PlanType[] = ['free', 'basic', 'standard', 'premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const requiredIndex = planOrder.indexOf(requiredPlan);
    return currentIndex < requiredIndex;
  };

  return {
    isLoaded,
    isSignedIn,
    checkPlan,
    checkFeature,
    getCurrentPlan,
    getPlanFeatures,
    canAccessFeature,
    getPageLimit,
    getRevisionLimit,
    getDeliveryDays,
    getSupportLevel,
    isUpgradeRequired,
    plans: subscriptionPlans,
  };
};

export default useSubscription;