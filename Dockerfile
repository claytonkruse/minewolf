FROM node:22-alpine

#WORKDIR /app

COPY package*.json .

# clean install
RUN npm ci

VOLUME /storage

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
