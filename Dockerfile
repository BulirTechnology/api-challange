FROM node:20 AS development

#  Navigate to the container working directory 
WORKDIR /usr/src/app
#  Copy package.json
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run start:dev