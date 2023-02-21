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
    return `${pr.name} - $${pr.ungraded.price} ungraded`;
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
});

const PriceRecord = model('PriceRecord', PriceRecordSchema);
export default PriceRecord;
