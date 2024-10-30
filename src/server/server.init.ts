import express, { Router } from "express";

export class Server {

    private readonly app = express();

    constructor(
        private readonly port: number,
        private readonly routes: Router,
    ) {}

    start(): void {
        this.app.use(express.json());
        this.app.use(this.routes);
        this.app.listen(this.port, () => {
            console.log(`Listening on port ${this.port}`);
        })
    }
}