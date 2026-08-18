import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from './config';

export const trackEvent = async (
  name: string,
  params?: Record<string, unknown>
): Promise<void> => {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, name, params);
    }
  } catch (error) {
    console.debug('Analytics event tracking error:', error);
  }
};

export const trackPageView = async (page: string): Promise<void> => {
  await trackEvent('page_view', { page_title: page });
};

export const trackUserAction = async (
  action: string,
  category?: string,
  label?: string,
  value?: number
): Promise<void> => {
  await trackEvent('user_action', {
    action,
    category,
    label,
    value,
  });
};

export const trackVoiceCommand = async (
  command: string,
  success: boolean,
  confidence?: number
): Promise<void> => {
  await trackEvent('voice_command', {
    command,
    success,
    confidence,
  });
};

export const trackError = async (
  error: Error,
  context?: string
): Promise<void> => {
  await trackEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};
