export type IncomingFile = {
    fileName?: string,
    body?: string
    url?: string
    hidden?: false
}

export interface FileListProps {
    files: IncomingFile[],
    remove: Function
}