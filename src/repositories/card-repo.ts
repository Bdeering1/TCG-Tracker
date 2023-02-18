import Card, { ICard } from "../models/card";
import { CardDocument, Option, Response } from "../types";


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
        return { success: true };
    }
    catch (err) {
        return { success: false, message: `${err}` };
    }
}

export async function removeCard(card: ICard) {
    return await Card.deleteOne((doc: CardDocument) => doc.name === card.name);
}