FROM node:23

WORKDIR /app

COPY package*.json .

# clean install
RUN npm ci

COPY . .

RUN npm run build

ENV PORT=3000

ENV PUBLIC_DISCORD_INVITE=https://discord.gg/JmHKsnKuj8

EXPOSE 3000

CMD ["node", "build"]
