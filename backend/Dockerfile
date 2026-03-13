FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Gradle wrapper 및 설정 파일 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle

RUN chmod +x gradlew

# 소스 코드 복사 후 빌드
COPY src ./src
RUN ./gradlew clean bootJar -x test

FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=default

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

