# =============================================
#
# Build frontend & backend
#
# This also copies the builded frontend into the server.
#
# =============================================
FROM node:10 as build

COPY client/ tms/client/
COPY server/ tms/server/
COPY shared/ tms/shared/

COPY package.json tms/
COPY yarn.lock tms/

WORKDIR /tms/

RUN yarn
RUN yarn build

# =============================================
#
# Create the image which runs the server
#
# =============================================
FROM node:10-alpine

COPY --from=build tms/server/build tms/server
COPY --from=build tms/shared/dist tms/shared/dist

COPY package.json /tms
COPY yarn.lock /tms
COPY server/package.json /tms/server
COPY shared/package.json /tms/shared

# The port on which the server listens
EXPOSE 8080

# Add packages & files needed to run phantomJS in the container
# PhantomJS is used to create the PDFs on the server.
RUN apk add --update --no-cache ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family
RUN apk --update --no-cache add curl
RUN curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/2.1.1a/dockerized-phantomjs.tar.gz" | tar xz -C /
RUN apk del curl

# Install the packages needed for the server
WORKDIR /tms
RUN yarn install --production

# Set up container entrypoint to be the server file.
WORKDIR /tms/server
ENTRYPOINT [ "node", "server.js" ]