FROM node:latest

WORKDIR /usr/app

COPY . .

RUN npm install

CMD ["node", "index.js"]