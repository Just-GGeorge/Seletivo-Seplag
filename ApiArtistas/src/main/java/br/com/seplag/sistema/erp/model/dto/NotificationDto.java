package br.com.seplag.sistema.erp.model.dto;

import java.time.Instant;
import java.util.Map;

public record NotificationDto(
        String type,
        String entity,
        Long entityId,
        String title,
        String message,
        Instant timestamp,
        Map<String, Object> meta
) {}
