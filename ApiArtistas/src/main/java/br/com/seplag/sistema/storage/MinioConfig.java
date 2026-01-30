package br.com.seplag.sistema.storage;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MinioProperties.class)
public class MinioConfig {

    @Bean("minioInternalClient")
    public MinioClient minioInternalClient(MinioProperties props) {
        return MinioClient.builder()
                .endpoint(props.internalUrl())
                .credentials(props.accessKey(), props.secretKey())
                .build();
    }

    @Bean("minioPublicClient")
    public MinioClient minioPublicClient(MinioProperties props) {
        return MinioClient.builder()
                .endpoint(props.publicUrl())
                .credentials(props.accessKey(), props.secretKey())
                .build();
    }
}
