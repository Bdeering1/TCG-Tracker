export type Option<T> = T | null;
export type Response<T> = {
    success: boolean;
    message?: string;
    data?: T;
}