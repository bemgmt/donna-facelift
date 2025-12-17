import { TourConfig } from '@/types/onboarding'

export const dashboardTour: TourConfig = {
  id: 'dashboard-full-tour',
  type: 'full',
  title: 'Welcome to Your DONNA Dashboard',
  description: 'Let me show you around your new AI-powered workspace',
  canSkip: true,
  canPause: true,
  autoStart: false,
  steps: [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to DONNA! 🎉',
      description: 'I\'m excited to show you around! This tour will help you discover all the powerful features at your fingertips. You can pause or skip anytime.',
      placement: 'center'
    },
    {
      id: 'chat-widget',
      target: '[aria-label="Open DONNA Chat"]',
      title: 'Your AI Assistant',
      description: 'Click here anytime to chat with me! I can help with tasks, answer questions, and guide you through any feature. I\'m always here to help.',
      placement: 'left',
      highlightPadding: 12
    },
    {
      id: 'dashboard-grid',
      target: '.grid',
      title: 'Your Dashboard',
      description: 'This is your command center. Each card represents a different area of your business. Hover over any card to see a preview, then click to dive in.',
      placement: 'top',
      highlightPadding: 16
    },
    {
      id: 'email-section',
      target: '[data-tour="email-interface"]',
      title: 'Email Management',
      description: 'Manage all your emails in one place. I can help you draft responses, organize your inbox, and never miss an important message.',
      placement: 'bottom',
      highlightPadding: 8,
      beforeShow: async () => {
        // Scroll to email section if needed
        const element = document.querySelector('[data-tour="email-interface"]')
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    {
      id: 'analytics-section',
      target: '[data-tour="analytics-interface"]',
      title: 'Analytics & Insights',
      description: 'Track your business metrics and get AI-powered insights. I analyze your data and provide actionable recommendations.',
      placement: 'bottom',
      highlightPadding: 8
    },
    {
      id: 'settings',
      target: '[aria-label="Settings"]',
      title: 'Settings & Preferences',
      description: 'Customize your experience here. Adjust my personality, set up integrations, and configure your preferences.',
      placement: 'left',
      highlightPadding: 8
    },
    {
      id: 'voice-controls',
      target: '[aria-label="Voice Controls"]',
      title: 'Voice Interaction',
      description: 'Prefer to talk? Click here to enable voice mode. You can speak to me naturally, and I\'ll respond with voice too!',
      placement: 'bottom',
      highlightPadding: 8
    },
    {
      id: 'complete',
      target: 'body',
      title: 'You\'re All Set! 🚀',
      description: 'That\'s the quick tour! Remember, you can always ask me for help or request a deeper tour of any section. Ready to get started?',
      placement: 'center'
    }
  ],
  onComplete: () => {
    // Save tour completion
    localStorage.setItem('donna_dashboard_tour_completed', 'true')
    // Trigger celebration animation
    window.dispatchEvent(new CustomEvent('donna:tour-complete', {
      detail: { tourId: 'dashboard-full-tour' }
    }))
  },
  onSkip: () => {
    localStorage.setItem('donna_dashboard_tour_skipped', 'true')
  }
}

export const emailSectionTour: TourConfig = {
  id: 'email-section-tour',
  type: 'section',
  title: 'Email Management Deep Dive',
  description: 'Master your email workflow with DONNA',
  canSkip: true,
  canPause: true,
  steps: [
    {
      id: 'inbox',
      target: '[data-tour="email-inbox"]',
      title: 'Your Inbox',
      description: 'All your emails in one place. I automatically categorize and prioritize them for you.',
      placement: 'right'
    },
    {
      id: 'compose',
      target: '[data-tour="email-compose"]',
      title: 'AI-Powered Composition',
      description: 'Let me help you write emails! Just tell me what you want to say, and I\'ll draft it in your style.',
      placement: 'left'
    },
    {
      id: 'filters',
      target: '[data-tour="email-filters"]',
      title: 'Smart Filters',
      description: 'Filter by priority, sender, or category. I learn what\'s important to you over time.',
      placement: 'bottom'
    },
    {
      id: 'templates',
      target: '[data-tour="email-templates"]',
      title: 'Email Templates',
      description: 'Save time with templates. I can create custom templates based on your most common emails.',
      placement: 'top'
    }
  ],
  onComplete: () => {
    localStorage.setItem('donna_email_tour_completed', 'true')
  }
}

export const analyticsSectionTour: TourConfig = {
  id: 'analytics-section-tour',
  type: 'section',
  title: 'Analytics & Insights',
  description: 'Understand your business metrics',
  canSkip: true,
  canPause: true,
  steps: [
    {
      id: 'overview',
      target: '[data-tour="analytics-overview"]',
      title: 'Performance Overview',
      description: 'See your key metrics at a glance. I highlight trends and anomalies automatically.',
      placement: 'bottom'
    },
    {
      id: 'charts',
      target: '[data-tour="analytics-charts"]',
      title: 'Visual Analytics',
      description: 'Interactive charts help you understand your data. Click any chart for deeper insights.',
      placement: 'top'
    },
    {
      id: 'insights',
      target: '[data-tour="analytics-insights"]',
      title: 'AI Insights',
      description: 'I analyze your data and provide actionable recommendations to improve your business.',
      placement: 'left'
    }
  ],
  onComplete: () => {
    localStorage.setItem('donna_analytics_tour_completed', 'true')
  }
}

export const quickTips: TourConfig = {
  id: 'quick-tips',
  type: 'mini',
  title: 'Quick Tips',
  description: 'Helpful shortcuts and features',
  canSkip: true,
  canPause: false,
  steps: [
    {
      id: 'keyboard-shortcuts',
      target: 'body',
      title: 'Keyboard Shortcuts',
      description: 'Press Ctrl+K (Cmd+K on Mac) to quickly open the command palette. Press / to focus search.',
      placement: 'center'
    },
    {
      id: 'ask-donna',
      target: '[aria-label="Open DONNA Chat"]',
      title: 'Just Ask!',
      description: 'Not sure how to do something? Just ask me! I can guide you through any task or feature.',
      placement: 'left'
    }
  ]
}

// Export all tours for easy importing
// Note: Defined after all individual tours to avoid circular dependency issues
export const allTours = {
  dashboardTour,
  emailSectionTour,
  analyticsSectionTour,
  marketingSectionTour,
  salesSectionTour,
  settingsSectionTour,
  quickTips
}

export const marketingSectionTour: TourConfig = {
  id: 'marketing-section-tour',
  type: 'section',
  title: 'Marketing Tools',
  description: 'Discover powerful marketing features',
  canSkip: true,
  canPause: true,
  steps: [
    {
      id: 'campaigns',
      target: '[data-tour="marketing-campaigns"]',
      title: 'Campaign Management',
      description: 'Create and manage your marketing campaigns all in one place. I can help you optimize campaigns for better results.',
      placement: 'bottom'
    },
    {
      id: 'analytics',
      target: '[data-tour="marketing-analytics"]',
      title: 'Marketing Analytics',
      description: 'Track campaign performance, engagement rates, and ROI. I analyze trends and suggest improvements.',
      placement: 'top'
    },
    {
      id: 'content',
      target: '[data-tour="marketing-content"]',
      title: 'Content Creation',
      description: 'I can help you create compelling marketing content, from social media posts to email campaigns.',
      placement: 'right'
    },
    {
      id: 'automation',
      target: '[data-tour="marketing-automation"]',
      title: 'Marketing Automation',
      description: 'Set up automated workflows to nurture leads and engage customers at the right time.',
      placement: 'left'
    }
  ],
  onComplete: () => {
    localStorage.setItem('donna_marketing_tour_completed', 'true')
  }
}

export const salesSectionTour: TourConfig = {
  id: 'sales-section-tour',
  type: 'section',
  title: 'Sales Dashboard',
  description: 'Master your sales process',
  canSkip: true,
  canPause: true,
  steps: [
    {
      id: 'pipeline',
      target: '[data-tour="sales-pipeline"]',
      title: 'Sales Pipeline',
      description: 'Visualize your sales process and track deals through each stage. I help identify bottlenecks and opportunities.',
      placement: 'bottom'
    },
    {
      id: 'leads',
      target: '[data-tour="sales-leads"]',
      title: 'Lead Management',
      description: 'Organize and prioritize your leads. I can help qualify leads and suggest the best follow-up actions.',
      placement: 'top'
    },
    {
      id: 'forecasting',
      target: '[data-tour="sales-forecasting"]',
      title: 'Sales Forecasting',
      description: 'Get AI-powered predictions on your sales performance. I analyze patterns to help you plan ahead.',
      placement: 'right'
    },
    {
      id: 'reports',
      target: '[data-tour="sales-reports"]',
      title: 'Sales Reports',
      description: 'Generate detailed reports on your sales activities, performance metrics, and team productivity.',
      placement: 'left'
    }
  ],
  onComplete: () => {
    localStorage.setItem('donna_sales_tour_completed', 'true')
  }
}

export const settingsSectionTour: TourConfig = {
  id: 'settings-section-tour',
  type: 'section',
  title: 'Settings & Preferences',
  description: 'Customize your DONNA experience',
  canSkip: true,
  canPause: true,
  steps: [
    {
      id: 'profile',
      target: '[data-tour="settings-profile"]',
      title: 'Profile Settings',
      description: 'Update your personal information, preferences, and account details.',
      placement: 'bottom'
    },
    {
      id: 'personality',
      target: '[data-tour="settings-personality"]',
      title: 'DONNA Personality',
      description: 'Customize how I communicate with you. Adjust my tone, formality, and communication style.',
      placement: 'top'
    },
    {
      id: 'integrations',
      target: '[data-tour="settings-integrations"]',
      title: 'Integrations',
      description: 'Connect your favorite tools and services. I can work with your existing workflow.',
      placement: 'right'
    },
    {
      id: 'notifications',
      target: '[data-tour="settings-notifications"]',
      title: 'Notifications',
      description: 'Control how and when you receive updates. Stay informed without being overwhelmed.',
      placement: 'left'
    },
    {
      id: 'security',
      target: '[data-tour="settings-security"]',
      title: 'Security & Privacy',
      description: 'Manage your security settings, two-factor authentication, and privacy preferences.',
      placement: 'bottom'
    }
  ],
  onComplete: () => {
    localStorage.setItem('donna_settings_tour_completed', 'true')
  }
}

