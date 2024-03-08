# tianji reporter
FROM golang:1.21.1-bookworm AS reporter
WORKDIR /app/reporter

COPY ./reporter/ ./reporter/

RUN apt update
RUN cd reporter && go build .

# # Base ------------------------------
FROM node:20-alpine AS base

RUN npm install -g pnpm@8.3.1
RUN apk add --update --no-cache python3 py3-pip g++ make

# Tianji frontend ------------------------------
FROM base AS static
WORKDIR /app/tianji

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm build:static

# Tianji server ------------------------------
FROM base AS app
WORKDIR /app/tianji

COPY . .

RUN pnpm install --filter @tianji/server... --config.dedupe-peer-dependents=false

RUN mkdir -p ./src/server/public
COPY --from=static /app/tianji/src/server/public /app/tianji/src/server/public

RUN pnpm build:server

RUN pip install apprise --break-system-packages

RUN rm -rf ./src/client
RUN rm -rf ./website
RUN rm -rf ./reporter

EXPOSE 12345

CMD ["pnpm", "start:docker"]
