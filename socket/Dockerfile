FROM node:24-alpine AS development-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS production-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

FROM node:24-alpine AS build-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/src /app/src
WORKDIR /app
CMD ["sh", "-c", "pnpm run start"]
