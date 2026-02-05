package br.com.seplag.sistema.websocket;

import br.com.seplag.sistema.erp.model.dto.NotificationDto;

public record DomainNotificationEvent(NotificationDto notification) {}
