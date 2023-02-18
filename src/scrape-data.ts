import cheerio from "cheerio";
import { ICard } from "./models/card";
import PriceRecord, { IPriceRecord } from "./models/price-record";

const ROOT_URL = 'https://www.pricecharting.com/';

export async function getPriceRecord(card: ICard): Promise<IPriceRecord> {
    const res = await fetch(`${ROOT_URL}${card.path}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const record = {
        name: card.name,
        date: new Date(),
        ungraded: { price: getPrice($, 'used_price'), volume: getVolume($, 'used') },
        grade7: { price: getPrice($, 'complete_price'), volume: getVolume($, 'cib') },
        grade8: { price: getPrice($, 'new_price'), volume: getVolume($, 'new') },
        grade9: { price: getPrice($, 'graded_price'), volume: getVolume($, 'graded') },
        grade9_5: { price: getPrice($, 'box_only_price'), volume: getVolume($, 'box-only') },
        grade10: { price: getPrice($, 'manual_only_price'), volume: getVolume($, 'manual-only') },
    };
    const doc = new PriceRecord(record);
    return doc;
}

function getPrice($: cheerio.Root, id: string): number {
    return parseFloat($(`#${id} > .price:first`).text().replace(/[$,]/g, ''));
}

function getVolume($: cheerio.Root, specifier: string): string {
    return $(`[data-show-tab=completed-auctions-${specifier}] a`).text();
}