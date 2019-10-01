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
FROM alpine:edge
# FROM node:10-alpine

COPY --from=build tms/server/build tms/server
COPY --from=build tms/shared/dist tms/shared/dist

COPY package.json /tms
COPY yarn.lock /tms
COPY server/package.json /tms/server
COPY shared/package.json /tms/shared

# The port on which the server listens
EXPOSE 8080

# Install the packages needed for the server & puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn 

WORKDIR /tms
RUN yarn install --production

# Set up container entrypoint to be the server file.
WORKDIR /tms/server
ENTRYPOINT [ "node", "server.js" ]