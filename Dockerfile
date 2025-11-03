# Multi-stage build for optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Set environment to production before build
ENV NODE_ENV=production

# Build the application (usando build normal para produção)
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --frozen-lockfile

# Copy built application from builder stage (standalone output)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Configurar logging para stdout/stderr (visível no Railway)
ENV NODE_OPTIONS="--no-warnings"

# Start the application (standalone server)
# Usar exec para garantir que os logs sejam redirecionados corretamente
CMD ["node", "server.js"]
