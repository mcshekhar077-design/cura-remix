import { logEvent } from 'firebase/analytics';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseAnalytics, getFirebaseDb } from './config';
import { EmergencySosAlert } from '../../types/firebase';

export interface SOSAnalytics {
  totalAlerts: number;
  activeAlerts: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  byPriority: Record<string, number>;
  byDay: Record<string, number>;
}

export const getSOSAnalytics = async (startDate: Date, endDate: Date): Promise<SOSAnalytics> => {
  try {
    const db = await getFirebaseDb();
    const q = query(
      collection(db, 'emergencySosAlerts'),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString())
    );
    
    const snapshot = await getDocs(q);
    const alerts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmergencySosAlert));
    
    const analytics: SOSAnalytics = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length,
      avgResponseTime: 0,
      avgResolutionTime: 0,
      byPriority: {},
      byDay: {}
    };
    
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
    if (resolvedAlerts.length > 0) {
      const totalResponse = resolvedAlerts.reduce((sum, a) => sum + (a.responseTime || 0), 0);
      const totalResolution = resolvedAlerts.reduce((sum, a) => sum + (a.resolutionTime || 0), 0);
      analytics.avgResponseTime = Math.round(totalResponse / resolvedAlerts.length);
      analytics.avgResolutionTime = Math.round(totalResolution / resolvedAlerts.length);
    }
    
    alerts.forEach(a => {
      analytics.byPriority[a.priority] = (analytics.byPriority[a.priority] || 0) + 1;
      const day = a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : 'unknown';
      analytics.byDay[day] = (analytics.byDay[day] || 0) + 1;
    });
    
    return analytics;
  } catch (error) {
    console.error('Failed to compute SOS analytics:', error);
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      avgResponseTime: 0,
      avgResolutionTime: 0,
      byPriority: {},
      byDay: {}
    };
  }
};

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
