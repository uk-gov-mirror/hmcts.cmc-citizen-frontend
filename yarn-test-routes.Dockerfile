FROM node:8.12.0-slim

WORKDIR /usr/src/app

ENTRYPOINT ["/usr/src/app/bin/run-pre-push-tests.sh"]
