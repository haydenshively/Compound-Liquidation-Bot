FROM node:12-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/
CMD [ "node", "main.js" ]
