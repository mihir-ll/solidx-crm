FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_BACKEND_API_URL=/api
ARG VITE_API_URL=/api
ARG VITE_SOLID_APP_TITLE="LeadTrack"
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL VITE_API_URL=$VITE_API_URL VITE_SOLID_APP_TITLE=$VITE_SOLID_APP_TITLE
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
