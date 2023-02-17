import express from 'express';

const HTTP_OK = 200;
const DEFAULT_PORT = 8080;

const app = express();
const port = process.env.PORT || DEFAULT_PORT;

app.get('/', (_, res) => {
    res.status(HTTP_OK).send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});