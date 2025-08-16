import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';
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
export declare class NotificationService {
    private prisma;
    private configService;
    private readonly logger;
    private readonly twilio;
    constructor(prisma: PrismaService, configService: ConfigService);
    sendNotification(notification: NotificationData): Promise<void>;
    sendEmail(email: EmailNotification): Promise<void>;
    sendSMS(sms: SMSNotification): Promise<void>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    getNotifications(userId: string, limit?: number, offset?: number): Promise<any>;
    notifyOfferReceived(sellerId: string, offerData: any): Promise<void>;
    notifyOfferAccepted(buyerId: string, offerData: any): Promise<void>;
    notifyOfferDeclined(buyerId: string, offerData: any): Promise<void>;
    notifyOfferCountered(buyerId: string, offerData: any, counterAmount: number): Promise<void>;
    notifyDocumentUploaded(userId: string, documentData: any): Promise<void>;
    notifyDocumentProcessed(userId: string, documentData: any): Promise<void>;
    notifyMilestoneReached(userId: string, milestoneData: any): Promise<void>;
    notifyPaymentDue(userId: string, paymentData: any): Promise<void>;
    notifyInspectionScheduled(userId: string, inspectionData: any): Promise<void>;
    notifyClosingReminder(userId: string, closingData: any): Promise<void>;
    private generateEmailHTML;
}
