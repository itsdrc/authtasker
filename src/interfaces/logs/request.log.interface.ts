
// defines the log in fs
export interface IRequestLog {
    ip?: string;
    method: string;
    requestId: string;
    responseTime: number;
    statusCode: number;
    url: string;
}