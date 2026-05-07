// src/modules/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
  }

  sendNotification(userId: string, notification: any) {
    this.server.emit(`notification:${userId}`, notification);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    client.join(`user:${userId}`);
    console.log(`Client ${client.id} a rejoint la room user:${userId}`);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, userId: string) {
    client.leave(`user:${userId}`);
    console.log(`Client ${client.id} a quitté la room user:${userId}`);
  }
}