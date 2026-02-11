# base image

FROM node:20-alpine

#creating work directory

WORKDIR /app

#copying package.json and copying package-lock.json

COPY package*.json ./

#installing dependencies

RUN npm install

#copy all files

COPY . .

#expose port

EXPOSE 4000

#run the server

CMD ["npm", "start"];