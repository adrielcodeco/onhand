FROM node:lts-alpine
WORKDIR /app

COPY package.json /app
RUN yarn install

COPY . .

EXPOSE 8081
CMD onhand-iac-docker serve
