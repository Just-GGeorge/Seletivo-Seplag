package br.com.seplag.sistema.storage;

import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Map;
import java.util.UUID;

@Service
public class MinioStorageService {

    private final MinioClient internalClient;
    private final MinioClient publicClient;
    private final MinioProperties props;

    public MinioStorageService(
            @Qualifier("minioInternalClient") MinioClient internalClient,
            @Qualifier("minioPublicClient") MinioClient publicClient,
            MinioProperties props
    ) {
        this.internalClient = internalClient;
        this.publicClient = publicClient;
        this.props = props;
    }

    public String gerarObjectKeyAlbum(Long albumId, String contentType) {
        String ext = extPorContentType(contentType);
        return "albuns/" + albumId + "/" + UUID.randomUUID() + ext;
    }

    public void upload(String objectKey, InputStream input, long size, String contentType) throws Exception {
        internalClient.putObject(
                PutObjectArgs.builder()
                        .bucket(props.bucket())
                        .object(objectKey)
                        .stream(input, size, -1)
                        .contentType(contentType)
                        .build()
        );
    }

    public void delete(String objectKey) throws Exception {
        internalClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(props.bucket())
                        .object(objectKey)
                        .build()
        );
    }

    public String presignedGetUrl(String objectKey, int expirySeconds) throws Exception {
        try {
            return publicClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(props.bucket())
                            .object(objectKey)
                            .expiry(expirySeconds)
                            .build()
            );
        } catch (Exception e) {
            System.out.println("MINIO publicUrl=" + props.publicUrl());
            System.out.println("MINIO bucket=" + props.bucket());
            throw e;
        }

    }

    private String extPorContentType(String contentType) {
        if (contentType == null) return "";
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }
}
