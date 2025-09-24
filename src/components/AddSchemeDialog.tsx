import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { InvestmentScheme, CreateSchemeRequest } from '@/types';

interface AddSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isCommercial?: boolean;
}

const AddSchemeDialog: React.FC<AddSchemeDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  isCommercial = false
}) => {
  const { addScheme } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    scheme_name: '',
    scheme_type: 'single_payment' as InvestmentScheme['scheme_type'],
    area_sqft: '',
    booking_advance: '',
    balance_payment_days: '',
    total_installments: '',
    monthly_installment_amount: '',
    rental_start_month: ''
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    setLoading(true);

    try {
      const schemeData: CreateSchemeRequest = {
        project_id: projectId,
        scheme_name: formData.scheme_name,
        scheme_type: formData.scheme_type,
        area_sqft: parseFloat(formData.area_sqft),
        booking_advance: parseFloat(formData.booking_advance),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_active: true
      };

      if (formData.scheme_type === 'single_payment') {
        schemeData.balance_payment_days = parseInt(formData.balance_payment_days);
      } else {
        schemeData.total_installments = parseInt(formData.total_installments);
        schemeData.monthly_installment_amount = parseFloat(formData.monthly_installment_amount);
      }

      if (isCommercial && formData.rental_start_month) {
        schemeData.rental_start_month = parseInt(formData.rental_start_month);
      }

      await addScheme(schemeData);
      
      // Reset form
      setFormData({
        scheme_name: '',
        scheme_type: 'single_payment',
        area_sqft: '',
        booking_advance: '',
        balance_payment_days: '',
        total_installments: '',
        monthly_installment_amount: '',
        rental_start_month: ''
      });
      setStartDate(undefined);
      setEndDate(undefined);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Investment Scheme</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheme_name">Scheme Name</Label>
              <Input
                id="scheme_name"
                value={formData.scheme_name}
                onChange={(e) => handleInputChange('scheme_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_sqft">Area (Sq Ft)</Label>
              <Input
                id="area_sqft"
                type="number"
                value={formData.area_sqft}
                onChange={(e) => handleInputChange('area_sqft', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_advance">Booking Advance</Label>
            <Input
              id="booking_advance"
              type="number"
              value={formData.booking_advance}
              onChange={(e) => handleInputChange('booking_advance', e.target.value)}
              required
            />
          </div>

          {/* Scheme Type */}
          <div className="space-y-3">
            <Label>Scheme Type</Label>
            <RadioGroup
              value={formData.scheme_type}
              onValueChange={(value: InvestmentScheme['scheme_type']) => 
                handleInputChange('scheme_type', value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single_payment" id="single_payment" />
                <Label htmlFor="single_payment">Single Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="installment" id="installment" />
                <Label htmlFor="installment">Installment</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Fields */}
          {formData.scheme_type === 'single_payment' && (
            <div className="space-y-2">
              <Label htmlFor="balance_payment_days">Balance Payment Days</Label>
              <Input
                id="balance_payment_days"
                type="number"
                value={formData.balance_payment_days}
                onChange={(e) => handleInputChange('balance_payment_days', e.target.value)}
                required
              />
            </div>
          )}

          {formData.scheme_type === 'installment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_installments">Total Installments</Label>
                <Input
                  id="total_installments"
                  type="number"
                  value={formData.total_installments}
                  onChange={(e) => handleInputChange('total_installments', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_installment_amount">Monthly Installment Amount</Label>
                <Input
                  id="monthly_installment_amount"
                  type="number"
                  value={formData.monthly_installment_amount}
                  onChange={(e) => handleInputChange('monthly_installment_amount', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Commercial-specific field */}
          {isCommercial && (
            <div className="space-y-2">
              <Label htmlFor="rental_start_month">Rental Start Month</Label>
              <Input
                id="rental_start_month"
                type="number"
                value={formData.rental_start_month}
                onChange={(e) => handleInputChange('rental_start_month', e.target.value)}
                placeholder="Enter month number (e.g., 6 for June)"
              />
            </div>
          )}

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Scheme'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSchemeDialog;