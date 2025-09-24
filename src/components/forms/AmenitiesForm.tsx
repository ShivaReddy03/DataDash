import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

interface AmenitiesFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

interface Amenity {
  name: string;
  description: string;
  icon: string;
}

export const AmenitiesForm: React.FC<AmenitiesFormProps> = ({ form }) => {
  const [amenities, setAmenities] = useState<Amenity[]>([
    { name: '', description: '', icon: 'check' }
  ]);

  const watchedAmenities = form.watch('amenities');

  useEffect(() => {
    if (watchedAmenities && watchedAmenities.length > 0) {
      setAmenities(watchedAmenities);
    }
  }, [watchedAmenities]);

  const handleAmenityChange = (index: number, field: keyof Amenity, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = { ...newAmenities[index], [field]: value };
    setAmenities(newAmenities);
    form.setValue('amenities', newAmenities);
  };

  const addAmenity = () => {
    const newAmenities = [...amenities, { name: '', description: '', icon: 'check' }];
    setAmenities(newAmenities);
    form.setValue('amenities', newAmenities);
  };

  const removeAmenity = (index: number) => {
    if (amenities.length > 1) {
      const newAmenities = amenities.filter((_, i) => i !== index);
      setAmenities(newAmenities);
      form.setValue('amenities', newAmenities);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {amenities.map((amenity, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amenity {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAmenity(index)}
                disabled={amenities.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g., Swimming Pool"
                  value={amenity.name}
                  onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-xs">Icon</Label>
                <Input
                  placeholder="e.g., pool, gym, wifi"
                  value={amenity.icon}
                  onChange={(e) => handleAmenityChange(index, 'icon', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Brief description"
                  value={amenity.description}
                  onChange={(e) => handleAmenityChange(index, 'description', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addAmenity}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Amenity
        </Button>
      </CardContent>
    </Card>
  );
};