import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}
export declare class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor(jwtService: JwtService, configService: ConfigService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinListing(client: AuthenticatedSocket, data: {
        listingId: string;
    }): void;
    handleLeaveListing(client: AuthenticatedSocket, data: {
        listingId: string;
    }): void;
    handleJoinOffer(client: AuthenticatedSocket, data: {
        offerId: string;
    }): void;
    handleLeaveOffer(client: AuthenticatedSocket, data: {
        offerId: string;
    }): void;
    handleJoinEscrow(client: AuthenticatedSocket, data: {
        escrowId: string;
    }): void;
    handleLeaveEscrow(client: AuthenticatedSocket, data: {
        escrowId: string;
    }): void;
    sendToUser(userId: string, event: string, data: any): void;
    sendToRole(role: string, event: string, data: any): void;
    sendToListing(listingId: string, event: string, data: any): void;
    sendToOffer(offerId: string, event: string, data: any): void;
    sendToEscrow(escrowId: string, event: string, data: any): void;
    notifyNewOffer(offerId: string, listingId: string, offerData: any): void;
    notifyOfferStatusChange(offerId: string, status: string, data: any): void;
    notifyCounterOffer(offerId: string, counterOfferData: any): void;
    notifyDocumentUploaded(listingId: string, escrowId: string, documentData: any): void;
    notifyDocumentProcessed(documentId: string, listingId: string, escrowId: string, processingResult: any): void;
    notifyMilestoneUpdate(escrowId: string, milestoneData: any): void;
    notifyPaymentUpdate(escrowId: string, paymentData: any): void;
    notifyListingUpdate(listingId: string, listingData: any): void;
    notifyMarketUpdate(zipCode: string, marketData: any): void;
    isUserOnline(userId: string): boolean;
    getConnectedUsers(): string[];
    getConnectionCount(): number;
}
export {};
