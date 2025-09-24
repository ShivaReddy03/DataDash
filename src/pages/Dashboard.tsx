import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge, PropertyTypeBadge } from '@/components/ui/status-badge';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { projects, schemes, deleteProject, isLoading } = useApp();


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalProjects = projects.length;
  const totalValue = projects.reduce((sum, project) => sum + project.base_price, 0);
  const totalUnits = projects.reduce((sum, project) => sum + project.total_units, 0);
  const totalSchemes = schemes.length;

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated investment schemes.')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{totalUnits}</p>
              </div>
              <Users className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investment Schemes</p>
                <p className="text-2xl font-bold">{totalSchemes}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Link to="/projects/add">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
              <Link to="/projects/add">
                <Button>Create Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="gradient-card hover:shadow-hover transition-all duration-300 border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <StatusBadge status={project.status} />
                      <PropertyTypeBadge type={project.property_type} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Base Price</span>
                      <span className="font-semibold">{formatCurrency(project.base_price)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Units</span>
                        <p className="font-medium">{project.total_units}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available</span>
                        <p className="font-medium text-success">{project.available_units}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/projects/${project.id}/edit`}>
                        <Button variant="outline" size="sm" className="hover:bg-info hover:text-info-foreground transition-colors">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;