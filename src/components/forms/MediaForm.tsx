import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

interface MediaFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

interface GalleryImage {
  url: string;
  caption: string;
  is_primary: boolean;
}

export const MediaForm: React.FC<MediaFormProps> = ({ form }) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([
    { url: '', caption: '', is_primary: false }
  ]);

  const watchedGalleryImages = form.watch('gallery_images');

  useEffect(() => {
    if (watchedGalleryImages && watchedGalleryImages.length > 0) {
      setGalleryImages(watchedGalleryImages);
    }
  }, [watchedGalleryImages]);

  const handleImageChange = (index: number, field: keyof GalleryImage, value: string | boolean) => {
    const newImages = [...galleryImages];
    
    // If setting as primary, unset others
    if (field === 'is_primary' && value === true) {
      newImages.forEach((img, i) => {
        if (i !== index) img.is_primary = false;
      });
    }
    
    newImages[index] = { ...newImages[index], [field]: value };
    setGalleryImages(newImages);
    form.setValue('gallery_images', newImages);
  };

  const addImage = () => {
    const newImages = [...galleryImages, { url: '', caption: '', is_primary: false }];
    setGalleryImages(newImages);
    form.setValue('gallery_images', newImages);
  };

  const removeImage = (index: number) => {
    if (galleryImages.length > 1) {
      const newImages = galleryImages.filter((_, i) => i !== index);
      setGalleryImages(newImages);
      form.setValue('gallery_images', newImages);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media & Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Gallery Images</Label>
          {galleryImages.map((image, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Image {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Primary</Label>
                  <Switch
                    checked={image.is_primary}
                    onCheckedChange={(checked) => handleImageChange(index, 'is_primary', checked)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={galleryImages.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Caption</Label>
                  <Input
                    placeholder="Image description"
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addImage}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Gallery Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};