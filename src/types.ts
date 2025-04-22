// Entity Types - derived from Database schema
import type { Database } from "./db/database.types";

// Base entity types from database schema
export type User = Database["public"]["Tables"]["users"]["Row"];
export type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"];
export type ShoppingListItem = Database["public"]["Tables"]["shopping_list_items"]["Row"];

// Common utility types

export interface PaginationResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Authentication DTOs and Command Models

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  id: string;
  email: string;
  registrationDate: string;
  token: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginUserResponse {
  id: string;
  email: string;
  token: string;
}

// User DTOs and Command Models

export interface UserDTO {
  id: string;
  email: string;
  registrationDate: string;
  lastLoginDate: string | null;
  isAdmin: boolean;
}

export interface GetAllUsersResponse {
  data: UserDTO[];
  pagination: PaginationResponse;
}

export type GetUserByIdResponse = UserDTO;

export interface UpdateUserRequest {
  email?: string;
  password?: string;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  updatedDate: string;
}

// Shopping List DTOs and Command Models

export interface ShoppingListSummaryDTO {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface GetAllShoppingListsResponse {
  data: ShoppingListSummaryDTO[];
  pagination: PaginationResponse;
}

export interface ShoppingListItemDTO {
  id: string;
  itemName: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetShoppingListByIdResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItemDTO[];
}

export interface CreateShoppingListRequest {
  title: string;
}

export interface CreateShoppingListResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateShoppingListRequest {
  title: string;
}

export interface UpdateShoppingListResponse {
  id: string;
  title: string;
  updatedAt: string;
}

// Shopping List Item DTOs and Command Models

export interface GetAllItemsInShoppingListResponse {
  data: ShoppingListItemDTO[];
}

export type GetShoppingListItemByIdResponse = ShoppingListItemDTO;

export interface AddItemToShoppingListRequest {
  itemName: string;
  purchased?: boolean;
}

export type AddItemToShoppingListResponse = ShoppingListItemDTO;

export interface UpdateShoppingListItemRequest {
  itemName?: string;
  purchased?: boolean;
}

export interface UpdateShoppingListItemResponse {
  id: string;
  itemName: string;
  purchased: boolean;
  updatedAt: string;
}

export interface BulkUpdateItemRequest {
  id: string;
  purchased: boolean;
}

export interface BulkUpdateItemsRequest {
  items: BulkUpdateItemRequest[];
}

export interface BulkUpdateItemsResponse {
  updatedCount: number;
  updatedAt: string;
}

export interface ShoppingListDetailResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItemDTO[];
}
