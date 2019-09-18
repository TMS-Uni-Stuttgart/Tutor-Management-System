# =============================================
#
# Build frontend & backend
#
# This also copies the builded frontend into the server.
#
# =============================================
FROM node as build

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

COPY --from=build tms/server/build tms/
COPY server/package.json /tms
COPY server/yarn.lock /tms
RUN ls

# The port on which the server listens
EXPOSE 8080

# Install the packages needed for the server
WORKDIR /tms/
RUN yarn

ENTRYPOINT [ "node", "server.js" ]