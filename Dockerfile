FROM node:23

WORKDIR /app

COPY package*.json .

# clean install
RUN npm ci

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
