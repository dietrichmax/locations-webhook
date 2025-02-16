FROM node:21-alpine AS base

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD [ "npm", "run", "start"]
