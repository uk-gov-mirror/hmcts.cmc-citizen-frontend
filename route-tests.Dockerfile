FROM node:8.12.0-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN yarn config set proxy "$http_proxy" && yarn config set https-proxy "$https_proxy"

COPY package.json yarn.lock /usr/src/app/

RUN yarn install && yarn cache clean

COPY tsconfig.json gulpfile.js server.js types mocha.opts saucelabs.conf.js ./
COPY ./src/main ./src/main
COPY ./src/test ./src/test
COPY config ./config

ENTRYPOINT [ "yarn" ]
CMD [ "test:routes" ]
