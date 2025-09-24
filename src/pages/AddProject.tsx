import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Project } from '@/types';

interface DynamicSection {
  key: string;
  value: string;
}

const AddProject: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    property_type: '' as Project['property_type'],
    base_price: '',
    status: '' as Project['status'],
    description: '',
    total_units: '',
    available_units: '',
    sold_units: '',
    reserved_units: ''
  });

  const [pricingDetails, setPricingDetails] = useState<DynamicSection[]>([
    { key: '', value: '' }
  ]);

  const [quickInfo, setQuickInfo] = useState<DynamicSection[]>([
    { key: '', value: '' }
  ]);

  const [amenities, setAmenities] = useState<DynamicSection[]>([
    { key: '', value: '' }
  ]);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDynamicSectionChange = (
    sections: DynamicSection[],
    setSections: React.Dispatch<React.SetStateAction<DynamicSection[]>>,
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addDynamicSection = (
    sections: DynamicSection[],
    setSections: React.Dispatch<React.SetStateAction<DynamicSection[]>>
  ) => {
    setSections([...sections, { key: '', value: '' }]);
  };

  const removeDynamicSection = (
    sections: DynamicSection[],
    setSections: React.Dispatch<React.SetStateAction<DynamicSection[]>>,
    index: number
  ) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const convertSectionsToObject = (sections: DynamicSection[]) => {
    const result: Record<string, any> = {};
    sections.forEach(section => {
      if (section.key.trim()) {
        // Try to parse as number for pricing, otherwise keep as string
        const numValue = parseFloat(section.value);
        result[section.key.trim()] = !isNaN(numValue) && section.value.trim() !== '' ? numValue : section.value;
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        title: formData.title,
        location: formData.location,
        property_type: formData.property_type,
        base_price: parseFloat(formData.base_price),
        status: formData.status,
        description: formData.description,
        has_rental_income: formData.property_type === 'commercial',
        total_units: parseInt(formData.total_units),
        available_units: parseInt(formData.available_units),
        sold_units: parseInt(formData.sold_units),
        reserved_units: parseInt(formData.reserved_units),
        pricing_details: convertSectionsToObject(pricingDetails),
        quick_info: convertSectionsToObject(quickInfo),
        gallery_images: [],
        key_highlights: [],
        features: [],
        investment_highlights: [],
        amenities: Object.entries(convertSectionsToObject(amenities)).map(([name, value]) => ({
          name,
          icon: 'check',
          description: String(value)
        }))
      };

      await addProject(projectData);
      navigate('/');
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicSection = (
    title: string,
    sections: DynamicSection[],
    setSections: React.Dispatch<React.SetStateAction<DynamicSection[]>>,
    placeholder: { key: string; value: string }
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder={placeholder.key}
                value={section.key}
                onChange={(e) => handleDynamicSectionChange(sections, setSections, index, 'key', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder={placeholder.value}
                value={section.value}
                onChange={(e) => handleDynamicSectionChange(sections, setSections, index, 'value', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeDynamicSection(sections, setSections, index)}
              disabled={sections.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => addDynamicSection(sections, setSections)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value: Project['property_type']) => handleInputChange('property_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price</Label>
              <Input
                id="base_price"
                type="number"
                value={formData.base_price}
                onChange={(e) => handleInputChange('base_price', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Project['status']) => handleInputChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Units Information */}
        <Card>
          <CardHeader>
            <CardTitle>Units Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_units">Total Units</Label>
              <Input
                id="total_units"
                type="number"
                value={formData.total_units}
                onChange={(e) => handleInputChange('total_units', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_units">Available Units</Label>
              <Input
                id="available_units"
                type="number"
                value={formData.available_units}
                onChange={(e) => handleInputChange('available_units', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sold_units">Sold Units</Label>
              <Input
                id="sold_units"
                type="number"
                value={formData.sold_units}
                onChange={(e) => handleInputChange('sold_units', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserved_units">Reserved Units</Label>
              <Input
                id="reserved_units"
                type="number"
                value={formData.reserved_units}
                onChange={(e) => handleInputChange('reserved_units', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Sections */}
        {renderDynamicSection(
          'Pricing Details',
          pricingDetails,
          setPricingDetails,
          { key: 'Unit Type (e.g., 1BHK)', value: 'Price' }
        )}

        {renderDynamicSection(
          'Quick Info',
          quickInfo,
          setQuickInfo,
          { key: 'Info Title', value: 'Info Value' }
        )}

        {renderDynamicSection(
          'Amenities',
          amenities,
          setAmenities,
          { key: 'Amenity Name', value: 'Available (true/false)' }
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
