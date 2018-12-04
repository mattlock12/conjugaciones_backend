FROM node
RUN mkdir /app
COPY package.json /app
COPY yarn.lock /app
COPY . /app
RUN apt-get update && apt-get install apt-transport-https &&\
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn
WORKDIR /app
RUN yarn install
CMD [ "npm", "run", "build"]
