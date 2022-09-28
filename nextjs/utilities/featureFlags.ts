export const isVercelDomainEnabled = true;
export const isLoginProtectionEnabled = true;
export const isStripeEnabled = false;
export const isRedirectToNewOnboardingEnabled = false;
export const isNewOnboardingButtonEnabled = false;

const featureFlags = {
  isStripeEnabled,
  isVercelDomainEnabled,
  isLoginProtectionEnabled,
};

export default featureFlags;
