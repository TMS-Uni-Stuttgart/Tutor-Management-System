# =============================================
#
# Build frontend & backend
#
# This also copies the builded frontend into the server.
#
# =============================================
FROM node:12 as build

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
FROM alpine:3

# Installs latest Chromium (76) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      terminus-font \
      nodejs-current \
      yarn 

COPY --from=build tms/server/build/src tms/server
COPY --from=build tms/shared/dist tms/shared/dist

COPY package.json /tms
COPY yarn.lock /tms
COPY server/package.json /tms/server
COPY shared/package.json /tms/shared

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package. 
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell the PDFService where to find the Chrome executable.
ENV TMS_PUPPETEER_EXEC_PATH "/usr/bin/chromium-browser"

# Puppeteer v1.17.0 works with Chromium 77.
RUN yarn add puppeteer@1.19.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /tms

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /tms
ENV NODE_ENV 'production'

RUN yarn install --production

# Set up container entrypoint to be the server file.
EXPOSE 8080
WORKDIR /tms/server

ENTRYPOINT [ "node", "server.js" ]