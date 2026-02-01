package br.com.seplag.sistema.infra;

import io.minio.MinioClient;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;


@Component("minio")
public class MinioHealthIndicator implements HealthIndicator {

  private final MinioClient minioClient;

  public MinioHealthIndicator(@Qualifier("minioInternalClient") MinioClient minioClient) {
    this.minioClient = minioClient;
  }

  @Override
  public Health health() {
    try {
      minioClient.listBuckets();
      return Health.up().withDetail("service", "minio").build();
    } catch (Exception ex) {
      return Health.down(ex).withDetail("service", "minio").build();
    }
  }
}
