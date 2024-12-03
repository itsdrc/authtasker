
// defines the log in fs
export type RequestLog = {
    ip?: string;
    method: string;
    requestId: string;
    responseTime: number;
    statusCode: number;    
    url: string;
}