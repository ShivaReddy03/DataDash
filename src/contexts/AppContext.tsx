import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { Project, InvestmentScheme, AppContextType, CreateProjectRequest, CreateSchemeRequest } from '@/types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [schemes, setSchemes] = useState<InvestmentScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [projectsData, schemesData] = await Promise.all([
          apiService.getProjects(),
          apiService.getSchemes()
        ]);
        setProjects(projectsData);
        setSchemes(schemesData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addProject = async (projectData: CreateProjectRequest) => {
    try {
      const newProject = await apiService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<CreateProjectRequest>) => {
    try {
      const updatedProject = await apiService.updateProject(id, updates);
      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ));
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Hide project from public view by setting as inactive
      setProjects(prev => prev.filter(project => project.id !== id));
      setSchemes(prev => prev.filter(scheme => scheme.project_id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const addScheme = async (schemeData: CreateSchemeRequest) => {
    try {
      const newScheme = await apiService.createScheme(schemeData);
      setSchemes(prev => [...prev, newScheme]);
    } catch (error) {
      console.error('Failed to create scheme:', error);
      throw error;
    }
  };

  const updateScheme = async (id: string, updates: Partial<CreateSchemeRequest>) => {
    try {
      const updatedScheme = await apiService.updateScheme(id, updates);
      setSchemes(prev => prev.map(scheme => 
        scheme.id === id ? updatedScheme : scheme
      ));
    } catch (error) {
      console.error('Failed to update scheme:', error);
      throw error;
    }
  };

  const deleteScheme = async (id: string) => {
    try {
      await apiService.updateScheme(id, { is_active: false });
      setSchemes(prev => prev.filter(scheme => scheme.id !== id));
    } catch (error) {
      console.error('Failed to delete scheme:', error);
      throw error;
    }
  };

  const getSchemesForProject = (projectId: string) => {
    return schemes.filter(scheme => scheme.project_id === projectId);
  };

  const refreshProjects = async () => {
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      throw error;
    }
  };

  const refreshSchemes = async () => {
    try {
      const schemesData = await apiService.getSchemes();
      setSchemes(schemesData);
    } catch (error) {
      console.error('Failed to refresh schemes:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    projects,
    schemes,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    addScheme,
    updateScheme,
    deleteScheme,
    getSchemesForProject,
    refreshProjects,
    refreshSchemes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};