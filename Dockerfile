# Stage 1: Build dependencies in a smaller layer
FROM node:21-alpine AS deps

# Set working directory
WORKDIR /opt/app

# Install only production dependencies if NODE_ENV=production
ENV NODE_ENV=production

# Copy only package.json and lock file first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Stage 2: Copy source and run app
FROM node:21-alpine AS runtime

WORKDIR /opt/app

# Copy installed node_modules from previous stage
COPY --from=deps /opt/app/node_modules ./node_modules

# Copy rest of the source files
COPY . .

# Expose app port
EXPOSE 3000

# Health check script
COPY healthCheck.js ./healthCheck.js

# Add basic container health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node ./healthCheck.js || exit 1

# Use non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Default command
CMD ["npm", "run", "start"]
