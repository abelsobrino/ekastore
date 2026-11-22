
# Compilar React
FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Compilar Spring Boot
FROM maven:3.9-eclipse-temurin-25 AS backend-build
WORKDIR /build/backend

COPY backend/ ./
COPY --from=frontend-build /build/frontend/dist ./src/main/resources/static

RUN mvn -DskipTests package

# Ejecutar Eka Store
FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=backend-build /build/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
