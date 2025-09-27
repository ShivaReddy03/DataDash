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
  SchemesQueryParams,
  ProjectOption,
  DashboardResponse,
} from "@/types/api";

const API_BASE_URL = "http://localhost:8000";

// Fix: Define proper response interfaces
interface PaginatedResponse<T> {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  total_projects?: number;
  total_schemes?: number;
  projects?: T[];
  schemes?: T[];
  is_previous: boolean;
  is_next: boolean;
}

interface SingleItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Fix: Check if response has success: false
    if (data.success === false) {
      throw new Error(data.message || "API request failed");
    }

    return data;
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

  async createAdmin(
    adminData: LoginRequest
  ): Promise<SingleItemResponse<Admin>> {
    const response = await fetch(`${API_BASE_URL}/admin/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(adminData),
    });
    return this.handleResponse<SingleItemResponse<Admin>>(response);
  }

  // Add pagination support for getAdmins
  async getAdmins(
    page: number = 1,
    limit: number = 9
  ): Promise<{ admins: Admin[]; total: number; page: number; pages: number }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Raw API Response:", responseData);

    // Handle the response structure { success: true, data: Array, total, page, pages }
    if (responseData.success && responseData.data) {
      return {
        admins: responseData.data || [], // Directly use the data array
        total: responseData.total || 0,
        page: responseData.page || page,
        pages: responseData.pages || 1,
      };
    }

    // Fallback for unexpected structure
    return {
      admins: [],
      total: 0,
      page: page,
      pages: 1,
    };
  }
  // In your apiService.ts - ensure updateAdmin sends all three fields
  async updateAdmin(
    adminId: string,
    updateData: { name?: string; email?: string; password?: string }
  ): Promise<Admin> {
    const payload = {
      ...updateData,
      password: updateData.password?.trim() ? updateData.password : null,
    };
    const response = await fetch(`${API_BASE_URL}/admin/${adminId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return this.handleResponse<Admin>(response);
  }
  // Add this to your apiService.ts
  async deleteAdmin(adminId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/${adminId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<void>(response);
  }

  async getDashboard(): Promise<DashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<DashboardResponse>(response);
  }

  async getProfile(): Promise<SingleItemResponse<Admin>> {
    const response = await fetch(`${API_BASE_URL}/admin/profile/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<SingleItemResponse<Admin>>(response);
  }

  // Projects - FIXED: Use proper paginated response type
  async getProjects(
    params: ProjectsQueryParams = {}
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/projects/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<Project>>(response);
  }

  async getProject(id: string): Promise<SingleItemResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<SingleItemResponse<Project>>(response);
  }

  async getProjectOptions(): Promise<ProjectOption[]> {
    const response = await fetch(`${API_BASE_URL}/projects/options`, {
      headers: this.getAuthHeaders(),
    });
    const json = await this.handleResponse<{
      success: boolean;
      message: string;
      data: ProjectOption[];
    }>(response);
    return json.data;
  }

  async createProject(
    projectData: CreateProjectRequest
  ): Promise<SingleItemResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return this.handleResponse<SingleItemResponse<Project>>(response);
  }

  async updateProject(
    id: string,
    updates: Partial<CreateProjectRequest>
  ): Promise<SingleItemResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse<SingleItemResponse<Project>>(response);
  }

  // Fix: Search projects should also return paginated response
  async searchProjects(
    query: string,
    params: ProjectsQueryParams = {}
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/projects/search/${encodeURIComponent(query)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<Project>>(response);
  }

  // Investment Schemes - FIXED: Handle different response structures
  async getSchemes(
    params: SchemesQueryParams = {}
  ): Promise<PaginatedResponse<InvestmentScheme>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/investment-schemes/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<InvestmentScheme>>(response);
  }

  async getSchemesForProject(
    projectId: string,
    params: SchemesQueryParams = {}
  ): Promise<PaginatedResponse<InvestmentScheme>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/investment-schemes/project/${projectId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<InvestmentScheme>>(response);
  }

  async createScheme(
    schemeData: CreateSchemeRequest
  ): Promise<SingleItemResponse<InvestmentScheme>> {
    const response = await fetch(`${API_BASE_URL}/investment-schemes/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(schemeData),
    });
    return this.handleResponse<SingleItemResponse<InvestmentScheme>>(response);
  }

  async updateScheme(
    id: string,
    updates: Partial<CreateSchemeRequest>
  ): Promise<SingleItemResponse<InvestmentScheme>> {
    const response = await fetch(`${API_BASE_URL}/investment-schemes/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse<SingleItemResponse<InvestmentScheme>>(response);
  }
}

export const apiService = new ApiService();
