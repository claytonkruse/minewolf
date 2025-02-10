FROM node:22-alpine

RUN mkdir -p /app/storage && chown -R node:node /app/storage

WORKDIR /app

VOLUME /app/storage

COPY package*.json .

# clean install
RUN npm ci

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
