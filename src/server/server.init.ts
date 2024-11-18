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
                console.log(`Server listening on port ${this.port}`);
                resolve();
            });
        });
    }

    close(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.server) {
                this.server.closeAllConnections();
                this.server.close(() => {
                    console.log('Server closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}