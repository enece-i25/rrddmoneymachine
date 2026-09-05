FROM node:20-alpine AS build
WORKDIR /workspace
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile=false

RUN pnpm --filter @rrdd/shared build
RUN pnpm --filter @rrdd/api build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable

COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --prod --filter @rrdd/api --frozen-lockfile=false

COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/api/src/db/migrations ./src/db/migrations
COPY --from=build /workspace/packages/shared/dist ./packages/shared/dist

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
