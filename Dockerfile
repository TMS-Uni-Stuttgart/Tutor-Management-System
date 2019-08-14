# =============================================
#
# Build frontend
#
# =============================================
FROM node as client

COPY client/ client/
WORKDIR /client
RUN npm i
RUN npm run build


# =============================================
#
# Build backend and bundle frontend
#
# =============================================
FROM maven:3.6-jdk-11 as server

# Make sure the output is not spammed with "Downloading ..." message
ENV MAVEN_OPTS="-Dhttps.protocols=TLSv1.2 -Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=WARN -Dorg.slf4j.simpleLogger.showDateTime=true -Djava.awt.headless=true"

COPY pom.xml server/
COPY src/ server/src/
COPY --from=client client/build/ server/client/build

WORKDIR /server/
RUN mvn --batch-mode --errors package


# =============================================
#
# Create the real image containing the JAR
#
# =============================================
FROM openjdk:11.0-jre-slim

COPY --from=server server/target/Tutor-Management-System.jar tms/

# The port on which the server listens
EXPOSE 8443

WORKDIR /tms/
ENTRYPOINT [ "java", "-jar", "Tutor-Management-System.jar", "--spring.profiles.active=production" ]