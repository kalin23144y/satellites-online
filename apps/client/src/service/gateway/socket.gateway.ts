import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "events"
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log("WebSocket инициализирован");
  }

  handleConnection(client: Socket) {
    console.log(`Клиент подключен: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Клиент отключен: ${client.id}`);
  }

  @SubscribeMessage("events")
  handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    return `Получено сообщение: ${data}`;
  }
}
