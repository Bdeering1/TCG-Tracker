import { ICard } from "../models/card";
import PriceRecord, { IPriceRecord } from "../models/price-record";
import { scrapePriceRecord } from "../scrape-data";
import { Response } from "../types";
import { getAllCards, updateCard } from "./card-repo";

const MS_PER_WEEK = 604_800_000;

export async function getLatestPrices(card: ICard) {
    return await PriceRecord.findOne({ name: card.name }).sort({ date: -1 });
}
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

export async function updateAllPrices(): Promise<boolean> {
    let allSuccess = true;
    const allCards = await getAllCards();
    for (const card of allCards) {
        console.log(`updating ${card.name}`);
        const priceRes = await updatePrice(card);
        if (!priceRes.success) {
            console.log(priceRes.message);
            allSuccess = false;
            continue;
        }
        if (priceRes.data === undefined) continue;
        if (card.graded === 'graded') {
            switch (roundGrade(card.grade as number)) {
                case 7:
                    card.expectedPrice = priceRes.data.grade7?.price;
                    break;
                case 8:
                    card.expectedPrice = priceRes.data.grade8?.price;
                    break;
                case 9:
                    card.expectedPrice = priceRes.data.grade9?.price;
                    break;
                case 9.5:
                    card.expectedPrice = priceRes.data.grade9_5?.price;
                    break;
                case 10:
                    card.expectedPrice = priceRes.data.grade10?.price;
                    break;
                default:
                    card.expectedPrice;
                    break;
            }
        }
        if (!card.expectedPrice) card.expectedPrice = priceRes.data.ungraded.price;
        const cardRes = await updateCard(card);
        if (!cardRes.success) {
            console.log(cardRes.message);
            allSuccess = false;
        }
    }
    if (allSuccess) console.log('Successfully updated all cards');
    return allSuccess;
}

function roundGrade(grade: number) {
    if (grade === 9.5) return 9.5;
    else return Math.round(grade);
}