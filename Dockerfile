FROM node:18-bullseye-slim as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install pnpm -g
RUN pnpm install --dev --frozen-lockfile

COPY . .

RUN npm run build


FROM node:18-bullseye-slim

ARG PORT=8080
ENV PORT=$PORT

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install pnpm -g
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build ./build

EXPOSE $PORT
CMD ["npm", "start"]