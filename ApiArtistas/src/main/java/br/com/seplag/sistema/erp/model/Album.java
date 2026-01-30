package br.com.seplag.sistema.erp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "albuns")
public class Album {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(name = "artistas_albuns",
            joinColumns = @JoinColumn(name = "album_id"),
            inverseJoinColumns = @JoinColumn(name = "artista_id")
    )
    private List<Artista> artistas = new ArrayList<>();

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "data_lancamento")
    private LocalDate dataLancamento;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImagemAlbum> imagens = new ArrayList<>();

    @PrePersist
    void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    // getters/setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public List<Artista> getArtistas() { return artistas; }
    public void setArtistas(List<Artista> artista) { this.artistas = artista; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getDataLancamento() { return dataLancamento; }
    public void setDataLancamento(LocalDate dataLancamento) { this.dataLancamento = dataLancamento; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    public List<ImagemAlbum> getImagens() { return imagens; }
    public void setImagens(List<ImagemAlbum> imagens) { this.imagens = imagens; }
}
