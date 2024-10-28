FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json .
COPY tsconfig.json . 
COPY src/*.ts . 

ARG USE_CACHE
RUN if [ "$USE_CACHE" = "true" ]; then \
        echo "Using cached dependencies"; \
        COPY node_modules.tar . && \
        RUN tar -xvf node_modules.tar && rm node_modules.tar && \
        RUN chmod -R +x node_modules/.bin; \
    else \
        echo "Installing dependencies without cache"; \
        npm install; \
    fi

RUN npx tsc

RUN test -f /backend/build/index.js || (echo "Error: index.js not found!" && exit 1)

FROM registry.heroiclabs.com/heroiclabs/nakama:3.17.1
COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY ./local.yml /nakama/data/
