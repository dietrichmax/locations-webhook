# Stage 1: Install dependencies + build TypeScript bundle
FROM node:21-alpine AS builder

WORKDIR /opt/app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY tsconfig.json webpack.config.js ./
COPY src ./src

# Build the webpack bundle (outputs dist/server.cjs)
RUN npm run build

# Stage 2: Create minimal runtime image
FROM node:21-alpine AS runtime

WORKDIR /opt/app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built bundle from builder stage
COPY --from=builder /opt/app/dist ./dist

# Expose port
EXPOSE 3000

# Copy health check script
COPY healthCheck.js ./healthCheck.js

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node ./healthCheck.js || exit 1

# Create and use non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Run the built bundle
CMD ["node", "./dist/server.cjs"]
