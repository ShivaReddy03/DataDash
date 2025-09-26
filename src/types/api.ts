// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  limit: number;
  total_pages: number;
  total_projects?: number;
  total_schemes?: number;
  has_next: boolean;
  has_previous: boolean;
}

export type ProjectsResponse = PaginatedApiResponse<Project>;
export type SchemesResponse = PaginatedApiResponse<InvestmentScheme>;

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: Admin;
  };
}

// Project Types
export type ProjectStatus = 'available' | 'sold_out' | 'coming_soon';
export type PropertyType = 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';

export interface GalleryImage {
  url: string;
  caption: string;
  is_primary: boolean;
}

export interface Amenity {
  name: string;
  icon: string;
  description: string;
}

export interface ProjectOption {
  id: string;
  title: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  description?: string;
  long_description?: string;
  website_url?: string;
  status: ProjectStatus;
  base_price: number;
  property_type: PropertyType;
  has_rental_income: boolean;
  pricing_details?: Record<string, any>;
  quick_info?: Record<string, any>;
  gallery_images?: GalleryImage[];
  key_highlights?: string[];
  features?: string[];
  investment_highlights?: string[];
  amenities?: Amenity[];
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  rera_number?: string;
  building_permission?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  title: string;
  location: string;
  description: string;
  long_description?: string;
  website_url?: string;
  status: ProjectStatus;
  base_price: number;
  property_type: PropertyType;
  has_rental_income: boolean;
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  rera_number?: string;
  building_permission?: string;
  pricing_details: Record<string, any>;
  quick_info: Record<string, any>;
  gallery_images: GalleryImage[];
  key_highlights: string[];
  features: string[];
  investment_highlights: string[];
  amenities: Amenity[];
  is_active?: boolean;
}

// Investment Scheme Types
export type SchemeType = 'single_payment' | 'installment';

export interface InvestmentScheme {
  id: string;
  project_id: string;
  scheme_type: SchemeType;
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days?: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  rental_start_month?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSchemeRequest {
  project_id: string;
  scheme_type: SchemeType;
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days?: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  rental_start_month?: number;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}

// Query Parameters
export interface ProjectsQueryParams {
  limit?: number;
  page?: number;
  property_type?: PropertyType;
  status_filter?: ProjectStatus;
  min_price?: number;
  max_price?: number;
}

export interface SchemesQueryParams {
  project_id?: string;
  scheme_type?: SchemeType;
  is_active?: boolean;
  limit?: number;
  page?: number;
}

export interface DashboardResponse {
  tatal_users: number; 
  total_projects: number;
  total_schemes: number;
}