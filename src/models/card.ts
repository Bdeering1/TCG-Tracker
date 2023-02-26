import { model, Schema } from 'mongoose';

export interface ICard {
    name: string;
    type: string;
    path: string;
    expectedPrice?: number;
    graded?: string;
    sold?: boolean;
    grade?: number;
    notes?: string;
}

export function cardToString(card: ICard): string {
    const name = card.name;
    const expectedPrice = card.expectedPrice ? `: ~$${card.expectedPrice}` : '';
    const notes = card.notes ? ` (${card.notes})` : '';

    return `${name}${expectedPrice}${notes}`;
}

export const CardSchema = new Schema<ICard>({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    type: {
        type: String,
        required: true,
        enum: [ 'pokemon', 'yugioh', 'dummy' ],
        default: 'pokemon'
    },
    path: {
        type: String,
        required: true,
    },
    expectedPrice: {
        type: Number,
        min: 0,
    },
    graded: {
        type: String,
        required: true,
        enum: [ 'ungraded', 'pending', 'graded' ],
        default: 'ungraded',
    },
    sold: {
        type: Boolean,
        require: true,
        default: false,
    },
    grade: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0,
    },
    notes: {
        type: String,
    },
}, { versionKey: false });

const Card = model('Card', CardSchema);
export default Card;
