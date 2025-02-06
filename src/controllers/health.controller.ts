import { HTTP_STATUS_CODE } from '@root/rules/constants/http-status-codes.constants';
import { Request, Response } from 'express';

export class HealthController {    

    readonly getServerHealth = async (req: Request, res: Response): Promise<void> => {        
        const health = {
            status: 'UP',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(), 
            cpuUsage: process.cpuUsage(),
            timestamp: new Date(),
        };
        res.status(HTTP_STATUS_CODE.OK).json(health);
    }
}