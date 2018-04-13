FROM node:8.7

RUN mkdir -p /opt/app/data-log

WORKDIR /opt/app/

EXPOSE 3000

VOLUME [ "/opt/app/data-log", "/opt/app/config" ]

COPY . .

RUN yarn install

ENTRYPOINT [ "yarn", "start" ]
