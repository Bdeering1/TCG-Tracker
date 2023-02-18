import { CallbackError, Document } from "mongoose";
import { ICard } from "../models/card";
import PriceRecord, { IPriceRecord } from "../models/price-record";
import { getPriceRecord } from "../scrape-data";

const MS_PER_WEEK = 604_800_000;

export async function update(card: ICard) {
    const recentRecords = await PriceRecord.$where(`this.date > new Date() - ${MS_PER_WEEK}`).find({ name: card.name });
    if (recentRecords.length === 0) {
        const record = await getPriceRecord(card) as Document<unknown, any, IPriceRecord> & IPriceRecord;

        record.save((err: CallbackError) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Successfully saved price record to DB');
            }
        });
    }
}

export async function getLatestPrices(card: ICard) {
    return await PriceRecord.findOne({ name: card.name }).sort({ date: -1 });
}