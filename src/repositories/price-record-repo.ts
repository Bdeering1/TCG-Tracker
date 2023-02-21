import { ICard } from "../models/card";
import PriceRecord, { IPriceRecord } from "../models/price-record";
import { scrapePriceRecord } from "../scrape-data";
import { Response } from "../types";

const MS_PER_WEEK = 604_800_000;

export async function updatePrice(card: ICard): Promise<Response<IPriceRecord>> {
    const recentRecords = await PriceRecord.$where(`this.date > new Date() - ${MS_PER_WEEK}`).find({ name: card.name });
    if (recentRecords.length === 0) {
        const record = await scrapePriceRecord(card);
        const document = new PriceRecord(record);

        try {
            document.save();
            return { data: record, success: true };
        }
        catch (err) {
            return { success: false, message: `Failed to update price for ${card.name}:\n ${err}` };
        }
    }
    return { success: true, message: 'Price record up to date' };
}

export async function getLatestPrices(card: ICard) {
    return await PriceRecord.findOne({ name: card.name }).sort({ date: -1 });
}