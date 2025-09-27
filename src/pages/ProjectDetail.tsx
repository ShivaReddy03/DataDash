import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentScheme } from "@/types/api";
import EditSchemeDialog from "@/components/EditSchemeDialog";
import {
  MapPin,
  DollarSign,
  Users,
  Edit,
  Plus,
  Trash2,
  Building2,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AddSchemeDialog from "@/components/AddSchemeDialog";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { getSchemesForProject, deleteScheme } = useApp();
  const [showAddScheme, setShowAddScheme] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiService.getProject(id);
        setProject(res.data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const [schemes, setSchemes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [editingScheme, setEditingScheme] = useState<InvestmentScheme | null>(
    null
  );
  const [showEditScheme, setShowEditScheme] = useState(false);

  const fetchSchemes = async () => {
    if (!id) return;
    try {
      setLoadingSchemes(true);
      const res = await apiService.getSchemesForProject(id, { page, limit });
      console.log("Schemes API response:", res);
      setSchemes(res.schemes ?? []); // use 'schemes' from API
      setTotalPages(res.total_pages ?? 1);
    } catch (err) {
      console.error("Failed to fetch schemes:", err);
    } finally {
      setLoadingSchemes(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [id, page, limit]);

  // Pagination functions
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, page - 2);
      let endPage = Math.min(totalPages, page + 2);

      if (page <= 3) {
        endPage = Math.min(totalPages, maxVisiblePages);
      } else if (page >= totalPages - 2) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Project not found</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success text-success-foreground";
      case "sold_out":
        return "bg-destructive text-destructive-foreground";
      case "coming_soon":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-primary text-primary-foreground";
      case "commercial":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteScheme = async (schemeId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this investment scheme?")
    ) {
      return;
    }

    try {
      await deleteScheme(schemeId); // call your API
      // Reload schemes after deletion
      fetchSchemes();
    } catch (error) {
      console.error("Failed to delete scheme:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace("_", " ")}
            </Badge>
            <Badge className={getPropertyTypeColor(project.property_type)}>
              {project.property_type.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {project.location}
          </div>
        </div>

        <Link to={`/projects/${project.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="schemes">Investment Schemes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>

                {project.long_description && (
                  <div>
                    <h4 className="font-medium mb-2">Detailed Overview</h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {project.long_description}
                    </p>
                  </div>
                )}

                {project.website_url && (
                  <div>
                    <h4 className="font-medium">Website</h4>
                    <a
                      href={project.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {project.website_url}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Base Price</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(project.base_price)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Property Type</h4>
                    <p className="text-lg capitalize">
                      {project.property_type.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {project.rera_number && (
                    <div>
                      <h4 className="font-medium">RERA Number</h4>
                      <p className="text-muted-foreground">
                        {project.rera_number}
                      </p>
                    </div>
                  )}
                  {project.building_permission && (
                    <div>
                      <h4 className="font-medium">Building Permission</h4>
                      <p className="text-muted-foreground">
                        {project.building_permission}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(project.quick_info ?? {}).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  )
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">
                    {formatDate(project.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated At</span>
                  <span className="font-medium">
                    {formatDate(project.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery */}
          {project.gallery_images?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery_images.map((img: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="rounded-lg shadow-md object-cover w-full h-48"
                    />
                    {img.caption && (
                      <p className="text-sm text-muted-foreground">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Highlights */}
          {project.key_highlights?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {project.key_highlights.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {project.features?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {project.features.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {project.investment_highlights?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {project.investment_highlights.map(
                    (item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(project.amenities ?? []).map((amenity: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border flex flex-col"
                  >
                    <span className="font-medium">{amenity.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {amenity.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Unit Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{project.total_units}</p>
                  <p className="text-muted-foreground">Total Units</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">
                    {project.available_units}
                  </p>
                  <p className="text-muted-foreground">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {project.sold_units}
                  </p>
                  <p className="text-muted-foreground">Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning">
                    {project.reserved_units}
                  </p>
                  <p className="text-muted-foreground">Reserved</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Sales Progress</span>
                  <span>
                    {Math.round(
                      (project.sold_units / project.total_units) * 100
                    )}
                    % Sold
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (project.sold_units / project.total_units) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(project.pricing_details ?? {}).map(
                  ([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{key}</h4>
                        <p className="text-2xl font-bold text-primary">
                          {typeof value === "number"
                            ? formatCurrency(value)
                            : String(value)}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Schemes Tab */}
        <TabsContent value="schemes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Investment Schemes</h3>
            <Button onClick={() => setShowAddScheme(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Scheme
            </Button>
          </div>

          {schemes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No investment schemes yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first investment scheme for this project
                </p>
                <Button onClick={() => setShowAddScheme(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Scheme
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {schemes.map((scheme) => (
                  <Card key={scheme.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {scheme.scheme_name}
                          </CardTitle>
                          <Badge
                            variant={
                              scheme.scheme_type === "single_payment"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {scheme.scheme_type.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingScheme(scheme);
                              setShowEditScheme(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteScheme(scheme.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Area</span>
                          <p className="font-medium">
                            {scheme.area_sqft} sq ft
                          </p>
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
                                scheme.monthly_installment_amount!
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {scheme.scheme_type === "single_payment" && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Balance Payment Days
                          </span>
                          <p className="font-medium">
                            {scheme.balance_payment_days} days
                          </p>
                        </div>
                      )}

                      {scheme.rental_start_month && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Rental Start
                          </span>
                          <p className="font-medium">
                            Month {scheme.rental_start_month}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground">
                            Start Date
                          </span>
                          <p className="font-medium">
                            {formatDate(scheme.start_date)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            End Date
                          </span>
                          <p className="font-medium">
                            {formatDate(scheme.end_date)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePreviousPage}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageClick(pageNumber)}
                          isActive={pageNumber === page}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {totalPages > 5 && page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Scheme Dialog */}
      <AddSchemeDialog
        open={showAddScheme}
        onOpenChange={setShowAddScheme}
        projectId={project.id}
        isCommercial={project.property_type === "commercial"}
        onSchemeAdded={fetchSchemes}
      />
      {/* Edit Scheme Dialog */}
      {editingScheme && (
        <EditSchemeDialog
          open={showEditScheme}
          onOpenChange={setShowEditScheme}
          scheme={editingScheme}
          isCommercial={project.property_type === "commercial"}
          onSuccess={fetchSchemes} // Refresh schemes after editing
        />
      )}
    </div>
  );
};

export default ProjectDetail;
