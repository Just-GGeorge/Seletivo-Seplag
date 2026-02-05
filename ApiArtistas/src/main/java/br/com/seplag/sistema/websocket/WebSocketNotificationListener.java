package br.com.seplag.sistema.websocket;


import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
public class WebSocketNotificationListener {

    private final SimpMessagingTemplate messaging;

    public WebSocketNotificationListener(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAfterCommit(DomainNotificationEvent event) {
        // broadcast
        messaging.convertAndSend("/topic/notifications", event.notification());
    }
}
