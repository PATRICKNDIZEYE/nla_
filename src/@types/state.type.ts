import { IPaginatedData } from "./pagination";

export interface State<T> {
  loading: boolean;
  error?: string;
  data: T;
}

export interface CRUDWithData<T> {
  payload: T;
  method: "POST" | "PUT" | "DELETE";
}

export const initialPaginatedState = <T>(): State<IPaginatedData<T>> => ({
  loading: false,
  data: {
    data: [],
    singleData: {} as T,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    },
  },
});

export const initialState = <T>(): State<T> => ({
  loading: false,
  data: {} as T,
});
