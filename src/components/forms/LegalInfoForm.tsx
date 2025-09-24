import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

interface LegalInfoFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

interface QuickInfoItem {
  key: string;
  value: string;
}

export const LegalInfoForm: React.FC<LegalInfoFormProps> = ({ form }) => {
  const [quickInfo, setQuickInfo] = useState<QuickInfoItem[]>([
    { key: '', value: '' }
  ]);

  const watchedQuickInfo = form.watch('quick_info');

  useEffect(() => {
    if (watchedQuickInfo && Object.keys(watchedQuickInfo).length > 0) {
      const info = Object.entries(watchedQuickInfo).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setQuickInfo(info.length > 0 ? info : [{ key: '', value: '' }]);
    }
  }, [watchedQuickInfo]);

  const handleQuickInfoChange = (index: number, field: 'key' | 'value', value: string) => {
    const newInfo = [...quickInfo];
    newInfo[index][field] = value;
    setQuickInfo(newInfo);
    
    // Update form value
    const infoObj: Record<string, any> = {};
    newInfo.forEach(item => {
      if (item.key.trim()) {
        const numValue = parseFloat(item.value);
        infoObj[item.key.trim()] = !isNaN(numValue) && item.value.trim() !== '' ? numValue : item.value;
      }
    });
    form.setValue('quick_info', infoObj);
  };

  const addQuickInfo = () => {
    setQuickInfo([...quickInfo, { key: '', value: '' }]);
  };

  const removeQuickInfo = (index: number) => {
    if (quickInfo.length > 1) {
      const newInfo = quickInfo.filter((_, i) => i !== index);
      setQuickInfo(newInfo);
      
      const infoObj: Record<string, any> = {};
      newInfo.forEach(item => {
        if (item.key.trim()) {
          const numValue = parseFloat(item.value);
          infoObj[item.key.trim()] = !isNaN(numValue) && item.value.trim() !== '' ? numValue : item.value;
        }
      });
      form.setValue('quick_info', infoObj);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="rera_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RERA Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter RERA registration number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="building_permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building Permission</FormLabel>
              <FormControl>
                <Input placeholder="Enter building permission details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium">Quick Information</Label>
          {quickInfo.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Info title (e.g., Floor Area)"
                  value={item.key}
                  onChange={(e) => handleQuickInfoChange(index, 'key', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Info value"
                  value={item.value}
                  onChange={(e) => handleQuickInfoChange(index, 'value', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQuickInfo(index)}
                disabled={quickInfo.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addQuickInfo}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quick Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};