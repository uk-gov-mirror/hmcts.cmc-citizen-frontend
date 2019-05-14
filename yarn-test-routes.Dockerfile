FROM node:8.12.0-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN yarn config set proxy "$http_proxy" && yarn config set https-proxy "$https_proxy"

COPY package.json yarn.lock /usr/src/app/

RUN yarn install && yarn cache clean

COPY tsconfig.json types default.conf.js saucelabs.conf.js mocha.opts /usr/src/app/
COPY ./config /usr/src/app/config
COPY ./src/main /usr/src/app/src/main
COPY ./src/test /usr/src/app/src/test
COPY ./src/integration-test /usr/src/app/src/integration-test
COPY ./bin/run-pre-push-tests.sh /usr/src/app/

RUN ["chmod", "+x", "/usr/src/app/run-pre-push-tests.sh"]

ENTRYPOINT ["/usr/src/app/run-pre-push-tests.sh"]
