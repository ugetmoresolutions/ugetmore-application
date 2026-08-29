// interfaces/newsletter/newsletter.ts
export interface INewsletterSubscriber {
  id?: number;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date | null;
  source?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface ICreateSubscriber {
  email: string;
  source?: string;
}

export interface INewsletterCampaign {
  id?: number;
  title: string;
  subject: string;
  content: string;
  scheduledFor?: Date | null;
  sentAt?: Date | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipientCount?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}