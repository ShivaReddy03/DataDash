// Re-export API types for backwards compatibility
export type {
  Project,
  InvestmentScheme,
  ProjectStatus,
  PropertyType,
  SchemeType,
  Admin,
  GalleryImage,
  Amenity,
  CreateProjectRequest,
  CreateSchemeRequest,
  ProjectsQueryParams,
  SchemesQueryParams,
  ApiResponse,
  LoginRequest,
  LoginResponse
} from './api';

// Import for usage in interfaces
import type { 
  Project,
  InvestmentScheme,
  Admin,
  CreateProjectRequest,
  CreateSchemeRequest
} from './api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AppContextType {
  projects: Project[];
  schemes: InvestmentScheme[];
  isLoading: boolean;
  addProject: (project: CreateProjectRequest) => Promise<void>;
  updateProject: (id: string, updates: Partial<CreateProjectRequest>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  addScheme: (scheme: CreateSchemeRequest) => Promise<void>;
  updateScheme: (id: string, updates: Partial<CreateSchemeRequest>) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;
  getSchemesForProject: (projectId: string) => InvestmentScheme[];
  refreshProjects: () => Promise<void>;
  refreshSchemes: () => Promise<void>;
}