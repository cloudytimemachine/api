FROM mhart/alpine-node:4.6

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.2/dumb-init_1.1.2_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

RUN adduser -D -u 1000 nodejs
USER nodejs

RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

COPY package.json /home/nodejs/app/package.json
RUN npm install --production
COPY . /home/nodejs/app

EXPOSE 3000

ENV PORT 3000

CMD ["node", "index.js"]
