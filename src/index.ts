import express from 'express';
import { connect, CallbackError } from 'mongoose';
import { ICard } from './models/card';
import { getLatestPrices, update } from './repositories/price-record-repo';

const HTTP_OK = 200;
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

const card: ICard = {
    name: 'Charizard Base Set 2 4/130 Holo',
    type: 'Pokemon',
    path: 'game/pokemon-base-set-2/charizard-4'
};

await update(card);
console.log(await getLatestPrices(card));

// const app = express();
// const port = process.env.PORT || DEFAULT_PORT;

// app.get('/', (_, res) => {
//     res.status(HTTP_OK).send('Hello World!');
// });

// app.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
// });