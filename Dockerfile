FROM node:23

WORKDIR /app

COPY package*.json .

# clean install
RUN npm ci && npm run build

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
