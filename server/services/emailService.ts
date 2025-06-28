import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailUser {
  id: number;
  name: string;
  email: string;
  username: string;
  profileImage?: string;
}

interface FriendRequestEmailData {
  requester: EmailUser;
  recipient: EmailUser;
  profileUrl: string;
  acceptUrl: string;
}

interface MemoryTagEmailData {
  tagger: EmailUser;
  taggedUser: EmailUser;
  memoryTitle: string;
  memoryUrl: string;
  imageUrl?: string;
}

interface EventFeedbackEmailData {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  organizer: EmailUser;
  feedbackSummary: {
    totalResponses: number;
    averageRating: number;
    newComments: number;
    safetyReports: number;
  };
  dashboardUrl: string;
}

interface SafetyReportEmailData {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  organizer: EmailUser;
  reporter: {
    username: string; // Anonymous for safety
  };
  reportType: 'harassment' | 'inappropriate_behavior' | 'safety_concern' | 'other';
  description: string;
  timestamp: string;
  actionUrl: string;
}

type EmailType = 'friend_request' | 'memory_tag' | 'event_feedback' | 'safety_report';
type EmailData = FriendRequestEmailData | MemoryTagEmailData | EventFeedbackEmailData | SafetyReportEmailData;

class EmailService {
  private isProductionMode = process.env.NODE_ENV === 'production';
  private isEmailEnabled = process.env.ENABLE_EMAIL_SENDING === 'true';
  private fromEmail = 'Mundo Tango <noreply@mundotango.life>';

  constructor() {
    console.log('📧 EmailService initialized');
    console.log(`📧 Production mode: ${this.isProductionMode}`);
    console.log(`📧 Email sending enabled: ${this.isEmailEnabled}`);
  }

  async sendEmail(type: EmailType, data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getEmailTemplate(type, data);
      
      if (!this.isEmailEnabled) {
        console.log('📧 Email sending disabled - would send:', {
          type,
          to: template.to,
          subject: template.subject
        });
        return { success: true, messageId: 'mock-disabled' };
      }

      console.log(`📧 Sending ${type} email to:`, template.to);
      
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('📧 Email sent successfully:', result);
      
      // Track with analytics in production
      if (this.isProductionMode && typeof window !== 'undefined' && window.plausible) {
        window.plausible('Email Sent', {
          props: {
            emailType: type,
            recipientDomain: template.to.split('@')[1]
          }
        });
      }

      return { success: true, messageId: result.data?.id };
      
    } catch (error) {
      console.error(`📧 Failed to send ${type} email:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private getEmailTemplate(type: EmailType, data: EmailData) {
    switch (type) {
      case 'friend_request':
        return this.getFriendRequestTemplate(data as FriendRequestEmailData);
      case 'memory_tag':
        return this.getMemoryTagTemplate(data as MemoryTagEmailData);
      case 'event_feedback':
        return this.getEventFeedbackTemplate(data as EventFeedbackEmailData);
      case 'safety_report':
        return this.getSafetyReportTemplate(data as SafetyReportEmailData);
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  }

  private getFriendRequestTemplate(data: FriendRequestEmailData) {
    const subject = `${data.requester.name} wants to connect on Mundo Tango`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Friend Request</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .profile { display: flex; align-items: center; margin: 20px 0; }
            .profile img { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
            .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
            .button:hover { background: #1e3a8a; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🕺 New Friend Request</h1>
          </div>
          <div class="content">
            <p>Hi ${data.recipient.name},</p>
            
            <p><strong>${data.requester.name}</strong> (@${data.requester.username}) wants to connect with you on Mundo Tango!</p>
            
            <div class="profile">
              ${data.requester.profileImage ? 
                `<img src="${data.requester.profileImage}" alt="${data.requester.name}">` : 
                '<div style="width: 50px; height: 50px; background: #e5e7eb; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🕺</div>'
              }
              <div>
                <strong>${data.requester.name}</strong><br>
                <span style="color: #6b7280;">@${data.requester.username}</span>
              </div>
            </div>
            
            <p>Building connections in the tango community helps you discover new events, share experiences, and stay in touch with fellow dancers.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.acceptUrl}" class="button">Accept Request</a>
              <a href="${data.profileUrl}" class="button" style="background: #6b7280;">View Profile</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              You can manage your friend requests and privacy settings in your Mundo Tango account.
            </p>
          </div>
          <div class="footer">
            <p>Keep dancing! 💃<br>The Mundo Tango Team</p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      New Friend Request on Mundo Tango
      
      Hi ${data.recipient.name},
      
      ${data.requester.name} (@${data.requester.username}) wants to connect with you on Mundo Tango!
      
      Accept the request: ${data.acceptUrl}
      View their profile: ${data.profileUrl}
      
      Building connections in the tango community helps you discover new events, share experiences, and stay in touch with fellow dancers.
      
      Keep dancing!
      The Mundo Tango Team
    `;

    return {
      to: data.recipient.email,
      subject,
      html,
      text
    };
  }

  private getMemoryTagTemplate(data: MemoryTagEmailData) {
    const subject = `You were tagged in a tango memory by ${data.tagger.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Tagged in Memory</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .memory-preview { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .memory-image { width: 100%; max-height: 200px; object-fit: cover; border-radius: 6px; margin: 10px 0; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📸 Tagged in a Tango Memory</h1>
          </div>
          <div class="content">
            <p>Hi ${data.taggedUser.name},</p>
            
            <p><strong>${data.tagger.name}</strong> tagged you in a special tango memory!</p>
            
            <div class="memory-preview">
              <h3>${data.memoryTitle}</h3>
              ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Memory" class="memory-image">` : ''}
              <p style="color: #6b7280; font-size: 14px;">Shared by ${data.tagger.name} (@${data.tagger.username})</p>
            </div>
            
            <p>Relive this beautiful moment and see what memories you've created together in the tango community.</p>
            
            <div style="text-align: center;">
              <a href="${data.memoryUrl}" class="button">View Memory</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              You can adjust your tagging preferences in your account settings.
            </p>
          </div>
          <div class="footer">
            <p>Cherishing tango moments! 💃<br>The Mundo Tango Team</p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      Tagged in a Tango Memory
      
      Hi ${data.taggedUser.name},
      
      ${data.tagger.name} tagged you in a special tango memory: "${data.memoryTitle}"
      
      View the memory: ${data.memoryUrl}
      
      Relive this beautiful moment and see what memories you've created together in the tango community.
      
      Cherishing tango moments!
      The Mundo Tango Team
    `;

    return {
      to: data.taggedUser.email,
      subject,
      html,
      text
    };
  }

  private getEventFeedbackTemplate(data: EventFeedbackEmailData) {
    const subject = `Event Feedback Summary: ${data.event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Feedback Summary</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 6px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #059669; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Event Feedback Summary</h1>
          </div>
          <div class="content">
            <p>Hi ${data.organizer.name},</p>
            
            <p>Here's the latest feedback summary for your event:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${data.event.title}</h3>
              <p style="color: #6b7280;">
                📅 ${data.event.date}<br>
                📍 ${data.event.location}
              </p>
            </div>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${data.feedbackSummary.totalResponses}</div>
                <div class="stat-label">Total Responses</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.feedbackSummary.averageRating.toFixed(1)}/5</div>
                <div class="stat-label">Average Rating</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.feedbackSummary.newComments}</div>
                <div class="stat-label">New Comments</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.feedbackSummary.safetyReports}</div>
                <div class="stat-label">Safety Reports</div>
              </div>
            </div>
            
            ${data.feedbackSummary.safetyReports > 0 ? 
              '<p style="background: #fef2f2; color: #dc2626; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;"><strong>⚠️ Safety Reports Require Attention</strong><br>Please review the safety reports in your event dashboard.</p>' : 
              ''
            }
            
            <div style="text-align: center;">
              <a href="${data.dashboardUrl}" class="button">View Full Dashboard</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Regular feedback helps improve future events and builds trust in the tango community.
            </p>
          </div>
          <div class="footer">
            <p>Building better events together! 🎭<br>The Mundo Tango Team</p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      Event Feedback Summary
      
      Hi ${data.organizer.name},
      
      Here's the latest feedback for "${data.event.title}":
      
      📊 STATS:
      - Total Responses: ${data.feedbackSummary.totalResponses}
      - Average Rating: ${data.feedbackSummary.averageRating.toFixed(1)}/5
      - New Comments: ${data.feedbackSummary.newComments}
      - Safety Reports: ${data.feedbackSummary.safetyReports}
      
      ${data.feedbackSummary.safetyReports > 0 ? '⚠️ ATTENTION: Safety reports require your review.' : ''}
      
      View full dashboard: ${data.dashboardUrl}
      
      Building better events together!
      The Mundo Tango Team
    `;

    return {
      to: data.organizer.email,
      subject,
      html,
      text
    };
  }

  private getSafetyReportTemplate(data: SafetyReportEmailData) {
    const subject = `🚨 URGENT: Safety Report for ${data.event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Safety Report Alert</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .report-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 URGENT: Safety Report</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h3 style="color: #dc2626; margin-top: 0;">Immediate Attention Required</h3>
              <p>A safety report has been submitted for your event. Please review and take appropriate action immediately.</p>
            </div>
            
            <p>Hi ${data.organizer.name},</p>
            
            <div class="report-details">
              <h3>${data.event.title}</h3>
              <p style="color: #6b7280;">
                📅 ${data.event.date}<br>
                📍 ${data.event.location}
              </p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <h4>Report Details:</h4>
              <p><strong>Type:</strong> ${data.reportType.replace(/_/g, ' ').toUpperCase()}</p>
              <p><strong>Reported by:</strong> ${data.reporter.username} (anonymous)</p>
              <p><strong>Time:</strong> ${data.timestamp}</p>
              
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h5 style="margin-top: 0;">Description:</h5>
                <p style="margin-bottom: 0;">${data.description}</p>
              </div>
            </div>
            
            <div class="alert-box">
              <h4 style="color: #dc2626; margin-top: 0;">Required Actions:</h4>
              <ul style="margin-bottom: 0;">
                <li>Review the report details carefully</li>
                <li>Take immediate action if safety is at risk</li>
                <li>Document your response and actions taken</li>
                <li>Contact authorities if necessary</li>
                <li>Follow up with the reporting user if appropriate</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.actionUrl}" class="button">Review & Take Action</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              <strong>Confidentiality:</strong> This report is confidential. Please handle it with discretion and professionalism. The safety and well-being of our community is our top priority.
            </p>
          </div>
          <div class="footer">
            <p>Community Safety First 🛡️<br>The Mundo Tango Team</p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      🚨 URGENT: Safety Report Alert
      
      Hi ${data.organizer.name},
      
      A safety report has been submitted for your event "${data.event.title}".
      
      REPORT DETAILS:
      - Type: ${data.reportType.replace(/_/g, ' ').toUpperCase()}
      - Reported by: ${data.reporter.username} (anonymous)
      - Time: ${data.timestamp}
      - Event: ${data.event.date} at ${data.event.location}
      
      Description: ${data.description}
      
      REQUIRED ACTIONS:
      1. Review the report details carefully
      2. Take immediate action if safety is at risk
      3. Document your response and actions taken
      4. Contact authorities if necessary
      5. Follow up with the reporting user if appropriate
      
      Review and take action: ${data.actionUrl}
      
      This report is confidential. Please handle with discretion and professionalism.
      
      Community Safety First
      The Mundo Tango Team
    `;

    return {
      to: data.organizer.email,
      subject,
      html,
      text
    };
  }

  // Public methods for triggering emails
  async sendFriendRequestEmail(requester: EmailUser, recipient: EmailUser, profileUrl: string, acceptUrl: string) {
    return this.sendEmail('friend_request', {
      requester,
      recipient,
      profileUrl,
      acceptUrl
    });
  }

  async sendMemoryTagEmail(tagger: EmailUser, taggedUser: EmailUser, memoryTitle: string, memoryUrl: string, imageUrl?: string) {
    return this.sendEmail('memory_tag', {
      tagger,
      taggedUser,
      memoryTitle,
      memoryUrl,
      imageUrl
    });
  }

  async sendEventFeedbackEmail(
    event: EventFeedbackEmailData['event'],
    organizer: EmailUser,
    feedbackSummary: EventFeedbackEmailData['feedbackSummary'],
    dashboardUrl: string
  ) {
    return this.sendEmail('event_feedback', {
      event,
      organizer,
      feedbackSummary,
      dashboardUrl
    });
  }

  async sendSafetyReportEmail(
    event: SafetyReportEmailData['event'],
    organizer: EmailUser,
    reporter: SafetyReportEmailData['reporter'],
    reportType: SafetyReportEmailData['reportType'],
    description: string,
    timestamp: string,
    actionUrl: string
  ) {
    return this.sendEmail('safety_report', {
      event,
      organizer,
      reporter,
      reportType,
      description,
      timestamp,
      actionUrl
    });
  }
}

export const emailService = new EmailService();
export default emailService;