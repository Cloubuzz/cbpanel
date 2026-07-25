import { requestJson } from '../lib/httpClient';

export interface ApiBlog {
  ID: number;
  Title: string;
  Blog: string;
  Author: string | Record<string, never>;
  City: string | Record<string, never>;
  CoverImage: string;
  OldSlug: string | Record<string, never>;
  Video: string | Record<string, never>;
  Categories: string | Record<string, never>;
  Slug: string;
  BlogOutlets: string | Record<string, never>;
  IsActive: number;
  CreatedDate: string;
  CreatedBy: number | Record<string, never>;
  ModifiedDate: string;
  ModifiedBy: number | Record<string, never>;
  CoverImageName: string | Record<string, never>;
  IsNewsLetterEnable: boolean;
}

interface BlogsApiResponse {
  responseType: number;
  message: string;
  data: ApiBlog[];
}

export interface AddBlogPayload {
  title: string;
  blog: string;
  coverImage: string;
  slug: string;
  isActive: boolean;
}

export interface UpdateBlogPayload extends AddBlogPayload {
  id: number;
}

interface AddBlogResponse {
  responseType: number;
  message: string;
  data: { id: number };
}

interface UpdateBlogResponse {
  responseType: number;
  message: string;
  data: null;
}

const API_BASE_PATH = '/adminapi';

export const fetchBlogs = async (token: string): Promise<ApiBlog[]> => {
  const response = await requestJson<BlogsApiResponse>(`${API_BASE_PATH}/Blog/list`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch blogs.');
  }
  return response.data;
};

export const updateBlog = async (token: string, payload: UpdateBlogPayload): Promise<void> => {
  const response = await requestJson<UpdateBlogResponse>(`${API_BASE_PATH}/Blog/update`, {
    method: 'PUT',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to update blog.');
  }
};

export const addBlog = async (token: string, payload: AddBlogPayload): Promise<number> => {
  const response = await requestJson<AddBlogResponse>(`${API_BASE_PATH}/Blog/add`, {
    method: 'POST',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    body: payload,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to add blog.');
  }
  return response.data.id;
};
