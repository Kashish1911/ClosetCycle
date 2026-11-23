FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN useradd --system --uid 10001 closetcycle
COPY --from=build /build/target/closet-cycle-api-0.1.0.jar app.jar
RUN mkdir -p /app/data /app/uploads && chown -R closetcycle:closetcycle /app
USER closetcycle
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
