import { EventManager } from "./eventManager";

export class ApplicationCloser {

    static async closeApplication(closeApplication: ()=> Promise<void>): Promise<void> {
        EventManager.listen('fatalServiceConnectionError', async () => {        
            await closeApplication();  
        });
    }
}