package br.com.seplag.sistema.security;

import br.com.seplag.sistema.erp.model.dto.RegionalExternaDto;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Component
public class RegionaisClient {

    private final RestClient restClient;

    public RegionaisClient(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://integrador-argus-api.geia.vip")
                .build();
    }

    public List<RegionalExternaDto> listar() {
        RegionalExternaDto[] arr = restClient.get()
                .uri("/v1/regionais")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(RegionalExternaDto[].class);

        return arr == null ? List.of() : Arrays.asList(arr);
    }
}



