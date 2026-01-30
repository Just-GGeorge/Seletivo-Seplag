package br.com.seplag.sistema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import br.com.seplag.sistema.security.JwtProperties;


@EnableConfigurationProperties(JwtProperties.class)
@SpringBootApplication
public class ApiArtistasApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiArtistasApplication.class, args);
	}

}
