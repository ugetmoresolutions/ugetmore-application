// context/NavigationContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type SectionType = 'stationery' | 'branding' | 'janitorial' | 'electronics';

interface NavigationContextType {
  currentSection: SectionType;
  setCurrentSection: (section: SectionType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState<SectionType>('branding');

  return (
    <NavigationContext.Provider value={{ currentSection, setCurrentSection }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};