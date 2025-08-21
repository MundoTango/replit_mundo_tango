import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { db } from '../db';
import { users, events, eventRsvps, subscriptions } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { format, addDays } from 'date-fns';
import * as cron from 'node-cron';

// Email service supporting multiple providers
export class EmailService {
  private resend?: Resend;
  private transporter?: nodemailer.Transporter;
  private provider: 'resend' | 'sendgrid' | 'smtp';

  constructor() {
    // Initialize based on available environment variables
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.provider = 'resend';
    } else if (process.env.SMTP_HOST) {
      // Fallback to SMTP (for development/testing)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.provider = 'smtp';
    } else {
      this.provider = 'smtp';
      console.warn('No email provider configured. Emails will be logged only.');
    }
  }

  // Send email using configured provider
  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const emailData = {
      from: process.env.EMAIL_FROM || 'noreply@mundotango.life',
      to,
      subject,
      html,
      text: text || this.stripHtml(html),
    };

    if (this.provider === 'resend' && this.resend) {
      try {
        const { data, error } = await this.resend.emails.send(emailData);
        if (error) throw error;
        return { success: true, messageId: data?.id };
      } catch (error) {
        console.error('Resend email error:', error);
        return { success: false, error };
      }
    } else if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(emailData);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error('SMTP email error:', error);
        return { success: false, error };
      }
    } else {
      // Log email for development
      console.log('📧 Email would be sent:', emailData);
      return { success: true, messageId: 'dev-' + Date.now() };
    }
  }

  // Strip HTML tags for text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Email Templates
  async sendWelcomeEmail(user: { email: string; name: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Mundo Tango!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937;">¡Hola ${user.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Welcome to the global tango community. We're thrilled to have you join our passionate community of dancers, organizers, and tango enthusiasts from around the world.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #38b2ac;">Get Started:</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>Complete your profile and add your tango roles</li>
              <li>Find events and milongas in your city</li>
              <li>Connect with dancers in your area</li>
              <li>Share your tango memories</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/profile" style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Your Profile
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to Mundo Tango!', html);
  }

  async sendEventReminder(eventData: any, attendee: any) {
    const eventDate = format(new Date(eventData.startDate), 'EEEE, MMMM d, yyyy');
    const eventTime = format(new Date(eventData.startDate), 'h:mm a');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Event Reminder</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937;">${eventData.title}</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #6b7280; margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>🕐 Time:</strong> ${eventTime}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>📍 Location:</strong> ${eventData.location}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>💃 Type:</strong> ${eventData.eventType}</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            ${eventData.description}
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/events/${eventData.id}" style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Event Details
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(attendee.email, `Reminder: ${eventData.title} tomorrow`, html);
  }

  async sendSubscriptionConfirmation(user: any, plan: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Subscription Confirmed!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Thank you, ${user.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your ${plan} subscription has been activated. You now have access to all premium features.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #38b2ac;">Your Premium Benefits:</h3>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>Unlimited event creation</li>
              <li>Advanced analytics dashboard</li>
              <li>Priority support</li>
              <li>Custom profile URL</li>
              <li>Event promotion tools</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/settings/subscription" style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Subscription
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to Mundo Tango Premium!', html);
  }

  async sendEventDelegationInvite(event: any, invitedUser: any, role: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Event Admin Invitation</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937;">You've been invited!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            You've been invited to be a ${role} for the event:
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #38b2ac;">${event.title}</h3>
            <p style="color: #6b7280;">${event.description}</p>
            <p style="color: #6b7280;"><strong>Location:</strong> ${event.location}</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            As a ${role}, you'll be able to help manage this event, moderate content, and ensure everything runs smoothly.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/events/${event.id}/admin" style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(invitedUser.email, `Invitation: ${role} for ${event.title}`, html);
  }

  // Scheduled Email Jobs
  setupScheduledEmails() {
    // Daily event reminders at 10 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Running daily event reminder job...');
      await this.sendDailyEventReminders();
    });

    // Weekly digest every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('Running weekly digest job...');
      await this.sendWeeklyDigest();
    });
  }

  private async sendDailyEventReminders() {
    // Get events happening tomorrow
    const tomorrow = addDays(new Date(), 1);
    const dayAfter = addDays(new Date(), 2);

    const upcomingEvents = await db.select({
      event: events,
      rsvp: eventRsvps,
      user: users,
    })
    .from(events)
    .innerJoin(eventRsvps, eq(eventRsvps.eventId, events.id))
    .innerJoin(users, eq(users.id, eventRsvps.userId))
    .where(
      and(
        eq(eventRsvps.status, 'going'),
        gte(events.startDate, tomorrow),
        lte(events.startDate, dayAfter)
      )
    );

    // Send reminders
    for (const { event, user } of upcomingEvents) {
      await this.sendEventReminder(event, user);
    }
  }

  private async sendWeeklyDigest() {
    // Get active users
    const activeUsers = await db.select().from(users).where(eq(users.isActive, true));

    for (const user of activeUsers) {
      // Get upcoming events in user's city
      const cityEvents = await db.select()
        .from(events)
        .where(
          and(
            eq(events.city, user.city || ''),
            gte(events.startDate, new Date()),
            lte(events.startDate, addDays(new Date(), 7))
          )
        )
        .limit(5);

      if (cityEvents.length > 0) {
        await this.sendWeeklyEventDigest(user, cityEvents);
      }
    }
  }

  private async sendWeeklyEventDigest(user: any, events: any[]) {
    const eventsList = events.map(event => `
      <div style="border-bottom: 1px solid #e5e7eb; padding: 15px 0;">
        <h4 style="color: #38b2ac; margin: 0 0 5px 0;">${event.title}</h4>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          📅 ${format(new Date(event.startDate), 'EEEE, MMMM d')} at ${format(new Date(event.startDate), 'h:mm a')}<br>
          📍 ${event.location}
        </p>
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Your Weekly Tango Digest</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <h2 style="color: #1f2937;">¡Hola ${user.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Here are the upcoming tango events in ${user.city} this week:
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            ${eventsList}
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/events" style="background: linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Events
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, `Tango events in ${user.city} this week`, html);
  }
}

// Import react-email templates
import EventReminderEmail from '../emails/EventReminderEmail';
import EventDelegationEmail from '../emails/EventDelegationEmail';

// Export singleton instance
export const emailService = new EmailService();

// Beautiful email template methods
export async function sendEventReminderWithTemplate(event: any, user: any) {
  const { render } = await import('@react-email/components');
  
  const emailHtml = render(EventReminderEmail({
    userName: user.name || user.username,
    eventTitle: event.title,
    eventDate: new Date(event.startDate).toLocaleDateString(),
    eventTime: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    eventLocation: event.location,
    eventDescription: event.description || '',
    eventType: event.eventType,
    eventUrl: `${process.env.BASE_URL || 'https://mundotango.life'}/events/${event.id}`
  }));

  await emailService.sendEmail(user.email, `Reminder: ${event.title} is tomorrow!`, emailHtml);
}

export async function sendEventDelegationInvite(event: any, user: any, role: string, inviterName: string) {
  const { render } = await import('@react-email/components');
  
  const emailHtml = render(EventDelegationEmail({
    userName: user.name || user.username,
    eventTitle: event.title,
    eventDescription: event.description || '',
    eventLocation: event.location,
    role: role,
    inviterName: inviterName,
    acceptUrl: `${process.env.BASE_URL || 'https://mundotango.life'}/events/${event.id}/accept-admin`
  }));

  await emailService.sendEmail(user.email, `You've been invited to manage ${event.title}`, emailHtml);
}