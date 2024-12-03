import { SystemLoggerService } from "@root/services/system-logger.service";
import express, { Router } from "express";
import { Server as HttpServer } from "http";

export class Server {

    private readonly app = express();
    private server: HttpServer | undefined;

    constructor(
        private readonly port: number,
        private readonly routes: Router,
    ) {}

    start(): Promise<void> {
        this.app.use(express.json());
        this.app.use(this.routes);

        return new Promise<void>((resolve) => {
            this.server = this.app.listen(this.port, () => {
                SystemLoggerService.info(`Server listening on port ${this.port}`)
                resolve();
            });
        });
    }

    close(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.server) {
                this.server.closeAllConnections();
                this.server.close(() => {
                    SystemLoggerService.info('Server closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}