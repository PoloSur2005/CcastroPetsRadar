import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  private get host() {
    return process.env.REDIS_HOST ?? 'localhost';
  }

  private get port() {
    return Number(process.env.REDIS_PORT ?? 6379);
  }

  private async sendCommand(parts: string[]): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let data = '';

      socket.on('connect', () => {
        const payload = this.buildRespArray(parts);
        socket.write(payload);
      });

      socket.on('data', (chunk) => {
        data += chunk.toString();
        if (data.endsWith('\r\n')) {
          socket.end();
        }
      });

      socket.on('end', () => {
        resolve(this.parseResp(data));
      });

      socket.on('error', (error) => {
        this.logger.warn(`Redis unavailable: ${error.message}`);
        reject(error);
      });
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.sendCommand(['GET', key]);
    } catch {
      return null;
    }
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    try {
      await this.sendCommand(['SETEX', key, String(ttlSeconds), value]);
    } catch {
      // ignore cache errors
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.sendCommand(['DEL', key]);
    } catch {
      // ignore cache errors
    }
  }

  private buildRespArray(parts: string[]): string {
    const respParts = [`*${parts.length}\r\n`];
    for (const part of parts) {
      respParts.push(`$${Buffer.byteLength(part)}\r\n${part}\r\n`);
    }
    return respParts.join('');
  }

  private parseResp(resp: string): string | null {
    if (!resp) return null;
    const type = resp[0];
    if (type === '$') {
      const lines = resp.split('\r\n');
      if (lines[0] === '$-1') return null;
      return lines[1] ?? null;
    }
    if (type === '+') {
      return resp.slice(1).trim();
    }
    return null;
  }
}
