// Define Main Category constants (these are fixed/predefined)
export const MainCategoryType = {
  FURNITURE: 'FURNITURE',
  JANITORIAL: 'JANITORIAL', 
  STATIONERY: 'STATIONERY',
  ELECTRONICS: 'ELECTRONICS'
} as const;

// Type for MainCategory ID
export type MainCategoryType = typeof MainCategoryType[keyof typeof MainCategoryType];

// Interface for Main Category (used for response formatting)
export interface IMainCategory {
  id: MainCategoryType;
  name: string;
  description: string;
  displayOrder: number;
}

// Static data - these are your fixed main categories
export const MAIN_CATEGORIES: IMainCategory[] = [
  { id: MainCategoryType.FURNITURE, name: 'Furniture', description: 'All furniture items', displayOrder: 1 },
  { id: MainCategoryType.JANITORIAL, name: 'Janitorial', description: 'Cleaning and janitorial supplies', displayOrder: 2 },
  { id: MainCategoryType.STATIONERY, name: 'Stationery', description: 'Office and school stationery', displayOrder: 3 },
  { id: MainCategoryType.ELECTRONICS, name: 'Electronics', description: 'Electronic devices and accessories', displayOrder: 4 }
];

// Validation function
export function isValidMainCategory(value: string): value is MainCategoryType {
  return Object.values(MainCategoryType).includes(value as MainCategoryType);
}