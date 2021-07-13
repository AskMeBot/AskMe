FROM node:14
COPY . /askmebot
WORKDIR /askmebot
RUN npm i
RUN npm run build
CMD npm start