import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, Loader } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { InvestmentScheme } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface EditSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheme: InvestmentScheme | null;
  isCommercial?: boolean;
  onSuccess?: () => void;
}

const EditSchemeDialog: React.FC<EditSchemeDialogProps> = ({
  open,
  onOpenChange,
  scheme,
  isCommercial = false,
  onSuccess,
}) => {
  const { updateScheme } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    scheme_name: "",
    area_sqft: "",
    booking_advance: "",
    balance_payment_days: "",
    total_installments: "",
    monthly_installment_amount: "",
    rental_start_month: "",
    is_active: true,
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Pre-fill form when scheme changes
  useEffect(() => {
    if (scheme) {
      setFormData({
        scheme_name: scheme.scheme_name || "",
        area_sqft: scheme.area_sqft?.toString() || "",
        booking_advance: scheme.booking_advance?.toString() || "",
        balance_payment_days: scheme.balance_payment_days?.toString() || "",
        total_installments: scheme.total_installments?.toString() || "",
        monthly_installment_amount:
          scheme.monthly_installment_amount?.toString() || "",
        rental_start_month: scheme.rental_start_month?.toString() || "",
        is_active: scheme.is_active !== undefined ? scheme.is_active : true,
      });

      // Set dates
      if (scheme.start_date) {
        setStartDate(new Date(scheme.start_date));
      }
      if (scheme.end_date) {
        setEndDate(new Date(scheme.end_date));
      }
    }
  }, [scheme]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheme) return;

    // Validate required fields
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.scheme_name ||
      !formData.area_sqft ||
      !formData.booking_advance
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create update data according to backend schema
      const updateData: any = {
        scheme_name: formData.scheme_name,
        area_sqft: parseInt(formData.area_sqft), // Backend expects int
        booking_advance: parseFloat(formData.booking_advance),
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        is_active: formData.is_active,
      };

      // Only include scheme-specific fields based on current scheme type
      if (scheme.scheme_type === "single_payment") {
        if (formData.balance_payment_days) {
          updateData.balance_payment_days = parseInt(
            formData.balance_payment_days
          );
        }
        // Clear installment fields if they exist
        updateData.total_installments = undefined;
        updateData.monthly_installment_amount = undefined;
      } else if (scheme.scheme_type === "installment") {
        if (formData.total_installments) {
          updateData.total_installments = parseInt(formData.total_installments);
        }
        if (formData.monthly_installment_amount) {
          updateData.monthly_installment_amount = parseFloat(
            formData.monthly_installment_amount
          );
        }
        // Clear single payment field if it exists
        updateData.balance_payment_days = undefined;
      }

      // Commercial-specific field
      if (isCommercial && formData.rental_start_month) {
        updateData.rental_start_month = parseInt(formData.rental_start_month);
      } else {
        updateData.rental_start_month = undefined;
      }

      await updateScheme(scheme.id, updateData);

      // Show success message
      toast({
        title: "Success",
        description: "Investment scheme updated successfully",
      });

      // Call success callback
      onSuccess?.();

      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating scheme:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update investment scheme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        scheme_name: "",
        area_sqft: "",
        booking_advance: "",
        balance_payment_days: "",
        total_installments: "",
        monthly_installment_amount: "",
        rental_start_month: "",
        is_active: true,
      });
      setStartDate(undefined);
      setEndDate(undefined);
    }
    onOpenChange(newOpen);
  };

  if (!scheme) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investment Scheme</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Editing: {scheme.scheme_name}
          </p>
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Scheme Type:</Label>
            <span className="text-sm capitalize">
              {scheme.scheme_type === "single_payment"
                ? "Single Payment"
                : "Installment"}
            </span>
            <span className="text-xs text-muted-foreground">
              (Cannot be changed)
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheme_name">Scheme Name *</Label>
              <Input
                id="scheme_name"
                value={formData.scheme_name}
                onChange={(e) =>
                  handleInputChange("scheme_name", e.target.value)
                }
                placeholder="Enter scheme name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_sqft">Area (Sq Ft) *</Label>
              <Input
                id="area_sqft"
                type="number"
                value={formData.area_sqft}
                onChange={(e) => handleInputChange("area_sqft", e.target.value)}
                placeholder="Enter area in square feet"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_advance">Booking Advance *</Label>
            <Input
              id="booking_advance"
              type="number"
              value={formData.booking_advance}
              onChange={(e) =>
                handleInputChange("booking_advance", e.target.value)
              }
              placeholder="Enter booking advance amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Conditional Fields based on current scheme type */}
          {scheme.scheme_type === "single_payment" && (
            <div className="space-y-2">
              <Label htmlFor="balance_payment_days">Balance Payment Days</Label>
              <Input
                id="balance_payment_days"
                type="number"
                value={formData.balance_payment_days}
                onChange={(e) =>
                  handleInputChange("balance_payment_days", e.target.value)
                }
                placeholder="Enter number of days for balance payment"
                min="0"
              />
            </div>
          )}

          {scheme.scheme_type === "installment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_installments">Total Installments</Label>
                <Input
                  id="total_installments"
                  type="number"
                  value={formData.total_installments}
                  onChange={(e) =>
                    handleInputChange("total_installments", e.target.value)
                  }
                  placeholder="Enter total installments"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_installment_amount">
                  Monthly Installment Amount
                </Label>
                <Input
                  id="monthly_installment_amount"
                  type="number"
                  value={formData.monthly_installment_amount}
                  onChange={(e) =>
                    handleInputChange(
                      "monthly_installment_amount",
                      e.target.value
                    )
                  }
                  placeholder="Enter monthly amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Commercial-specific field */}
          {isCommercial && (
            <div className="space-y-2">
              <Label htmlFor="rental_start_month">Rental Start Month</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left"
                  >
                    {formData.rental_start_month
                      ? `${formData.rental_start_month} months`
                      : "Select month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full max-w-xs p-0">
                  <div className="flex flex-col">
                    {["37", "61", "85"].map((month) => (
                      <button
                        key={month}
                        type="button"
                        className="px-4 py-2 text-left hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent popover/dialog close
                          handleInputChange("rental_start_month", month);
                        }}
                      >
                        {month} months
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Active Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <RadioGroup
              value={formData.is_active ? "active" : "inactive"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: value === "active",
                }))
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="cursor-pointer">
                  Active
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="cursor-pointer">
                  Inactive
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
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
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick start date</span>
                    )}
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
              <Label>End Date *</Label>
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
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick end date</span>
                    )}
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
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Scheme
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchemeDialog;
