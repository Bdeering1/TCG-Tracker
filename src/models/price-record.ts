import { model, Schema } from 'mongoose';

export interface IGrade {
    price: number;
    volume?: string;
}

const Grade = {
    price: Number,
    volume: String,
};

export interface IPriceRecord {
    name: string;
    date: Date;
    ungraded: IGrade;
    grade7?: IGrade;
    grade8?: IGrade;
    grade9?: IGrade;
    grade9_5?: IGrade;
    grade10?: IGrade;
}

export function priceToString(pr: IPriceRecord): string {
    const grade7 = pr.grade7 ? `, 7: $${pr.grade7.price}` : '';
    const grade8 = pr.grade8 ? `, 8: $${pr.grade8.price}` : '';
    const grade9 = pr.grade9 ? `, 9: $${pr.grade9.price}` : '';
    return `${pr.name} { ungraded: $${pr.ungraded.price}${grade7}${grade8}${grade9} }`;
}

export const PriceRecordSchema = new Schema<IPriceRecord>({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    ungraded: {
        price: Number,
        volume: String,
    },
    grade7: Grade,
    grade8: Grade,
    grade9: Grade,
    grade9_5: Grade,
    grade10: Grade,
}, { versionKey: false });

const PriceRecord = model('PriceRecord', PriceRecordSchema);
export default PriceRecord;
