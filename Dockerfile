# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage  
FROM node:20-alpine as production-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build-stage /app/.output ./
EXPOSE 8080

# Set environment variable for port
ENV NITRO_PORT=8080
ENV HOST=0.0.0.0

CMD ["node", "server/index.mjs"]