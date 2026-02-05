export type AlbumDto = {
  id?: number;
  titulo: string;
  dataLancamento?: string | null;
  artistasIds: number[];
};

export type ImagemAlbumDto = {
  id?: number;
  chaveObjeto: string;
  tipoConteudo?: string | null;
  tamanhoBytes?: number | null;
  ehCapa?: boolean | null;
};

export type ImagemAlbumComUrlDto = {
  id: number;
  chaveObjeto: string;
  tipoConteudo?: string | null;
  tamanhoBytes?: number | null;
  ehCapa?: boolean | null;
  url: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type ListAlbumsParams = {
  artistaId?: number;
  artistasIds?: number[];
  titulo?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type AlbumComImagensDto = {
  album: AlbumDto;
  imagens: ImagemAlbumDto[];
};