import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { CreateProjectRequest } from '@/types';

interface FeaturesFormProps {
  form: UseFormReturn<CreateProjectRequest>;
}

export const FeaturesForm: React.FC<FeaturesFormProps> = ({ form }) => {
  const [keyHighlightInput, setKeyHighlightInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [investmentHighlightInput, setInvestmentHighlightInput] = useState('');

  const keyHighlights = form.watch('key_highlights') || [];
  const features = form.watch('features') || [];
  const investmentHighlights = form.watch('investment_highlights') || [];

  const addKeyHighlight = () => {
    if (keyHighlightInput.trim()) {
      const current = form.getValues('key_highlights') || [];
      form.setValue('key_highlights', [...current, keyHighlightInput.trim()]);
      setKeyHighlightInput('');
    }
  };

  const removeKeyHighlight = (index: number) => {
    const current = form.getValues('key_highlights') || [];
    form.setValue('key_highlights', current.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      const current = form.getValues('features') || [];
      form.setValue('features', [...current, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const current = form.getValues('features') || [];
    form.setValue('features', current.filter((_, i) => i !== index));
  };

  const addInvestmentHighlight = () => {
    if (investmentHighlightInput.trim()) {
      const current = form.getValues('investment_highlights') || [];
      form.setValue('investment_highlights', [...current, investmentHighlightInput.trim()]);
      setInvestmentHighlightInput('');
    }
  };

  const removeInvestmentHighlight = (index: number) => {
    const current = form.getValues('investment_highlights') || [];
    form.setValue('investment_highlights', current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, addFunction: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter a key highlight"
              value={keyHighlightInput}
              onChange={(e) => setKeyHighlightInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addKeyHighlight)}
            />
            <Button type="button" onClick={addKeyHighlight}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keyHighlights.map((highlight, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {highlight}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0"
                  onClick={() => removeKeyHighlight(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter a feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addFeature)}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {feature}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0"
                  onClick={() => removeFeature(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter an investment highlight"
              value={investmentHighlightInput}
              onChange={(e) => setInvestmentHighlightInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addInvestmentHighlight)}
            />
            <Button type="button" onClick={addInvestmentHighlight}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {investmentHighlights.map((highlight, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {highlight}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0"
                  onClick={() => removeInvestmentHighlight(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};