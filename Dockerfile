FROM node:23-apline as builder

WORKDIR /app

COPY package*.json .

# clean install
RUN npm ci

COPY . .

ENV PORT=3000

ENV PUBLIC_DISCORD_INVITE=https://discord.gg/JmHKsnKuj8

EXPOSE 3000

CMD ["node", "build"]
