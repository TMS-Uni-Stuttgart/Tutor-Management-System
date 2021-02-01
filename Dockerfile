# =============================================
#
# Build frontend & backend
#
# =============================================
FROM node:14-alpine as build

COPY client/ tms/client/
COPY server/ tms/server/
COPY scripts/ tms/scripts/

COPY package.json tms/
COPY pnpm-lock.yaml tms/
COPY pnpm-workspace.yaml tms/

WORKDIR /tms/

# Do not download puppeteer and mongo-memory-server binaries.
# They are not needed for building.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV MONGOMS_DISABLE_POSTINSTALL 1

RUN npm install -g pnpm
RUN pnpm install && pnpm build

# =============================================
#
# Create the image which runs the server
#
# =============================================
FROM alpine:3

# Installs latest Chromium package, NodeJS and pnpm.
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
    npm

RUN npm -g pnpm

COPY --from=build tms/server/dist tms/server

COPY package.json /tms
COPY pnpm-lock.yaml tms/
COPY pnpm-workspace.yaml tms/
COPY server/package.json /tms/server

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package. 
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell the PDFService where to find the Chrome executable.
ENV TMS_PUPPETEER_EXEC_PATH "/usr/bin/chromium-browser"

# Set the puppeteer version to match the one of the latest available chromium alpine package.
RUN pnpm add puppeteer@5.2.1

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

RUN pnpm install --prod

# Set up container entrypoint to be the server file.
EXPOSE 8080
WORKDIR /tms/server

ENTRYPOINT [ "node", "main.js" ]
