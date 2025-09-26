import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateProjectRequest } from '@/types';

interface PricingFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

export const PricingForm: React.FC<PricingFormProps> = ({ form }) => {
  const pricingOptions = [
    { label: 'Rent per sqft', value: 'rent_per_sqft' },
    { label: 'Sale price per sqft', value: 'sale_price_per_sqft' }
  ];

  // Watch the pricing_details to get real-time updates
  const pricingDetails = form.watch('pricing_details') || {};
  const currentKey = Object.keys(pricingDetails)[0] || '';
  const currentValue = pricingDetails[currentKey] || 0; // Default to 0

  const handlePricingTypeChange = (value: string) => {
    // Set default value to 0 instead of the previous values
    form.setValue('pricing_details', {
      [value]: 0
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (currentKey) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        form.setValue('pricing_details', {
          [currentKey]: numValue
        });
      } else if (value === '') {
        // Set to 0 if empty
        form.setValue('pricing_details', {
          [currentKey]: 0
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="pricing_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Type</FormLabel>
                <Select 
                  onValueChange={handlePricingTypeChange} 
                  value={currentKey}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pricingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {currentKey && (
            <FormField
              control={form.control}
              name="pricing_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentKey === 'rent_per_sqft' ? 'Rent per sqft (₹)' : 'Sale price per sqft (₹)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentValue === 0 ? '' : currentValue} // Show empty when 0 for better UX
                      onChange={handlePriceChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Display current pricing details */}
        {currentKey && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Pricing</h4>
            <div className="text-sm">
              <span className="capitalize">
                {currentKey.replace(/_/g, ' ')}: 
              </span>
              <span className="font-semibold ml-2">
                ₹{typeof currentValue === 'number' ? currentValue.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};