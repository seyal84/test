import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';
import * as sgMail from '@sendgrid/mail';
import { Twilio } from 'twilio';
import { NotificationType } from '@prisma/client';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ('email' | 'sms' | 'push' | 'inapp')[];
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface SMSNotification {
  to: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly twilio: Twilio;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize SendGrid
    const sendGridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridKey) {
      sgMail.setApiKey(sendGridKey);
    }

    // Initialize Twilio
    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioSid && twilioToken) {
      this.twilio = new Twilio(twilioSid, twilioToken);
    }
  }

  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Create notification record
      await this.prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
        },
      });

      // Get user details for contact information
      const user = await this.prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, phone: true, fullName: true },
      });

      if (!user) {
        this.logger.warn(`User ${notification.userId} not found for notification`);
        return;
      }

      const channels = notification.channels || ['inapp', 'email'];

      // Send via requested channels
      if (channels.includes('email') && user.email) {
        await this.sendEmail({
          to: user.email,
          subject: notification.title,
          html: this.generateEmailHTML(notification, user.fullName),
        });
      }

      if (channels.includes('sms') && user.phone) {
        await this.sendSMS({
          to: user.phone,
          message: `${notification.title}: ${notification.message}`,
        });
      }

      // In-app notifications are handled by the database record created above
      // Push notifications would be handled here if implemented

    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
    }
  }

  async sendEmail(email: EmailNotification): Promise<void> {
    try {
      const msg = {
        to: email.to,
        from: {
          email: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@homeflow.com',
          name: this.configService.get<string>('SENDGRID_FROM_NAME') || 'HomeFlow',
        },
        subject: email.subject,
        html: email.html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent to ${email.to}`);

    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendSMS(sms: SMSNotification): Promise<void> {
    try {
      if (!this.twilio) {
        this.logger.warn('Twilio not configured, skipping SMS');
        return;
      }

      await this.twilio.messages.create({
        body: sms.message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: sms.to,
      });

      this.logger.log(`SMS sent to ${sms.to}`);

    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });
  }

  async getNotifications(userId: string, limit: number = 20, offset: number = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // Specific notification types for real estate events
  async notifyOfferReceived(sellerId: string, offerData: any): Promise<void> {
    await this.sendNotification({
      userId: sellerId,
      type: NotificationType.OFFER_RECEIVED,
      title: 'New Offer Received',
      message: `You have received a new offer of $${offerData.amount.toLocaleString()} for your property.`,
      data: { offerId: offerData.id, amount: offerData.amount },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  async notifyOfferAccepted(buyerId: string, offerData: any): Promise<void> {
    await this.sendNotification({
      userId: buyerId,
      type: NotificationType.OFFER_ACCEPTED,
      title: 'Offer Accepted!',
      message: `Congratulations! Your offer has been accepted. Next steps will be communicated shortly.`,
      data: { offerId: offerData.id },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  async notifyOfferDeclined(buyerId: string, offerData: any): Promise<void> {
    await this.sendNotification({
      userId: buyerId,
      type: NotificationType.OFFER_DECLINED,
      title: 'Offer Update',
      message: `Your offer was not accepted. Consider submitting a new offer.`,
      data: { offerId: offerData.id },
      channels: ['email', 'inapp'],
    });
  }

  async notifyOfferCountered(buyerId: string, offerData: any, counterAmount: number): Promise<void> {
    await this.sendNotification({
      userId: buyerId,
      type: NotificationType.OFFER_COUNTERED,
      title: 'Counter Offer Received',
      message: `The seller has countered your offer with $${counterAmount.toLocaleString()}. Review and respond.`,
      data: { offerId: offerData.id, counterAmount },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  async notifyDocumentUploaded(userId: string, documentData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.DOCUMENT_UPLOADED,
      title: 'Document Uploaded',
      message: `A new document "${documentData.name}" has been uploaded to your transaction.`,
      data: { documentId: documentData.id, documentName: documentData.name },
      channels: ['email', 'inapp'],
    });
  }

  async notifyDocumentProcessed(userId: string, documentData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.DOCUMENT_PROCESSED,
      title: 'Document Processed',
      message: `Document "${documentData.name}" has been processed and analyzed.`,
      data: { documentId: documentData.id, documentName: documentData.name },
      channels: ['inapp'],
    });
  }

  async notifyMilestoneReached(userId: string, milestoneData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.MILESTONE_REACHED,
      title: 'Transaction Milestone',
      message: `Milestone "${milestoneData.title}" has been completed in your transaction.`,
      data: { milestoneId: milestoneData.id, milestoneTitle: milestoneData.title },
      channels: ['email', 'inapp'],
    });
  }

  async notifyPaymentDue(userId: string, paymentData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.PAYMENT_DUE,
      title: 'Payment Due',
      message: `Payment of $${paymentData.amount.toLocaleString()} is due for ${paymentData.description}.`,
      data: { paymentId: paymentData.id, amount: paymentData.amount },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  async notifyInspectionScheduled(userId: string, inspectionData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.INSPECTION_SCHEDULED,
      title: 'Inspection Scheduled',
      message: `Property inspection has been scheduled for ${inspectionData.date}.`,
      data: { inspectionDate: inspectionData.date },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  async notifyClosingReminder(userId: string, closingData: any): Promise<void> {
    await this.sendNotification({
      userId: userId,
      type: NotificationType.CLOSING_REMINDER,
      title: 'Closing Reminder',
      message: `Your property closing is scheduled for ${closingData.date}. Please prepare required documents.`,
      data: { closingDate: closingData.date },
      channels: ['email', 'sms', 'inapp'],
    });
  }

  private generateEmailHTML(notification: NotificationData, userName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">HomeFlow</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">${notification.title}</h2>
          <p style="color: #374151; line-height: 1.6;">Hello ${userName},</p>
          <p style="color: #374151; line-height: 1.6;">${notification.message}</p>
          
          <div style="margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in HomeFlow
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated message from HomeFlow. Please do not reply to this email.
          </p>
        </div>
        <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          © 2024 HomeFlow. All rights reserved.
        </div>
      </div>
    `;
  }
}