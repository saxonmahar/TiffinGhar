FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --production --legacy-peer-deps

# Copy source
COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
