FROM node:12.18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install \
    && apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Almaty /etc/localtime \
    && apk del tzdata

COPY . .

CMD [ "./wait-for-it.sh", "db:27017", "--", "node", "index.js" ]