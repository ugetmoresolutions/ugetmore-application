import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
  name: string;
  subCategories: string[] | null;
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedSubCategory: string | null;
  onSubCategorySelect: (subCategory: string | null) => void;
  getCategoryDisplayName?: (categoryName: string) => string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedSubCategory,
  onSubCategorySelect,
  getCategoryDisplayName
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Auto-expand the currently selected category
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      setExpandedCategories(prev => new Set(prev).add(selectedCategory));
    }
  }, [selectedCategory]);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryName: string, hasSubCategories: boolean) => {
    console.log("🎯 Sidebar: Category clicked:", categoryName);
    
    // If clicking the same category that's already selected
    if (selectedCategory === categoryName) {
      // If we're on the same category and no subcategory is selected, do nothing
      // Or you could choose to collapse it: toggleCategory(categoryName);
      return;
    }
    
    // Select the new category - this will trigger the main component to update URL
    onCategorySelect(categoryName);
    
    // Auto-expand if it has subcategories
    if (hasSubCategories && !expandedCategories.has(categoryName)) {
      setExpandedCategories(prev => new Set(prev).add(categoryName));
    }
  };

  const handleSubCategoryClick = (subCategory: string, parentCategory: string) => {
    console.log("🎯 Sidebar: Subcategory clicked:", { subCategory, parentCategory });
    
    // First ensure the parent category is selected
    if (selectedCategory !== parentCategory) {
      onCategorySelect(parentCategory);
    }
    
    // Then select the subcategory
    onSubCategorySelect(subCategory);
  };

  const handleAllSubCategoryClick = (parentCategory: string) => {
    console.log("🎯 Sidebar: All subcategories clicked for:", parentCategory);
    
    // Select the category but clear any subcategory filter
    onCategorySelect(parentCategory);
    onSubCategorySelect(null);
  };

  // Helper function to get display name - falls back to original name if function not provided
  const getDisplayName = (categoryName: string): string => {
    return getCategoryDisplayName ? getCategoryDisplayName(categoryName) : categoryName;
  };

  // Check if a category has subcategories - returns boolean (never null)
  const hasSubCategories = (category: Category): boolean => {
    return !!(category.subCategories && category.subCategories.length > 0);
  };

  return (
    <div className="bg-[#F9F9FB] max-w-xs rounded shadow-sm border border-gray-200">
      <div className="p-3 sm:p-4 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Categories</h2>
        
        {/* All Categories Option */}
        <div className="mb-3">
          <button
            onClick={() => onCategorySelect('All')}
            className={`w-full text-left p-2 sm:p-2.5 rounded text-xs sm:text-sm transition-all duration-200 ${
              selectedCategory === 'All' 
                ? 'bg-[#155874] text-white shadow-md font-medium' 
                : 'text-gray-700 hover:bg-[#155874] hover:text-white'
            }`}
          >
            <span className="flex items-center justify-between">
              <span>All Categories</span>
              {selectedCategory === 'All' && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
              )}
            </span>
          </button>
        </div>

        <nav className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const hasSubs = hasSubCategories(category); // This is now guaranteed to be boolean
            const isSelected = selectedCategory === category.name;
            const displayName = getDisplayName(category.name);
            
            return (
              <div key={category.name} className="space-y-1">
                {/* Main Category Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleCategoryClick(category.name, hasSubs)}
                    className={`group flex items-center flex-1 p-2 sm:p-2.5 rounded text-left transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#155874] text-white shadow-md font-medium' 
                        : 'text-gray-700 hover:bg-[#155874] hover:text-white'
                    }`}
                  >
                    <span className="flex-1 min-w-0 text-xs sm:text-sm truncate pr-2" title={displayName}>
                      {displayName}
                    </span>
                    {hasSubs && (
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        ({category.subCategories?.length})
                      </span>
                    )}
                  </button>
                  
                  {/* Expand/Collapse Button */}
                  {hasSubs && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.name);
                      }}
                      className={`ml-1 p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                        isSelected 
                          ? 'text-white hover:bg-white/20' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {hasSubs && isExpanded && (
                  <div className="ml-3 sm:ml-4 lg:ml-6 space-y-0.5 border-l-2 border-gray-200 pl-3 sm:pl-4">
                    <div className="space-y-0.5">
                      {/* "All" option for the category */}
                      <button
                        onClick={() => handleAllSubCategoryClick(category.name)}
                        className={`group flex items-center w-full p-1.5 sm:p-2 lg:p-2.5 rounded-md text-left transition-colors duration-200 ${
                          isSelected && !selectedSubCategory
                            ? 'bg-[#155874]/10 text-[#155874] font-medium border border-[#155874]/20' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        <span className="flex-1 min-w-0 text-xs sm:text-sm truncate">
                          All {displayName}
                        </span>
                        {isSelected && !selectedSubCategory && (
                          <span className="text-xs text-[#155874] font-medium">Active</span>
                        )}
                      </button>
                      
                      {/* Individual Subcategories */}
                      {category.subCategories?.map((subCat) => {
                        const isSubSelected = selectedSubCategory === subCat && isSelected;
                        return (
                          <button
                            key={subCat}
                            onClick={() => handleSubCategoryClick(subCat, category.name)}
                            className={`group flex items-center w-full p-1.5 sm:p-2 lg:p-2.5 rounded-md text-left transition-colors duration-200 ${
                              isSubSelected
                                ? 'bg-[#155874] text-white shadow-sm font-medium' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                          >
                            <span className="flex-1 min-w-0 text-xs sm:text-sm truncate" title={subCat}>
                              {subCat}
                            </span>
                            {isSubSelected && (
                              <span className="text-xs text-white/90">Active</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'All' || selectedSubCategory) && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h3>
            <div className="space-y-1 text-xs">
              {selectedCategory !== 'All' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-[#155874]">
                    {getDisplayName(selectedCategory)}
                  </span>
                </div>
              )}
              {selectedSubCategory && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subcategory:</span>
                  <span className="font-medium text-[#155874]">
                    {selectedSubCategory}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                onCategorySelect('All');
                onSubCategorySelect(null);
              }}
              className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium text-center"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};