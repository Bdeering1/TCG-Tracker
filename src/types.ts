import { IPriceRecord } from "./models/price-record";
import { Document } from "mongoose";
import { ICard } from "./models/card";


export type CardDocument = Document<unknown, any, ICard> & ICard;
export type PriceRecordDocument = Document<unknown, any, IPriceRecord> & IPriceRecord;

export type Option<T> = T | null;
export type Response<T> = {
    success: boolean;
    message?: string;
    data?: T;
}