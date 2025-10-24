# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build:fast

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
