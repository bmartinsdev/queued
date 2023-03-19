export interface QueuedOptions {
    limit?: number
    retry?: number
    onUpdate?: CallableFunction
}

export type QueueStatus = 'queued' | 'processing' | 'canceled' | 'complete' | 'failed'

export interface QueueInfo {
    retried: number
    status: QueueStatus
    result?: unknown
}