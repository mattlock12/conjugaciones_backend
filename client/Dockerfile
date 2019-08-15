FROM node
RUN mkdir /app; exit 0
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN apt-get update && apt-get install apt-transport-https &&\
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn
RUN yarn install

COPY . .
