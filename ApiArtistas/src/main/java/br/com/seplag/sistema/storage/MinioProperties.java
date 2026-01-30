package br.com.seplag.sistema.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "minio")
public record MinioProperties(
        String internalUrl,
        String publicUrl,
        String accessKey,
        String secretKey,
        String bucket,
        String region
) {}
