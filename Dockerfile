# =============================================
#
# Build frontend & backend
#
# =============================================
FROM node:20-alpine AS build

COPY client/ tms/client/
COPY server/ tms/server/
COPY scripts/ tms/scripts/

COPY .npmrc tms/
COPY package.json tms/
COPY pnpm-lock.yaml tms/
COPY pnpm-workspace.yaml tms/

WORKDIR /tms/

# Do not download mongo-memory-server binaries.
# They are not needed for building.
ENV MONGOMS_DISABLE_POSTINSTALL=1

RUN corepack enable
RUN corepack prepare pnpm
RUN pnpm install && pnpm build

# =============================================
#
# Create the image which runs the server
#
# =============================================
FROM node:20-alpine AS production

RUN corepack enable
RUN corepack prepare pnpm

COPY --from=build tms/server/dist tms/server

COPY .npmrc tms/
COPY package.json /tms
COPY pnpm-lock.yaml tms/
COPY pnpm-workspace.yaml tms/
COPY server/package.json /tms/server

WORKDIR /tms
ENV NODE_ENV='production'

RUN pnpm install --frozen-lockfile

# Set up container entrypoint to be the server file.
EXPOSE 8080
WORKDIR /tms/server

ENTRYPOINT [ "node", "main.js" ]
