FROM node:22-alpine

ENV ACCESSS_HEADER=x-forwarded-for
ENV BODY_SIZE_LIMIT=4M

ENV DB_URL=

ENV PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=
ENV CLOUDFLARE_TURNSTILE_SECRET_KEY=

ENV PUBLIC_DISCORD_INVITE=
ENV PUBLIC_DISCORD_OAUTH_REDIRECT_URI=
ENV PUBLIC_DISCORD_CLIENT_ID=
ENV DISCORD_CLIENT_SECRET=

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
