export type IncomingFile = {
    fileName?: string,
    body?: string
    url?: string
    hidden?: false
    userId?: string
    message?: string
    type?:string
    event_id?:string
    timestamp?: number
    roomId?: string
}

export interface FileListProps {
    files: IncomingFile[],
    remove: Function
}