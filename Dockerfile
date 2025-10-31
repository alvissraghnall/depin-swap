FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm @dotenvx/dotenvx

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN --mount=type=secret,id=dotenv_key \
    sh -c 'export DOTENV_PRIVATE_KEY=$(cat /run/secrets/dotenv_key) && dotenvx run -- pnpm run build'

FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm @dotenvx/dotenvx

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY .env .env

EXPOSE 3000

CMD ["dotenvx", "run", "--", "node", "build/index.js"]
