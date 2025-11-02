import React from 'react';
import { Filters as FiltersType } from '../types';
import { FilterIcon } from './Icons';
import { getMainCategory,getLeafCategory,searchInCategory } from '../hooks/categoryParser'; // ✅ Import hàm getMainCategory

interface FiltersProps {
  categories: string[];
  filters: FiltersType;
  onFilterChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void;
  onClear: () => void;
}

const Filters: React.FC<FiltersProps> = ({ categories, filters, onFilterChange, onClear }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange(name as keyof FiltersType, value === '' ? null : Number(value));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('category', e.target.value || null);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('minRating', e.target.value === '' ? null : Number(e.target.value));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <FilterIcon className="h-5 w-5 mr-2"/> 
        Filters
      </h3>
      
      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select 
          value={filters.category || ''}
          onChange={handleCategoryChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => {
            const main = getMainCategory(cat);
            const leaf = getLeafCategory(cat);
            const displayName = main === leaf ? main : `${main} › ${leaf}`;
            return (
              <option key={cat} value={cat}>
                {displayName}
              </option>
            );
          })}
</select>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex space-x-2">
          <input 
            type="number"
            name="minPrice"
            value={filters.minPrice ?? ''}
            onChange={handleInputChange}
            placeholder="Min"
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            min="0"
          />
          <input 
            type="number"
            name="maxPrice"
            value={filters.maxPrice ?? ''}
            onChange={handleInputChange}
            placeholder="Max"
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            min="0"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <select 
          value={filters.minRating ?? ''}
          onChange={handleRatingChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <button 
        onClick={onClear}
        className="w-full py-2 px-4 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default Filters;