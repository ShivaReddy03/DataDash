import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  Admin,
  Project, 
  CreateProjectRequest,
  InvestmentScheme,
  CreateSchemeRequest,
  ProjectsQueryParams,
  SchemesQueryParams
} from '@/types/api';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }
    return data.data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async createAdmin(adminData: LoginRequest): Promise<Admin> {
    const response = await fetch(`${API_BASE_URL}/admin/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(adminData),
    });
    return this.handleResponse<Admin>(response);
  }

  async getProfile(): Promise<Admin> {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("No token available");

    const response = await fetch(`${API_BASE_URL}/admin/profile/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Admin>(response);
  }

  // Projects
  async getProjects(params: ProjectsQueryParams = {}): Promise<Project[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = `${API_BASE_URL}/projects/${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(), // 👈 added
    });
    return this.handleResponse<Project[]>(response);
  }
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    return this.handleResponse<Project>(response);
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(projectData),
    });
    return this.handleResponse<Project>(response);
  }

  async updateProject(
    id: string,
    updates: Partial<CreateProjectRequest>
  ): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Project>(response);
  }

  async searchProjects(
    query: string,
    params: ProjectsQueryParams = {}
  ): Promise<Project[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = `${API_BASE_URL}/projects/search/${encodeURIComponent(query)}${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await fetch(url);
    return this.handleResponse<Project[]>(response);
  }

  // Investment Schemes
  async getSchemes(
    params: SchemesQueryParams = {}
  ): Promise<InvestmentScheme[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = `${API_BASE_URL}/investment-schemes/${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await fetch(url);
    return this.handleResponse<InvestmentScheme[]>(response);
  }

  async getScheme(id: string): Promise<InvestmentScheme> {
    const response = await fetch(`${API_BASE_URL}/investment-schemes/${id}`);
    return this.handleResponse<InvestmentScheme>(response);
  }

  async getSchemesForProject(
    projectId: string,
    params: SchemesQueryParams = {}
  ): Promise<InvestmentScheme[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = `${API_BASE_URL}/investment-schemes/project/${projectId}${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await fetch(url);
    return this.handleResponse<InvestmentScheme[]>(response);
  }

  async createScheme(
    schemeData: CreateSchemeRequest
  ): Promise<InvestmentScheme> {
    const response = await fetch(`${API_BASE_URL}/investment-schemes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(schemeData),
    });
    return this.handleResponse<InvestmentScheme>(response);
  }

  async updateScheme(
    id: string,
    updates: Partial<CreateSchemeRequest>
  ): Promise<InvestmentScheme> {
    const response = await fetch(`${API_BASE_URL}/investment-schemes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<InvestmentScheme>(response);
  }
}

export const apiService = new ApiService();