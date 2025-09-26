import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditSchemeDialog from "@/components/EditSchemeDialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import AddSchemeDialog from "@/components/AddSchemeDialog";
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Ruler,
  LayoutGrid,
  Building,
} from "lucide-react";
import type {
  Project,
  InvestmentScheme,
  CreateSchemeRequest,
  ProjectOption,
} from "@/types/api";

const Schemes: React.FC = () => {
  const { deleteScheme } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [filteredSchemes, setFilteredSchemes] = useState<InvestmentScheme[]>(
    []
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<InvestmentScheme | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSchemes, setTotalSchemes] = useState(0);

  // Fetch project options for dropdown
  useEffect(() => {
    const fetchProjectOptions = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getProjectOptions();
        setProjectOptions(response || []);
      } catch (error) {
        console.error("Failed to fetch project options:", error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectOptions();
  }, [toast]);

  // Fetch schemes with pagination
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!selectedProject) {
        setFilteredSchemes([]);
        setTotalPages(0);
        setTotalSchemes(0);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiService.getSchemesForProject(
          selectedProject,
          {
            page: currentPage,
            limit: itemsPerPage,
          }
        );

        setFilteredSchemes(response.schemes || []);
        setTotalPages(response.total_pages || 1);
        setTotalSchemes(response.total_schemes || 0);
      } catch (error) {
        console.error("Failed to fetch schemes:", error);
        toast({
          title: "Error",
          description: "Failed to load schemes",
          variant: "destructive",
        });
        setFilteredSchemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, [selectedProject, currentPage, itemsPerPage, toast]);

  const refreshSchemes = async () => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      const response = await apiService.getSchemesForProject(selectedProject, {
        page: currentPage,
        limit: itemsPerPage,
      });

      setFilteredSchemes(response.schemes || []);
      setTotalPages(response.total_pages || 1);
      setTotalSchemes(response.total_schemes || 0);
    } catch (error) {
      console.error("Failed to refresh schemes:", error);
      toast({
        title: "Error",
        description: "Failed to refresh schemes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    try {
      await deleteScheme(schemeId);
      toast({
        title: "Success",
        description: "Investment scheme deleted successfully",
      });

      // Refresh the schemes list
      if (selectedProject) {
        const response = await apiService.getSchemesForProject(
          selectedProject,
          {
            page: currentPage,
            limit: itemsPerPage,
          }
        );
        setFilteredSchemes(response.schemes || []);
        setTotalPages(response.total_pages || 1);
        setTotalSchemes(response.total_schemes || 0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete scheme",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditClick = (scheme: InvestmentScheme) => {
    setEditingScheme(scheme);
    setIsEditDialogOpen(true);
  };

  // Function to generate pagination links with ellipsis
  const generatePaginationLinks = () => {
    const pages: JSX.Element[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        pages.push(<PaginationEllipsis key={`ellipsis-${i}`} />);
      }
    }
    return pages;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSchemeTypeBadge = (type: string) => {
    return type === "single_payment" ? (
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
          <p className="text-muted-foreground">
            Manage investment schemes for your projects
          </p>
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
              <Select
                value={selectedProject}
                onValueChange={(value) => {
                  setSelectedProject(value);
                  setCurrentPage(1);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Loading projects..."
                        : "Choose a project to view its schemes"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <span>{project.title}</span>
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
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                <span>Add Scheme</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schemes Display */}
      {!selectedProject ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project above to view and manage its investment schemes
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredSchemes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No schemes found</h3>
            <p className="text-muted-foreground mb-4">
              This project doesn't have any investment schemes yet
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Create First Scheme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Schemes Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Schemes
                    </p>
                    <p className="text-2xl font-bold">{totalSchemes}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Schemes
                    </p>
                    <p className="text-2xl font-bold">
                      {filteredSchemes.filter((s) => s.is_active).length}
                    </p>
                  </div>
                  <LayoutGrid className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Area</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        filteredSchemes.reduce(
                          (acc, s) => acc + s.area_sqft,
                          0
                        ) / filteredSchemes.length
                      )}{" "}
                      sq ft
                    </p>
                  </div>
                  <Ruler className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Page Info</p>
                    <p className="text-2xl font-bold">
                      {currentPage} / {totalPages}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="itemsPerPage"
                className="text-sm whitespace-nowrap"
              >
                Items per page:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground text-center sm:text-right">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalSchemes)} of{" "}
              {totalSchemes} schemes
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="border border-border shadow-md hover:shadow-lg hover:border-primary transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">
                        {scheme.scheme_name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getSchemeTypeBadge(scheme.scheme_type)}
                        {scheme.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
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
                        <span className="text-muted-foreground">
                          Booking Advance
                        </span>
                        <p className="font-medium">
                          {formatCurrency(scheme.booking_advance)}
                        </p>
                      </div>
                    </div>

                    {scheme.scheme_type === "installment" && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Installments
                          </span>
                          <p className="font-medium">
                            {scheme.total_installments}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Monthly Amount
                          </span>
                          <p className="font-medium">
                            {formatCurrency(
                              scheme.monthly_installment_amount || 0
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {scheme.scheme_type === "single_payment" &&
                      scheme.balance_payment_days && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Balance Payment Days
                          </span>
                          <p className="font-medium">
                            {scheme.balance_payment_days} days
                          </p>
                        </div>
                      )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground">
                          Start Date
                        </span>
                        <p className="font-medium">
                          {formatDate(scheme.start_date)}
                        </p>
                      </div>
                      {scheme.end_date && (
                        <div>
                          <span className="text-muted-foreground">
                            End Date
                          </span>
                          <p className="font-medium">
                            {formatDate(scheme.end_date)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(scheme)}
                        className="hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this scheme?"
                            )
                          ) {
                            handleDeleteScheme(scheme.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors"
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

          {/* Shadcn Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center py-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {generatePaginationLinks()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Add Scheme Dialog */}
      {selectedProject && (
        <AddSchemeDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          projectId={selectedProject}
          onSuccess={() => {
            // Refresh schemes after successful addition
            if (selectedProject) {
              apiService
                .getSchemesForProject(selectedProject, {
                  page: currentPage,
                  limit: itemsPerPage,
                })
                .then((response) => {
                  setFilteredSchemes(response.schemes || []);
                  setTotalPages(response.total_pages || 1);
                  setTotalSchemes(response.total_schemes || 0);
                });
            }
          }}
        />
      )}
      {editingScheme && (
        <EditSchemeDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          scheme={editingScheme}
          onSuccess={refreshSchemes} // Your refresh function
        />
      )}
    </div>
  );
};

export default Schemes;
