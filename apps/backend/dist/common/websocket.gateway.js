var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebSocketGateway_1;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
let WebSocketGateway = WebSocketGateway_1 = class WebSocketGateway {
    jwtService;
    configService;
    server;
    logger = new Logger(WebSocketGateway_1.name);
    connectedClients = new Map();
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn('Client attempted to connect without token');
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            client.userId = payload.sub;
            client.userRole = payload.role;
            this.connectedClients.set(client.userId, client);
            client.join(`user:${client.userId}`);
            client.join(`role:${client.userRole}`);
            this.logger.log(`Client ${client.userId} connected with role ${client.userRole}`);
            client.emit('connected', {
                userId: client.userId,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.logger.error('Invalid token during connection', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.connectedClients.delete(client.userId);
            this.logger.log(`Client ${client.userId} disconnected`);
        }
    }
    handleJoinListing(client, data) {
        if (!client.userId)
            return;
        client.join(`listing:${data.listingId}`);
        this.logger.log(`User ${client.userId} joined listing ${data.listingId}`);
        client.emit('joined-listing', { listingId: data.listingId });
    }
    handleLeaveListing(client, data) {
        if (!client.userId)
            return;
        client.leave(`listing:${data.listingId}`);
        this.logger.log(`User ${client.userId} left listing ${data.listingId}`);
    }
    handleJoinOffer(client, data) {
        if (!client.userId)
            return;
        client.join(`offer:${data.offerId}`);
        this.logger.log(`User ${client.userId} joined offer ${data.offerId}`);
        client.emit('joined-offer', { offerId: data.offerId });
    }
    handleLeaveOffer(client, data) {
        if (!client.userId)
            return;
        client.leave(`offer:${data.offerId}`);
        this.logger.log(`User ${client.userId} left offer ${data.offerId}`);
    }
    handleJoinEscrow(client, data) {
        if (!client.userId)
            return;
        client.join(`escrow:${data.escrowId}`);
        this.logger.log(`User ${client.userId} joined escrow ${data.escrowId}`);
        client.emit('joined-escrow', { escrowId: data.escrowId });
    }
    handleLeaveEscrow(client, data) {
        if (!client.userId)
            return;
        client.leave(`escrow:${data.escrowId}`);
        this.logger.log(`User ${client.userId} left escrow ${data.escrowId}`);
    }
    sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    sendToRole(role, event, data) {
        this.server.to(`role:${role}`).emit(event, data);
    }
    sendToListing(listingId, event, data) {
        this.server.to(`listing:${listingId}`).emit(event, data);
    }
    sendToOffer(offerId, event, data) {
        this.server.to(`offer:${offerId}`).emit(event, data);
    }
    sendToEscrow(escrowId, event, data) {
        this.server.to(`escrow:${escrowId}`).emit(event, data);
    }
    notifyNewOffer(offerId, listingId, offerData) {
        this.sendToListing(listingId, 'new-offer', {
            offerId,
            listingId,
            offer: offerData,
            timestamp: new Date().toISOString(),
        });
    }
    notifyOfferStatusChange(offerId, status, data) {
        this.sendToOffer(offerId, 'offer-status-change', {
            offerId,
            status,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    notifyCounterOffer(offerId, counterOfferData) {
        this.sendToOffer(offerId, 'counter-offer', {
            offerId,
            counterOffer: counterOfferData,
            timestamp: new Date().toISOString(),
        });
    }
    notifyDocumentUploaded(listingId, escrowId, documentData) {
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
    notifyDocumentProcessed(documentId, listingId, escrowId, processingResult) {
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
    notifyMilestoneUpdate(escrowId, milestoneData) {
        this.sendToEscrow(escrowId, 'milestone-update', {
            escrowId,
            milestone: milestoneData,
            timestamp: new Date().toISOString(),
        });
    }
    notifyPaymentUpdate(escrowId, paymentData) {
        this.sendToEscrow(escrowId, 'payment-update', {
            escrowId,
            payment: paymentData,
            timestamp: new Date().toISOString(),
        });
    }
    notifyListingUpdate(listingId, listingData) {
        this.sendToListing(listingId, 'listing-update', {
            listingId,
            listing: listingData,
            timestamp: new Date().toISOString(),
        });
    }
    notifyMarketUpdate(zipCode, marketData) {
        this.server.emit('market-update', {
            zipCode,
            data: marketData,
            timestamp: new Date().toISOString(),
        });
    }
    isUserOnline(userId) {
        return this.connectedClients.has(userId);
    }
    getConnectedUsers() {
        return Array.from(this.connectedClients.keys());
    }
    getConnectionCount() {
        return this.connectedClients.size;
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], WebSocketGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('join-listing'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleJoinListing", null);
__decorate([
    SubscribeMessage('leave-listing'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleLeaveListing", null);
__decorate([
    SubscribeMessage('join-offer'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleJoinOffer", null);
__decorate([
    SubscribeMessage('leave-offer'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleLeaveOffer", null);
__decorate([
    SubscribeMessage('join-escrow'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleJoinEscrow", null);
__decorate([
    SubscribeMessage('leave-escrow'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleLeaveEscrow", null);
WebSocketGateway = WebSocketGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        namespace: '/api/ws'
    }),
    __metadata("design:paramtypes", [JwtService,
        ConfigService])
], WebSocketGateway);
export { WebSocketGateway };
//# sourceMappingURL=websocket.gateway.js.map