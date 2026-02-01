export type ApiError = {
  status?: number;
  message: string;
  details?: unknown;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages?: number;
  number: number; // page index
  size: number;
};
