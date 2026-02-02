export type ArtistaDto = {
  id?: number;        
  nome: string;
  genero: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   
  size: number;
};

export type ListArtistasParams = {
  pesquisa?: string;
  nome?: string;
  genero?: string;
  page?: number;     
  size?: number;
  sort?: string;     
};
