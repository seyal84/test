var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';
import * as sgMail from '@sendgrid/mail';
import { Twilio } from 'twilio';
import { NotificationType } from '@prisma/client';
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    configService;
    logger = new Logger(NotificationService_1.name);
    twilio;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const sendGridKey = this.configService.get('SENDGRID_API_KEY');
        if (sendGridKey) {
            sgMail.setApiKey(sendGridKey);
        }
        const twilioSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const twilioToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (twilioSid && twilioToken) {
            this.twilio = new Twilio(twilioSid, twilioToken);
        }
    }
    async sendNotification(notification) {
        try {
            await this.prisma.notification.create({
                data: {
                    userId: notification.userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data || {},
                },
            });
            const user = await this.prisma.user.findUnique({
                where: { id: notification.userId },
                select: { email: true, phone: true, fullName: true },
            });
            if (!user) {
                this.logger.warn(`User ${notification.userId} not found for notification`);
                return;
            }
            const channels = notification.channels || ['inapp', 'email'];
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
        }
        catch (error) {
            this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
        }
    }
    async sendEmail(email) {
        try {
            const msg = {
                to: email.to,
                from: {
                    email: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@homeflow.com',
                    name: this.configService.get('SENDGRID_FROM_NAME') || 'HomeFlow',
                },
                subject: email.subject,
                html: email.html,
            };
            await sgMail.send(msg);
            this.logger.log(`Email sent to ${email.to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendSMS(sms) {
        try {
            if (!this.twilio) {
                this.logger.warn('Twilio not configured, skipping SMS');
                return;
            }
            await this.twilio.messages.create({
                body: sms.message,
                from: this.configService.get('TWILIO_PHONE_NUMBER'),
                to: sms.to,
            });
            this.logger.log(`SMS sent to ${sms.to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
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
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId: userId,
                isRead: false,
            },
        });
    }
    async getNotifications(userId, limit = 20, offset = 0) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    async notifyOfferReceived(sellerId, offerData) {
        await this.sendNotification({
            userId: sellerId,
            type: NotificationType.OFFER_RECEIVED,
            title: 'New Offer Received',
            message: `You have received a new offer of $${offerData.amount.toLocaleString()} for your property.`,
            data: { offerId: offerData.id, amount: offerData.amount },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    async notifyOfferAccepted(buyerId, offerData) {
        await this.sendNotification({
            userId: buyerId,
            type: NotificationType.OFFER_ACCEPTED,
            title: 'Offer Accepted!',
            message: `Congratulations! Your offer has been accepted. Next steps will be communicated shortly.`,
            data: { offerId: offerData.id },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    async notifyOfferDeclined(buyerId, offerData) {
        await this.sendNotification({
            userId: buyerId,
            type: NotificationType.OFFER_DECLINED,
            title: 'Offer Update',
            message: `Your offer was not accepted. Consider submitting a new offer.`,
            data: { offerId: offerData.id },
            channels: ['email', 'inapp'],
        });
    }
    async notifyOfferCountered(buyerId, offerData, counterAmount) {
        await this.sendNotification({
            userId: buyerId,
            type: NotificationType.OFFER_COUNTERED,
            title: 'Counter Offer Received',
            message: `The seller has countered your offer with $${counterAmount.toLocaleString()}. Review and respond.`,
            data: { offerId: offerData.id, counterAmount },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    async notifyDocumentUploaded(userId, documentData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.DOCUMENT_UPLOADED,
            title: 'Document Uploaded',
            message: `A new document "${documentData.name}" has been uploaded to your transaction.`,
            data: { documentId: documentData.id, documentName: documentData.name },
            channels: ['email', 'inapp'],
        });
    }
    async notifyDocumentProcessed(userId, documentData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.DOCUMENT_PROCESSED,
            title: 'Document Processed',
            message: `Document "${documentData.name}" has been processed and analyzed.`,
            data: { documentId: documentData.id, documentName: documentData.name },
            channels: ['inapp'],
        });
    }
    async notifyMilestoneReached(userId, milestoneData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.MILESTONE_REACHED,
            title: 'Transaction Milestone',
            message: `Milestone "${milestoneData.title}" has been completed in your transaction.`,
            data: { milestoneId: milestoneData.id, milestoneTitle: milestoneData.title },
            channels: ['email', 'inapp'],
        });
    }
    async notifyPaymentDue(userId, paymentData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.PAYMENT_DUE,
            title: 'Payment Due',
            message: `Payment of $${paymentData.amount.toLocaleString()} is due for ${paymentData.description}.`,
            data: { paymentId: paymentData.id, amount: paymentData.amount },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    async notifyInspectionScheduled(userId, inspectionData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.INSPECTION_SCHEDULED,
            title: 'Inspection Scheduled',
            message: `Property inspection has been scheduled for ${inspectionData.date}.`,
            data: { inspectionDate: inspectionData.date },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    async notifyClosingReminder(userId, closingData) {
        await this.sendNotification({
            userId: userId,
            type: NotificationType.CLOSING_REMINDER,
            title: 'Closing Reminder',
            message: `Your property closing is scheduled for ${closingData.date}. Please prepare required documents.`,
            data: { closingDate: closingData.date },
            channels: ['email', 'sms', 'inapp'],
        });
    }
    generateEmailHTML(notification, userName) {
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
};
NotificationService = NotificationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], NotificationService);
export { NotificationService };
//# sourceMappingURL=notification.service.js.map