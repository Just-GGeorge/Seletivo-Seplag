package br.com.seplag.sistema.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI api() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Artistas & Álbuns (Seletivo SEPLAG)")
                        .description("""
                    API para gerenciamento de Artistas, Álbuns e imagens (MinIO/S3).

                    **Autenticação (JWT)**:
                    1. Faça login para obter o `accessToken`
                    2. Clique em **Authorize** e informe: `Bearer SEU_TOKEN`

                    **Observações**:
                    - Endpoints de health (`/actuator/health`) podem estar públicos dependendo da configuração de segurança.
                    
                    **Usuario Padrão:**
                    Login:admin@local.com
                    senha:Admin@123
                    """)
                        .version("v1")
                        .license(new License().name("Uso interno / Avaliação Técnica")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local")
                ))
                .components(new Components().addSecuritySchemes(
                        BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ))
                // aplica Bearer por padrão (se algum endpoint for público, a gente remove por @SecurityRequirement)
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }
}
