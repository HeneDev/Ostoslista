FROM node:16-alpine

# Create root application folder
WORKDIR /app

# Copy NPM files to /app folder
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy rest of the files
COPY . .

# Build application
RUN npm run build

CMD [ "npm", "run", "serve" ]
