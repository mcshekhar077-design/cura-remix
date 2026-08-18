export interface VoiceCommandAnalytics {
  commandId: string;
  commandDescription: string;
  confidence: number;
  matchedKeyword: string;
  timestamp: string;
  success: boolean;
  duration: number;
  manualInput: boolean;
}

class VoiceAnalytics {
  private static instance: VoiceAnalytics;
  private events: VoiceCommandAnalytics[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): VoiceAnalytics {
    if (!VoiceAnalytics.instance) {
      VoiceAnalytics.instance = new VoiceAnalytics();
    }
    return VoiceAnalytics.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  trackCommand(data: Omit<VoiceCommandAnalytics, 'timestamp'>): void {
    const event: VoiceCommandAnalytics = {
      ...data,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);
    this.logEvent(event);
    this.sendToAnalytics(event);
  }

  private logEvent(event: VoiceCommandAnalytics): void {
    console.debug('[Voice Analytics]', {
      sessionId: this.sessionId,
      ...event
    });
  }

  private sendToAnalytics(event: VoiceCommandAnalytics): void {
    // Send to external analytics service if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'voice_command', {
        command_id: event.commandId,
        command_description: event.commandDescription,
        confidence: event.confidence,
        success: event.success,
        manual_input: event.manualInput,
        duration: event.duration
      });
    }

    // Store in localStorage
    try {
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('voice_history') || '[]');
        history.push(event);
        if (history.length > 100) {
          history.shift();
        }
        localStorage.setItem('voice_history', JSON.stringify(history));
      }
    } catch {
      // Ignore storage errors
    }
  }

  getStats(): {
    totalCommands: number;
    successRate: number;
    mostUsedCommands: { description: string; count: number }[];
    averageConfidence: number;
  } {
    const total = this.events.length;
    const successful = this.events.filter(e => e.success).length;
    
    const commandCounts = this.events.reduce((acc, event) => {
      acc[event.commandDescription] = (acc[event.commandDescription] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsed = Object.entries(commandCounts)
      .map(([description, count]) => ({ description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgConfidence = this.events.reduce((sum, e) => sum + e.confidence, 0) / (total || 1);

    return {
      totalCommands: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      mostUsedCommands: mostUsed,
      averageConfidence: Math.round(avgConfidence * 100) / 100
    };
  }

  clear(): void {
    this.events = [];
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('voice_history');
      }
    } catch {
      // Ignore
    }
  }
}

export const voiceAnalytics = VoiceAnalytics.getInstance();
