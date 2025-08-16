import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  namespace: '/api/ws'
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Client attempted to connect without token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      client.userRole = payload.role;

      // Store client reference
      this.connectedClients.set(client.userId, client);

      // Join user-specific room
      client.join(`user:${client.userId}`);
      
      // Join role-specific room
      client.join(`role:${client.userRole}`);

      this.logger.log(`Client ${client.userId} connected with role ${client.userRole}`);

      // Send connection confirmation
      client.emit('connected', { 
        userId: client.userId, 
        timestamp: new Date().toISOString() 
      });

    } catch (error) {
      this.logger.error('Invalid token during connection', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedClients.delete(client.userId);
      this.logger.log(`Client ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-listing')
  handleJoinListing(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { listingId: string }
  ) {
    if (!client.userId) return;

    client.join(`listing:${data.listingId}`);
    this.logger.log(`User ${client.userId} joined listing ${data.listingId}`);
    
    client.emit('joined-listing', { listingId: data.listingId });
  }

  @SubscribeMessage('leave-listing')
  handleLeaveListing(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { listingId: string }
  ) {
    if (!client.userId) return;

    client.leave(`listing:${data.listingId}`);
    this.logger.log(`User ${client.userId} left listing ${data.listingId}`);
  }

  @SubscribeMessage('join-offer')
  handleJoinOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { offerId: string }
  ) {
    if (!client.userId) return;

    client.join(`offer:${data.offerId}`);
    this.logger.log(`User ${client.userId} joined offer ${data.offerId}`);
    
    client.emit('joined-offer', { offerId: data.offerId });
  }

  @SubscribeMessage('leave-offer')
  handleLeaveOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { offerId: string }
  ) {
    if (!client.userId) return;

    client.leave(`offer:${data.offerId}`);
    this.logger.log(`User ${client.userId} left offer ${data.offerId}`);
  }

  @SubscribeMessage('join-escrow')
  handleJoinEscrow(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { escrowId: string }
  ) {
    if (!client.userId) return;

    client.join(`escrow:${data.escrowId}`);
    this.logger.log(`User ${client.userId} joined escrow ${data.escrowId}`);
    
    client.emit('joined-escrow', { escrowId: data.escrowId });
  }

  @SubscribeMessage('leave-escrow')
  handleLeaveEscrow(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { escrowId: string }
  ) {
    if (!client.userId) return;

    client.leave(`escrow:${data.escrowId}`);
    this.logger.log(`User ${client.userId} left escrow ${data.escrowId}`);
  }

  // Method to send notifications to specific users
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Method to send notifications to all users with a specific role
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // Method to send notifications to users watching a specific listing
  sendToListing(listingId: string, event: string, data: any) {
    this.server.to(`listing:${listingId}`).emit(event, data);
  }

  // Method to send notifications to users involved in a specific offer
  sendToOffer(offerId: string, event: string, data: any) {
    this.server.to(`offer:${offerId}`).emit(event, data);
  }

  // Method to send notifications to users involved in a specific escrow
  sendToEscrow(escrowId: string, event: string, data: any) {
    this.server.to(`escrow:${escrowId}`).emit(event, data);
  }

  // Specific real-time events for the real estate platform
  notifyNewOffer(offerId: string, listingId: string, offerData: any) {
    this.sendToListing(listingId, 'new-offer', {
      offerId,
      listingId,
      offer: offerData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyOfferStatusChange(offerId: string, status: string, data: any) {
    this.sendToOffer(offerId, 'offer-status-change', {
      offerId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  notifyCounterOffer(offerId: string, counterOfferData: any) {
    this.sendToOffer(offerId, 'counter-offer', {
      offerId,
      counterOffer: counterOfferData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyDocumentUploaded(listingId: string, escrowId: string, documentData: any) {
    const event = 'document-uploaded';
    const payload = {
      document: documentData,
      timestamp: new Date().toISOString(),
    };

    if (listingId) {
      this.sendToListing(listingId, event, { ...payload, listingId });
    }
    
    if (escrowId) {
      this.sendToEscrow(escrowId, event, { ...payload, escrowId });
    }
  }

  notifyDocumentProcessed(documentId: string, listingId: string, escrowId: string, processingResult: any) {
    const event = 'document-processed';
    const payload = {
      documentId,
      result: processingResult,
      timestamp: new Date().toISOString(),
    };

    if (listingId) {
      this.sendToListing(listingId, event, { ...payload, listingId });
    }
    
    if (escrowId) {
      this.sendToEscrow(escrowId, event, { ...payload, escrowId });
    }
  }

  notifyMilestoneUpdate(escrowId: string, milestoneData: any) {
    this.sendToEscrow(escrowId, 'milestone-update', {
      escrowId,
      milestone: milestoneData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyPaymentUpdate(escrowId: string, paymentData: any) {
    this.sendToEscrow(escrowId, 'payment-update', {
      escrowId,
      payment: paymentData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyListingUpdate(listingId: string, listingData: any) {
    this.sendToListing(listingId, 'listing-update', {
      listingId,
      listing: listingData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyMarketUpdate(zipCode: string, marketData: any) {
    // Send to all connected clients interested in this market area
    this.server.emit('market-update', {
      zipCode,
      data: marketData,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to check if a user is online
  isUserOnline(userId: string): boolean {
    return this.connectedClients.has(userId);
  }

  // Method to get all connected users
  getConnectedUsers(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  // Method to get connection count
  getConnectionCount(): number {
    return this.connectedClients.size;
  }
}