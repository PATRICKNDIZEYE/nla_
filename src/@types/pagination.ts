import { TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";
import mongoose from "mongoose";

export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
export interface IPaginatedData<T> {
  data: T[];
  singleData: T;
  pagination: IPagination;
  message?: string;
}

export interface IParams {
  role?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IDataResponse<T> {
  data: T;
  message: string;
}

export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
  role?: string;
  userId?: string;
  search?: string;
  status?: string;
  level?: string;
}

export interface QueryParams {
  [key: string]:
    | boolean
    | string
    | string[]
    | object[]
    | number
    | undefined
    | any // FIX this is a hack for now (quick fix)
    | mongoose.Types.ObjectId;
}

export interface IDistrictData {
  district: string;
  resolved?: number;
  processing?: number;
  submitted?: number;
  rejected?: number;
  closed?: number;
  appealed?: number;
}

export interface ISectorData {
  sectorName: string;
  resolved?: number;
  processing?: number;
  submitted?: number;
  rejected?: number;
  closed?: number;
  appealed?: number;
}

export interface IMonthData {
  name: string;
  resolved?: number;
  processing?: number;
  submitted?: number;
  rejected?: number;
  closed?: number;
}

export interface ILevelData {
  district?: number;
  nla?: number;
  court?: number;
}

export interface IStatusData {
  resolved?: number;
  processing?: number;
  open?: number;
  rejected?: number;
  closed?: number;
  appealed?: number;
}
