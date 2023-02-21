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
    const notes = card.notes ? `(${card.notes})` : '';

    return `${name}${expectedPrice} ${notes}`;
}

export const CardSchema = new Schema<ICard>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
        enum: [ 'Pokemon', 'YuGiOh' ],
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
        enum: [ 'Ungraded', 'Pending', 'Graded' ],
        default: 'Ungraded',
    },
    sold: {
        type: Boolean,
        require: true,
        default: false,
    },
    grade: {
        type: Number,
        min: 0,
        max: 10,
    },
    notes: {
        type: String,
    },
});

const Card = model('Card', CardSchema);
export default Card;
