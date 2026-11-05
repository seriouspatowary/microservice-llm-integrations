FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Compile TypeScript
RUN npm run build

# API Gateway port
EXPOSE 5000

# Start application
CMD ["npm", "start"]