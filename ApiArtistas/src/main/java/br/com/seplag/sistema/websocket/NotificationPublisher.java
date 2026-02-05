package br.com.seplag.sistema.websocket;


import br.com.seplag.sistema.erp.model.dto.NotificationDto;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class NotificationPublisher {

    private final ApplicationEventPublisher publisher;

    public NotificationPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publish(NotificationDto dto) {
        publisher.publishEvent(new DomainNotificationEvent(dto));
    }
}
