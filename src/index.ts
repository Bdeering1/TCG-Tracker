import express from 'express';
import { connect, CallbackError } from 'mongoose';
import { ICard } from './models/card';
import { addCard, findCard, findCards, getAllCards } from './repositories/card-repo';
import { getLatestPrices, update } from './repositories/price-record-repo';

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

    // /mongoose.set('strictQuery', true);
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
const port = process.env.PORT || DEFAULT_PORT;

app.get('/', (_, res) => {
    res.status(HTTP_OK).send('Hello World!');
});

app.get('/cards', async (_, res) => {
    const allCards = await getAllCards();
    res.status(HTTP_OK).send(allCards);
});
app.get('/card(/:search)?/:name', async (req, res) => {
    let card;
    if (req.params.search === 'search') card = (await findCards(req.params.name))[ 0 ];
    else card = await findCard(req.params.name);
    if (card) res.status(HTTP_OK).send(card);
    else res.status(HTTP_NOT_FOUND).send(`Card ${req.params.name} not found`);
});
app.get('/cards/:name', async (req, res) => {
    const card = await findCards(req.params.name);
    if (card && card.length !== 0) res.status(HTTP_OK).send(card);
    else res.status(HTTP_NOT_FOUND).send(`No cards found`);
});
app.post('/card', async (req, res) => {
    const card = req.body as ICard;
    const status = await addCard(card);
    if (status.success) res.status(HTTP_OK).send(`Successfully added card ${card.name}`);
    else res.status(HTTP_ERROR).send(`Failed to add card ${card.name}`);
});

app.get('/price/:name', async (req, res) => {
    const card = await findCard(req.params.name);
    if (card === null) res.status(HTTP_NOT_FOUND).send(`Card ${req.params.name} not found`);
    const prices = await getLatestPrices(card as ICard);
    if (prices === null) res.status(HTTP_NOT_FOUND).send(`No prices found for card ${req.params.name}`);
    res.status(HTTP_OK).send(prices);
});
app.post('/update-all', async (req, res) => {
    const success = await updateAll();
    if (success) res.status(HTTP_OK).send('Successfully updated all cards');
    else res.status(HTTP_ERROR).send('Failed to update all cards');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


async function updateAll(): Promise<boolean> {
    let allSuccess = true;
    const allCards = await getAllCards();
    for (const card of allCards) {
        console.log(card.name);
        const res = await update(card);
        if (!res.success) {
            console.log(res.message);
            allSuccess = false;
        }
    }
    if (allSuccess) console.log('Successfully updated all cards');
    return allSuccess;
}