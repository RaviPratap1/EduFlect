# ---------- Stage 1: React/Vite build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite env build time par code me bake hota hai, runtime par nahi
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Stage 2: nginx se static files serve ----------
FROM nginx:1.27-alpine
# TODO (baad me): nginx.conf add karne ke baad ye line uncomment karna
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80