FROM node:18-bullseye-slim

ARG PORT=8080
ENV PORT=$PORT

WORKDIR /app

RUN npm install pnpm -g
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
COPY . . 

EXPOSE $PORT
CMD ["npm", "run", "dev"]