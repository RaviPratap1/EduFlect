FROM node:22-alpine

WORKDIR /app

# Pehle sirf package files copy -> docker layer cache ka fayda (code badle to npm install dobara nahi chalega)
COPY package*.json ./
# devDependencies bhi install (seed.js ko @faker-js/faker chahiye)
RUN npm ci

COPY . .

# multer yaha temp files likhta hai
RUN mkdir -p public/temp

EXPOSE 3000
CMD ["node", "server.js"]