import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { RedisModule } from 'nestjs-redis';
import { QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { WsUserConnectedGateway } from './gateways/user-connected.gateway';
import { SocketUserService } from './services/socket-user.service';

@Module({
  imports: [
    QueueModule,
    // https://github.com/kyknow/nestjs-redis
    RedisModule.forRootAsync({
      // TODO - load config for redis socket
      useFactory: (configService: ConfigService) => configService.get('redis'),
      // useFactory: async (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    forwardRef(() => AuthModule)
  ],
  providers: [
    SocketUserService,
    WsUserConnectedGateway
  ],
  controllers: [
  ],
  exports: [
    SocketUserService
  ]
})
export class SocketModule {}
