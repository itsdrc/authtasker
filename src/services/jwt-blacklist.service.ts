import { RedisService } from "./redis.service";

export class JwtBlackListService {

    constructor(
        private readonly redisService: RedisService,        
    ) {}

    async blacklist(jti: string, expirationTime: number): Promise<void> {
        await this.redisService.set(jti, 'blacklisted', expirationTime);
    }

    async isBlacklisted(tokenJti: string): Promise<boolean> {
        const exists = await this.redisService.get<string>(tokenJti);
        return !!exists;
    }
}