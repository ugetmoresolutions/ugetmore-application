import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

// Sidebar Component - IMPROVED
export interface Category {
  name: string;
  subCategories: string[] | null;
  productCount: number;
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedSubCategory: string | null;
  onSubCategorySelect: (subCategory: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedSubCategory,
  onSubCategorySelect,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryName: string) => {
    onCategorySelect(categoryName);
    onSubCategorySelect(null);
  };

  const handleSubCategoryClick = (categoryName: string, subCategory: string) => {
    onCategorySelect(categoryName);
    onSubCategorySelect(subCategory);
  };

  return (
    <div className="bg-[#F9F9FB] rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 sm:p-4 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          Categories
        </h2>
        <nav className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const hasSubCategories = category.subCategories && category.subCategories.length > 0;
            const isSelected = selectedCategory === category.name;

            return (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className={`group flex items-center flex-1 p-2 sm:p-2.5 lg:p-3 rounded-md text-left transition-all duration-200 ${
                      isSelected && !selectedSubCategory
                        ? "bg-[#155874] text-white shadow-md"
                        : "text-gray-700 hover:bg-[#155874] hover:text-white"
                    }`}
                  >
                    <span className="flex-1 min-w-0 text-xs sm:text-sm lg:text-base truncate pr-2">
                      {category.name}
                    </span>
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {category.productCount}
                    </span>
                  </button>

                  {hasSubCategories && (
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className={`ml-1 p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                        isSelected
                          ? "text-white hover:bg-white/20"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  )}
                </div>

                {hasSubCategories && isExpanded && (
                  <div className="ml-3 sm:ml-4 lg:ml-6 space-y-0.5 border-l-2 border-gray-200 pl-3 sm:pl-4">
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleCategoryClick(category.name)}
                        className={`group flex items-center w-full p-1.5 sm:p-2 lg:p-2.5 rounded-md text-left transition-colors duration-200 ${
                          isSelected && !selectedSubCategory
                            ? "bg-[#155874]/10 text-[#155874] font-medium border border-[#155874]/20"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        <span className="flex-1 min-w-0 text-xs sm:text-sm truncate">
                          All {category.name}
                        </span>
                      </button>

                      {category.subCategories?.map((subCat) => (
                        <button
                          key={subCat}
                          onClick={() => handleSubCategoryClick(category.name, subCat)}
                          className={`group flex items-center w-full p-1.5 sm:p-2 lg:p-2.5 rounded-md text-left transition-colors duration-200 ${
                            selectedSubCategory === subCat && isSelected
                              ? "bg-[#155874] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          <span className="flex-1 min-w-0 text-xs sm:text-sm truncate">
                            {subCat}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
