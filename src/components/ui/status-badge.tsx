import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectStatus, PropertyType } from '@/types';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

interface PropertyTypeBadgeProps {
  type: PropertyType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'available':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'sold_out':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'coming_soon':
        return 'bg-warning text-warning-foreground hover:bg-warning/90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  return (
    <Badge className={cn(getStatusVariant(status), className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

export const PropertyTypeBadge: React.FC<PropertyTypeBadgeProps> = ({ type, className }) => {
  const getTypeVariant = (type: PropertyType) => {
    switch (type) {
      case 'residential':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'commercial':
        return 'bg-info text-info-foreground hover:bg-info/90';
      case 'plot':
        return 'bg-accent text-accent-foreground hover:bg-accent/90';
      case 'land':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'mixed_use':
        return 'gradient-primary text-primary-foreground hover:opacity-90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  return (
    <Badge className={cn(getTypeVariant(type), className)}>
      {type.replace('_', ' ')}
    </Badge>
  );
};