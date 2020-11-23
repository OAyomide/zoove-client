FROM node:13.12.0-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
RUN npm install
RUN npm install react-scripts@3.4.0 -g

COPY . ./
EXPOSE 3000
CMD [ "npm", "start"]