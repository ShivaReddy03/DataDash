import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import AddSchemeDialog from '@/components/AddSchemeDialog';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  LayoutGrid,
  Building
} from 'lucide-react';
import type { Project, InvestmentScheme, CreateSchemeRequest } from '@/types/api';

const Schemes: React.FC = () => {
  const { projects, schemes, getSchemesForProject, deleteScheme, updateScheme } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [filteredSchemes, setFilteredSchemes] = useState<InvestmentScheme[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<InvestmentScheme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  useEffect(() => {
    if (selectedProject) {
      const projectSchemes = getSchemesForProject(selectedProject);
      setFilteredSchemes(projectSchemes);
    } else {
      setFilteredSchemes([]);
    }
  }, [selectedProject, schemes, getSchemesForProject]);

  const handleDeleteScheme = async (schemeId: string) => {
    try {
      await deleteScheme(schemeId);
      toast({
        title: "Success",
        description: "Investment scheme deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete scheme",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSchemeTypeBadge = (type: string) => {
    return type === 'single_payment' ? (
      <Badge variant="secondary">Single Payment</Badge>
    ) : (
      <Badge variant="outline">Installment</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Schemes</h1>
          <p className="text-muted-foreground">Manage investment schemes for your projects</p>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Select Project</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a project to view its schemes" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <span>{project.title}</span>
                        <span className="text-muted-foreground">({project.location})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProject && (
              <Button 
                className="flex items-center space-x-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Scheme</span>
              </Button>
            )}
          </div>
          
          {selectedProjectData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">{selectedProjectData.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedProjectData.location}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{selectedProjectData.property_type}</Badge>
                <Badge variant="outline">{formatCurrency(selectedProjectData.base_price)}</Badge>
                <Badge variant="outline">{selectedProjectData.total_units} units</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schemes Display */}
      {!selectedProject ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Project</h3>
            <p className="text-muted-foreground">Choose a project above to view and manage its investment schemes</p>
          </CardContent>
        </Card>
      ) : filteredSchemes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No schemes found</h3>
            <p className="text-muted-foreground mb-4">This project doesn't have any investment schemes yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>Create First Scheme</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Schemes Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Schemes</p>
                    <p className="text-2xl font-bold">{filteredSchemes.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Schemes</p>
                    <p className="text-2xl font-bold">{filteredSchemes.filter(s => s.is_active).length}</p>
                  </div>
                  <LayoutGrid className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Area</p>
                    <p className="text-2xl font-bold">
                      {Math.round(filteredSchemes.reduce((acc, s) => acc + s.area_sqft, 0) / filteredSchemes.length)} sq ft
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="border border-border shadow-md hover:shadow-lg hover:border-primary transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{scheme.scheme_name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getSchemeTypeBadge(scheme.scheme_type)}
                        {scheme.is_active ? (
                          <Badge variant="default" className="bg-success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Area</span>
                        <p className="font-medium">{scheme.area_sqft} sq ft</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Booking Advance</span>
                        <p className="font-medium">{formatCurrency(scheme.booking_advance)}</p>
                      </div>
                    </div>

                    {scheme.scheme_type === 'installment' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Installments</span>
                          <p className="font-medium">{scheme.total_installments}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monthly Amount</span>
                          <p className="font-medium">{formatCurrency(scheme.monthly_installment_amount || 0)}</p>
                        </div>
                      </div>
                    )}

                    {scheme.scheme_type === 'single_payment' && scheme.balance_payment_days && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Balance Payment Days</span>
                        <p className="font-medium">{scheme.balance_payment_days} days</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <p className="font-medium">{formatDate(scheme.start_date)}</p>
                      </div>
                      {scheme.end_date && (
                        <div>
                          <span className="text-muted-foreground">End Date</span>
                          <p className="font-medium">{formatDate(scheme.end_date)}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingScheme(scheme);
                          setIsEditDialogOpen(true);
                        }}
                        className="hover:bg-info hover:text-info-foreground transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this scheme?')) {
                            handleDeleteScheme(scheme.id);
                          }
                        }}
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
        </>
      )}

      {/* Add Scheme Dialog */}
      {selectedProject && (
        <AddSchemeDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          projectId={selectedProject}
          isCommercial={selectedProjectData?.property_type === 'commercial'}
        />
      )}
    </div>
  );
};

export default Schemes;