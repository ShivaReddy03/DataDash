import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

// Form components
import { BasicInfoForm } from '@/components/forms/BasicInfoForm';
import { DescriptionForm } from '@/components/forms/DescriptionForm';
import { PricingForm } from '@/components/forms/PricingForm';
import { LegalInfoForm } from '@/components/forms/LegalInfoForm';
import { MediaForm } from '@/components/forms/MediaForm';
import { FeaturesForm } from '@/components/forms/FeaturesForm';
import { AmenitiesForm } from '@/components/forms/AmenitiesForm';

// Validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  property_type: z.enum(['commercial', 'residential', 'plot', 'land', 'mixed_use']),
  base_price: z.number().min(0, 'Base price must be positive'),
  status: z.enum(['available', 'sold_out', 'coming_soon']),
  description: z.string().optional(),
  long_description: z.string().optional(),
  website_url: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  total_units: z.number().min(0, 'Total units must be non-negative'),
  available_units: z.number().min(0, 'Available units must be non-negative'),
  sold_units: z.number().min(0, 'Sold units must be non-negative'),
  reserved_units: z.number().min(0, 'Reserved units must be non-negative'),
  has_rental_income: z.boolean(),
  rera_number: z.string().optional(),
  building_permission: z.string().optional(),
  pricing_details: z.record(z.string(), z.any()).optional(),
  quick_info: z.record(z.string(), z.any()).optional(),
  gallery_images: z.array(z.object({
    url: z.string(),
    caption: z.string(),
    is_primary: z.boolean()
  })).optional(),
  key_highlights: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  investment_highlights: z.array(z.string()).optional(),
  amenities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    icon: z.string()
  })).optional()
});

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const project = getProject(id!);

  const form = useForm<CreateProjectRequest>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      location: '',
      property_type: 'residential',
      base_price: 0,
      status: 'available',
      description: '',
      long_description: '',
      website_url: '',
      total_units: 0,
      available_units: 0,
      sold_units: 0,
      reserved_units: 0,
      has_rental_income: false,
      rera_number: '',
      building_permission: '',
      pricing_details: {},
      quick_info: {},
      gallery_images: [],
      key_highlights: [],
      features: [],
      investment_highlights: [],
      amenities: []
    }
  });

  useEffect(() => {
    if (project) {
      // Reset form with project data
      form.reset({
        title: project.title,
        location: project.location,
        property_type: project.property_type,
        base_price: project.base_price,
        status: project.status,
        description: project.description || '',
        long_description: project.long_description || '',
        website_url: project.website_url || '',
        total_units: project.total_units,
        available_units: project.available_units,
        sold_units: project.sold_units,
        reserved_units: project.reserved_units,
        has_rental_income: project.has_rental_income,
        rera_number: project.rera_number || '',
        building_permission: project.building_permission || '',
        pricing_details: project.pricing_details || {},
        quick_info: project.quick_info || {},
        gallery_images: project.gallery_images || [],
        key_highlights: project.key_highlights || [],
        features: project.features || [],
        investment_highlights: project.investment_highlights || [],
        amenities: project.amenities || []
      });
    }
  }, [project, form]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Project not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CreateProjectRequest) => {
    setLoading(true);
    try {
      await updateProject(id!, data);
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project information and details</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">Basic *</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <BasicInfoForm form={form} />
            </TabsContent>
            
            <TabsContent value="description" className="space-y-6">
              <DescriptionForm form={form} />
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6">
              <PricingForm form={form} />
            </TabsContent>
            
            <TabsContent value="legal" className="space-y-6">
              <LegalInfoForm form={form} />
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6">
              <MediaForm form={form} />
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6">
              <FeaturesForm form={form} />
            </TabsContent>
            
            <TabsContent value="amenities" className="space-y-6">
              <AmenitiesForm form={form} />
            </TabsContent>
          </Tabs>

          {/* Submit Actions - Always Visible */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  * Required fields must be completed before saving
                </p>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/projects/${id}`)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Project'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default EditProject;