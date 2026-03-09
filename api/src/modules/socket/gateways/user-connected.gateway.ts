import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets';
import { pick } from 'lodash';
import { ExtendedSocket } from 'src/@types/extended-socket';
import { QueueEventService } from 'src/kernel';
import { AuthService } from 'src/modules/auth';

import { USER_SOCKET_CONNECTED_CHANNEL, USER_SOCKET_EVENT } from '../constants';
import { SocketUserService } from '../services/socket-user.service';

@WebSocketGateway()
export class WsUserConnectedGateway
implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly socketUserService: SocketUserService,
    private readonly queueEventService: QueueEventService
  ) { }

  async handleConnection(client: ExtendedSocket): Promise<void> {
    if (!client.handshake.query.token) {
      return;
    }
    await this.login(client, client.handshake.query.token as string);
  }

  async handleDisconnect(client: ExtendedSocket) {
    if (!client.authUser) {
      return;
    }

    const connectionLen = await this.socketUserService.removeConnection(
      client.authUser.sourceId,
      client.id
    );
    if (connectionLen) {
      return;
    }
    if (client.authUser.source === 'user') {
      await this.queueEventService.publish({
        channel: USER_SOCKET_CONNECTED_CHANNEL,
        eventName: USER_SOCKET_EVENT.DISCONNECTED,
        data: client.authUser
      });
    }
  }

  @SubscribeMessage('auth/login')
  async handleLogin(client: ExtendedSocket, payload: { token: string }) {
    if (!payload || !payload.token) {
      // TODO - should do something?
      return;
      // client.emit('auth_error', {
      //   message: 'Invalid token!'
      // });
    }

    await this.login(client, payload.token);
  }

  @SubscribeMessage('auth/logout')
  async handleLogout(client: ExtendedSocket, payload: { token: string }) {
    if (!payload || !payload.token) {
      // TODO - should do something?
      return;
      // client.emit('auth_error', {
      //   message: 'Invalid token!'
      // });
    }

    await this.logout(client, payload.token);
  }

  async login(client: ExtendedSocket, token: string) {
    const decodeded = this.authService.verifyJWT(token);
    if (!decodeded) {
      return;
      // client.emit('auth_error', {
      //   message: 'Invalid token!'
      // });
    }
    await this.socketUserService.addConnection(decodeded.sourceId, client.id);
    // eslint-disable-next-line no-param-reassign
    client.authUser = pick(decodeded, ['source', 'sourceId', 'authId']);
    if (decodeded.source === 'user') {
      await this.queueEventService.publish({
        channel: USER_SOCKET_CONNECTED_CHANNEL,
        eventName: USER_SOCKET_EVENT.CONNECTED,
        data: client.authUser
      });
    }
  }

  async logout(client: ExtendedSocket, token: string) {
    const decodeded = this.authService.verifyJWT(token);
    if (!decodeded) {
      return;
      // client.emit('auth_error', {
      //   message: 'Invalid token!'
      // });
    }
    if (!client.authUser) {
      return;
    }
    const connectionLen = await this.socketUserService.removeConnection(decodeded.sourceId, client.id);
    if (connectionLen) {
      // TODO something?
      return;
    }
    // eslint-disable-next-line no-param-reassign
    client.authUser = pick(decodeded, ['source', 'sourceId', 'authId']);
    if (decodeded.source === 'user') {
      await this.queueEventService.publish({
        channel: USER_SOCKET_CONNECTED_CHANNEL,
        eventName: USER_SOCKET_EVENT.DISCONNECTED,
        data: client.authUser
      });
    }
  }
}
