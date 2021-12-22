FROM node:16-alpine as build

ARG API_URL
ENV REACT_APP_API_URL $API_URL

# Create root application folder
WORKDIR /app

# Copy NPM files to /app folder
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy rest of the files
COPY . .

# Build the application
RUN npm run build

# Copy builded files and start web server
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
