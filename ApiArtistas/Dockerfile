# ===== STAGE 1: BUILD =====
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src src
RUN ./mvnw clean package -DskipTests


# ===== STAGE 2: RUNTIME =====
FROM eclipse-temurin:17-jre

WORKDIR /app

# instala curl para healthcheck do docker-compose
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
