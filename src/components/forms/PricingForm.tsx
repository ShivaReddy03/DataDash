import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

interface PricingFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

interface PricingDetail {
  key: string;
  value: string;
}

export const PricingForm: React.FC<PricingFormProps> = ({ form }) => {
  const [pricingDetails, setPricingDetails] = useState<PricingDetail[]>([
    { key: '', value: '' }
  ]);

  const watchedPricingDetails = form.watch('pricing_details');

  useEffect(() => {
    if (watchedPricingDetails && Object.keys(watchedPricingDetails).length > 0) {
      const details = Object.entries(watchedPricingDetails).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setPricingDetails(details.length > 0 ? details : [{ key: '', value: '' }]);
    }
  }, [watchedPricingDetails]);

  const handlePricingChange = (index: number, field: 'key' | 'value', value: string) => {
    const newDetails = [...pricingDetails];
    newDetails[index][field] = value;
    setPricingDetails(newDetails);
    
    // Update form value
    const pricingObj: Record<string, any> = {};
    newDetails.forEach(detail => {
      if (detail.key.trim()) {
        const numValue = parseFloat(detail.value);
        pricingObj[detail.key.trim()] = !isNaN(numValue) && detail.value.trim() !== '' ? numValue : detail.value;
      }
    });
    form.setValue('pricing_details', pricingObj);
  };

  const addPricingDetail = () => {
    setPricingDetails([...pricingDetails, { key: '', value: '' }]);
  };

  const removePricingDetail = (index: number) => {
    if (pricingDetails.length > 1) {
      const newDetails = pricingDetails.filter((_, i) => i !== index);
      setPricingDetails(newDetails);
      
      const pricingObj: Record<string, any> = {};
      newDetails.forEach(detail => {
        if (detail.key.trim()) {
          const numValue = parseFloat(detail.value);
          pricingObj[detail.key.trim()] = !isNaN(numValue) && detail.value.trim() !== '' ? numValue : detail.value;
        }
      });
      form.setValue('pricing_details', pricingObj);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="has_rental_income"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Rental Income Available</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Does this property generate rental income?
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium">Pricing Details</Label>
          {pricingDetails.map((detail, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., rent_per_sqft"
                  value={detail.key}
                  onChange={(e) => handlePricingChange(index, 'key', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value"
                  value={detail.value}
                  onChange={(e) => handlePricingChange(index, 'value', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePricingDetail(index)}
                disabled={pricingDetails.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addPricingDetail}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};