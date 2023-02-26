FROM node:18-bullseye-slim as builder

WORKDIR /app

RUN npm install pnpm -g

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
COPY . .

RUN npm run build


FROM node:18-bullseye-slim

ARG PORT=8080
ENV PORT=$PORT

WORKDIR /app

RUN npm install pnpm -g

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/build ./build

EXPOSE $PORT
CMD ["npm", "start"]