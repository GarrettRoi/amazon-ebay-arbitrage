# Multi-stage build for Amazon to eBay Arbitrage System

# Stage 1: Frontend build
FROM node:16-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN CI=false GENERATE_SOURCEMAP=false npm run build --legacy-peer-deps

# Stage 2: Backend build and final image
FROM node:16-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY .env ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "backend/src/server.js"]
