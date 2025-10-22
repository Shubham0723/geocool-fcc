'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VehicleSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function VehicleSearch({ searchTerm, onSearchChange }: VehicleSearchProps) {
  return (
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search vehicles..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
