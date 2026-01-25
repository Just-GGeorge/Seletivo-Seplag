package br.com.seplag.sistema.erp.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.ImagemAlbum;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ImagemAlbumRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;

import java.util.List;

@Service
public class ImagemAlbumService {

    private final AlbumRepository albumRepository;
    private final ImagemAlbumRepository imagemAlbumRepository;

    public ImagemAlbumService(AlbumRepository albumRepository, ImagemAlbumRepository imagemAlbumRepository) {
        this.albumRepository = albumRepository;
        this.imagemAlbumRepository = imagemAlbumRepository;
    }

    @Transactional(readOnly = true)
    public List<ImagemAlbumDto> listarPorAlbum(Long albumId) {
        // garante 404 se álbum não existir
        if (!albumRepository.existsById(albumId)) {
            throw new br.com.seplag.sistema.exception.RecursoNaoEncontradoException("Álbum não encontrado: " + albumId);
        }

        return imagemAlbumRepository.findByAlbumId(albumId).stream()
                .map(i -> new ImagemAlbumDto(
                        i.getId(),
                        i.getChaveObjeto(),
                        i.getTipoConteudo(),
                        i.getTamanhoBytes(),
                        i.isEhCapa()
                ))
                .toList();
    }

    @Transactional
    public ImagemAlbumDto adicionarAoAlbum(Long albumId, ImagemAlbumDto dto) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId));

        ImagemAlbum img = new ImagemAlbum();
        img.setAlbum(album);
        img.setChaveObjeto(dto.chaveObjeto());
        img.setTipoConteudo(dto.tipoConteudo());
        img.setTamanhoBytes(dto.tamanhoBytes());
        img.setEhCapa(Boolean.TRUE.equals(dto.ehCapa()));

        ImagemAlbum salvo = imagemAlbumRepository.save(img);
        return new ImagemAlbumDto(
                salvo.getId(),
                salvo.getChaveObjeto(),
                salvo.getTipoConteudo(),
                salvo.getTamanhoBytes(),
                salvo.isEhCapa()
        );
    }
}
