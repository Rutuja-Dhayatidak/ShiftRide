FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies 
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Ensure the public/uploads directory exists for mount points
RUN mkdir -p public/uploads

EXPOSE 1000

CMD ["node", "server.js"]
