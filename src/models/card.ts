import { model, Schema } from 'mongoose';

export interface ICard {
    name: string;
    type: string;
    path: string;
    graded?: string;
    sold?: boolean;
    highestGrade?: number;
    lowestGrade?: number;
    notes?: string;
}

export function cardToString(card: ICard): string {
    return `${card.name} ${card.notes ? `(- ${card.notes})` : ''}`;
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
    highestGrade: {
        type: Number,
        min: 0,
        max: 10,
    },
    lowestGrade: {
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
