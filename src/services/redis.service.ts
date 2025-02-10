import Redis from 'ioredis';
import { ConfigService } from './config.service';
import { EventManager } from '@root/events/eventManager';
import { SystemLoggerService } from './system-logger.service';

// The RedisService emits the signal "fatalServiceConnectionError"
// when the connection can not be reestablished after a disconnection.
// Do note this service connection will not be re-opened after
// the max reconnection attemps unless the "serviceConnectionResumed" signal
// is emmited from another part of the application.

export class RedisService {

    private redis: Redis;
    static instances = 0;
    private firstConnectionSuccess = false;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const maxRetries = 5;
        let connectionAttempt = 0;
        
        this.redis = new Redis({
            lazyConnect: true,
            port: configService.REDIS_PORT,
            host: configService.REDIS_HOST,
            password: configService.REDIS_PASSWORD,
            db: RedisService.instances,
            retryStrategy: (times) => {
                if (times >= maxRetries) {
                    return null;
                }
                
                connectionAttempt = times;
                const delay = Math.min(times * 1000, 50000);
                SystemLoggerService.warn(`Retrying Redis connection (attempt ${times} of ${maxRetries}) in ${delay}ms...`);
                return delay;
            },
        });
        
        SystemLoggerService.info(`Redis service instance ${RedisService.instances} created`);
        
        if (configService.NODE_ENV === 'development' || configService.NODE_ENV === 'e2e') {
            if (RedisService.instances === 0) {
                this.listenConnectionEvents();
            }
        }
        
        ++RedisService.instances;
    }

    listenConnectionEvents(): void {
        this.redis.on('connect', () => {
            if (!this.firstConnectionSuccess) {
                SystemLoggerService.info(`Redis service connected`);
                this.firstConnectionSuccess = true;
            } else {
                SystemLoggerService.info(`Redis service reconnected`);
            }
        });

        // connection fully closed and will not reconnect
        this.redis.on('end', () => {
            SystemLoggerService.error(`Redis service disconnected`);
            EventManager.emit('fatalServiceConnectionError');
        });

        this.redis.on('error', (err) => {
            // connection errors are already handled
            if (!err.message.includes('ECONNREFUSED')) {
                SystemLoggerService.error(`Redis connection error: ${err.message}`);
            }
        });
    }

    async connect(): Promise<void> {
        if (this.redis.status !== 'ready') {
            await this.redis.connect();
        }
    }

    async disconnect(): Promise<void> {
        if (this.redis.status === 'ready') {
            await this.redis.quit();
        }
    }

    async set(key: string, data: string | number | object, expirationTime?: number): Promise<void> {
        if (typeof data === 'object')
            data = JSON.stringify(data);

        if (expirationTime)
            await this.redis.set(key, data, "EX", expirationTime);
        else
            await this.redis.set(key, data);
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                return data as T;
            }
        }
        return null;
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }
}