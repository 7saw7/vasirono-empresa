export const DEFAULT_PUBLIC_BUSINESS_ONBOARDING_URL =
  "https://www.vasirono.com/negocios";

export function getPublicBusinessOnboardingUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_BUSINESS_ONBOARDING_URL ||
    process.env.NEXT_PUBLIC_BUSINESS_ONBOARDING_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_WEB_BUSINESS_ONBOARDING_URL ||
    DEFAULT_PUBLIC_BUSINESS_ONBOARDING_URL
  ).trim();
}
