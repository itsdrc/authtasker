import Redis from 'ioredis'
import { ConfigService } from './config.service';
import { SystemLoggerService } from './system-logger.service';

export class RedisService {

    private redis: Redis;
    static instances = 0;

    constructor(private readonly configService: ConfigService) {
        this.redis = new Redis({
            port: configService.REDIS_PORT,
            host: configService.REDIS_HOST,
            password: configService.REDIS_PASSWORD,
            db: RedisService.instances
        });

        SystemLoggerService.info(`Redis service instance db:${RedisService.instances} injected`);
        ++RedisService.instances;
    }

    async set(key: string, data: string | number | object, expirationTime?: number): Promise<void> {
        if (typeof data === 'object')
            data = JSON.stringify(data);

        if (expirationTime)
            await this.redis.set(key, data, "EX", expirationTime);
        else
            await this.redis.set(key, data);
    }

    async get<T>(key: string): Promise<T | undefined> {
        const data = await this.redis.get(key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                return data as T;
            }
        }
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }
}