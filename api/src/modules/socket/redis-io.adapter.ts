import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    // TODO - load from config
    const redisAdapter = redisIoAdapter(process.env.REDIS_URI);

    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
