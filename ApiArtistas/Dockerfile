# ===== STAGE 1: BUILD =====
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copia arquivos necessários para cache do Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copia o código fonte
COPY src src

# Build do JAR
RUN ./mvnw clean package -DskipTests


# ===== STAGE 2: RUNTIME =====
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
