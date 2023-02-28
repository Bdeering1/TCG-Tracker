import bodyParser from 'body-parser';
import express from 'express';
import mongoose, { connect, CallbackError } from 'mongoose';
import { ICard, cardToString } from './models/card';
import { Option } from './types';
import { addCard, findCard, findCards, getAllCards, removeCard, removeCards, updateAllCards, updateCard } from './repositories/card-repo';
import { getLatestPrices, updateAllPrices } from './repositories/price-record-repo';
import { IPriceRecord, priceToString } from './models/price-record';


const HTTP_OK = 200;
const HTTP_ERROR = 500;
const HTTP_NOT_FOUND = 404;
const DEFAULT_PORT = 8080;

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'root';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongo-auth';
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || 'localhost';
const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME || 'tcg-tracker';
const MONGO_PORT = 27017;


if (MONGO_USERNAME && MONGO_PASSWORD && MONGO_HOSTNAME && MONGO_DATABASE_NAME) {
    const uri = process.env.NODE_ENV === 'prod'
        ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}/${MONGO_DATABASE_NAME}`
        : `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DATABASE_NAME}?authSource=admin`;

    mongoose.set('strictQuery', true);
    connect(uri, {
        w: 'majority',
        retryWrites: false
    }, (err: CallbackError) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Successfully connected to MongoDB');
        }
    });
}
else {
    console.log('MongoDB connection string missing or incomplete');
    console.log(`Hostname: ${MONGO_HOSTNAME}`);
}


const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(HTTP_OK).send('Welcome to the TCG Tracker API! Try starting with one of these endpoints: /cards, /prices');
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
    if (cards.length > 0) res.status(HTTP_OK).send(cards);
    else res.status(HTTP_NOT_FOUND).send(`No cards found`);
});
app.post('/card', async (req, res) => {
    const card = req.body as ICard;
    const status = await addCard(card);
    if (status.success) res.status(HTTP_OK).send(status.message);
    else {
        res.status(HTTP_ERROR).send(`Failed to add card`);
        console.log(status.message);
    }
});
app.patch('/card', async (req, res) => {
    const card = req.body as ICard;
    const status = await updateCard(card);
    if (status.success) res.status(HTTP_OK).send(status.message);
    else {
        res.status(HTTP_ERROR).send(`Failed to update card`);
        console.log(status.message);
    }
});
app.patch('/cards', async (req, res) => {
    const card = req.body as ICard;
    const status = await updateAllCards(card);
    if (status.success) res.status(HTTP_OK).send(status.message);
    else {
        res.status(HTTP_ERROR).send(`Failed to update cards`);
        console.log(status.message);
    }
});

app.delete('/card', async (req, res) => {
    const card = req.body as ICard;
    const status = await removeCard(card);
    if (status.success) res.status(HTTP_OK).send(status.message);
    else {
        res.status(HTTP_ERROR).send(`Failed to delete card`);
        console.log(status.message);
    }
});
app.delete('/cards', async (req, res) => {
    const card = req.body as ICard;
    const status = await removeCards(card);
    if (status.success) res.status(HTTP_OK).send(status.message);
    else {
        res.status(HTTP_ERROR).send(`Failed to delete cards`);
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
app.post('/update-prices', async (_, res) => {
    const success = await updateAllPrices();
    if (success) res.status(HTTP_OK).send('Successfully updated all cards');
    else res.status(HTTP_ERROR).send('Failed to update all cards');
});

const port = process.env.PORT || DEFAULT_PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
