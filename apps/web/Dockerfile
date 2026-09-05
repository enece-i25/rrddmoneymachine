FROM node:20-alpine AS build
WORKDIR /workspace
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile=false

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm --filter @rrdd/shared build
RUN pnpm --filter @rrdd/web build

FROM nginx:alpine
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
