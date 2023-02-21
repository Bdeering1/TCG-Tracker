import express from 'express';
import mongoose, { connect, CallbackError } from 'mongoose';
import { ICard, cardToString } from './models/card';
import { Option } from './types';
import { addCard, findCard, findCards, getAllCards, updateCard } from './repositories/card-repo';
import { getLatestPrices, updatePrice } from './repositories/price-record-repo';
import bodyParser from 'body-parser';
import { IPriceRecord, priceToString } from './models/price-record';

const HTTP_OK = 200;
const HTTP_ERROR = 500;
const HTTP_NOT_FOUND = 404;
const DEFAULT_PORT = 8080;

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME;


if (MONGO_USERNAME && MONGO_PASSWORD && MONGO_HOSTNAME && MONGO_PORT) {
    const mongoUri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DATABASE_NAME}?authSource=admin`;

    mongoose.set('strictQuery', true);
    connect(mongoUri, (err: CallbackError) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Successfully connected to MongoDB');
        }
    });
}
else {
    console.log('MongoDB connection string missing or incomplete');
}


const app = express();
app.use(bodyParser.json());

app.get('/', (_, res) => {
    res.status(HTTP_OK).send('Hello World!');
});


app.get('/card/:name', async (req, res) => {
    let card: Option<ICard | string> = await findCard(req.params.name);
    if (card && req.query.format === 'string') card = cardToString(card);
    if (card) res.status(HTTP_OK).send(card);
    else res.status(HTTP_NOT_FOUND).send(`Card ${req.params.name} not found`);
});
app.get('/card/search/:name', async (req, res) => {
    let card: Option<ICard | string> = null;
    const cards = await findCards(req.params.name);
    if (cards && cards.length !== 0) card = cards[ 0 ];
    if (card && req.query.format === 'string') card = cardToString(card);
    if (card) res.status(HTTP_OK).send(card);
    else res.status(HTTP_NOT_FOUND).send(`Card ${req.params.name} not found`);
});
app.get('/cards', async (req, res) => {
    const allCards: (ICard | string)[] = await getAllCards();
    if (allCards && req.query.format === 'string') {
        allCards.forEach((card, index) => allCards[ index ] = cardToString(card as ICard));
    }
    res.status(HTTP_OK).send(allCards);
});
app.get('/cards/:name', async (req, res) => {
    const cards: (ICard | string)[] = await findCards(req.params.name);
    if (cards && req.query.format === 'string') {
        cards.forEach((card, index) => cards[ index ] = cardToString(card as ICard));
    }
    if (cards && cards.length !== 0) res.status(HTTP_OK).send(cards);
    else res.status(HTTP_NOT_FOUND).send(`No cards found`);
});
app.post('/card', async (req, res) => {
    const card = req.body as ICard;
    const status = await addCard(card);
    if (status.success) res.status(HTTP_OK).send(`Successfully added card ${card.name}`);
    else {
        res.status(HTTP_ERROR).send(`Failed to add card`);
        console.log(status.message);
    }
});

app.get('/price/:name', async (req, res) => {
    const card = await findCard(req.params.name);
    if (card === null) res.status(HTTP_NOT_FOUND).send(`Card ${req.params.name} not found`);
    const prices = await getLatestPrices(card as ICard);
    if (prices === null) res.status(HTTP_NOT_FOUND).send(`No prices found for card ${req.params.name}`);
    else res.status(HTTP_OK).send(prices);
});
app.get('/prices', async (req, res) => {
    const allCards = await getAllCards();
    const allPrices: (IPriceRecord | string)[] = [];
    for (const card of allCards) {
        const prices = await getLatestPrices(card);
        if (prices !== null) allPrices.push(prices);
    }
    if (req.query.format === 'string') {
        allPrices.forEach((price, index) => allPrices[ index ] = priceToString(price as IPriceRecord));
    }
    if (allPrices.length > 0) res.status(HTTP_OK).send(allPrices);
    else res.status(HTTP_NOT_FOUND).send(`No prices found`);
});
app.post('/update-all', async (_, res) => {
    const success = await updateAll();
    if (success) res.status(HTTP_OK).send('Successfully updated all cards');
    else res.status(HTTP_ERROR).send('Failed to update all cards');
});

const port = process.env.PORT || DEFAULT_PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


async function updateAll(): Promise<boolean> {
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
        if (card.graded === 'Graded') {
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