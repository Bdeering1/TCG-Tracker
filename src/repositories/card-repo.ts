import Card, { ICard } from "../models/card";
import { Option, Response } from "../types";


export async function findCard(cardName: string): Promise<Option<ICard>> {
    return await Card.findOne({ name: cardName });
}

export async function findCards(qString: string): Promise<ICard[]> {
    return await Card.find({ name: { $regex: qString, $options: 'i' } });
}

export async function getAllCards(): Promise<ICard[]> {
    return await Card.find();
}

export async function addCard(card: ICard): Promise<Response<void>> {
    const document = new Card(card);
    try {
        await document.save();
        return { success: true, message: `Succesfully added card ${card.name}` };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}

export async function updateCard(card: ICard): Promise<Response<void>> {
    const document = new Card(card);
    try {
        const res = await Card.updateOne({ name: document.name, graded: document.graded, grade: document.grade }, { $set: card });
        if (res.matchedCount === 0) return { success: false, message: `Card ${card.name} not found` };
        return { success: true, message: `Succesfully updated card ${card.name}` };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}

export async function updateAllCards(card: ICard): Promise<Response<void>> {
    try {
        const res = await Card.updateMany({}, { $set: card });
        if (res.matchedCount === 0) return { success: false, message: `No cards found` };
        return { success: true, message: `Successfully updated ${res.matchedCount} cards` };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}

export async function removeCard(card: ICard): Promise<Response<void>> {
    const document = new Card(card);
    try {
        const res = await Card.deleteOne({ name: document.name, graded: document.graded, grade: document.grade });
        if (res.deletedCount === 0) return { success: false, message: `Card ${card.name} not found` };
        return { success: true, message: `Successfuly deleted card ${card.name}` };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}

export async function removeCards(card: ICard): Promise<Response<void>> {
    const document = new Card(card);
    try {
        const res = await Card.deleteMany({ name: document.name, graded: document.graded, grade: card.grade ?? undefined });
        if (res.deletedCount === 0) return { success: false, message: `No cards found` };
        return { success: true, message: `Succesfully deleted ${res.deletedCount} cards` };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}