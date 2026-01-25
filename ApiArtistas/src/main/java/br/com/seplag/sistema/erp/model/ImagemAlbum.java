package br.com.seplag.sistema.erp.model;


import jakarta.persistence.*;
import java.time.LocalDateTime;
public class ImagemAlbum {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @Column(name = "chave_objeto", nullable = false, length = 500)
    private String chaveObjeto;

    @Column(name = "tipo_conteudo", length = 100)
    private String tipoConteudo;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "eh_capa", nullable = false)
    private boolean ehCapa = false;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Album getAlbum() { return album; }
    public void setAlbum(Album album) { this.album = album; }

    public String getChaveObjeto() { return chaveObjeto; }
    public void setChaveObjeto(String chaveObjeto) { this.chaveObjeto = chaveObjeto; }

    public String getTipoConteudo() { return tipoConteudo; }
    public void setTipoConteudo(String tipoConteudo) { this.tipoConteudo = tipoConteudo; }

    public Long getTamanhoBytes() { return tamanhoBytes; }
    public void setTamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; }

    public boolean isEhCapa() { return ehCapa; }
    public void setEhCapa(boolean ehCapa) { this.ehCapa = ehCapa; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
