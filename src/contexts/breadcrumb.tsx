"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbContextType {
  breadcrumbItems: BreadcrumbItem[];
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void;
  addBreadcrumbItem: (item: BreadcrumbItem) => void;
  resetBreadcrumb: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined,
);

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider = ({ children }: BreadcrumbProviderProps) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  const addBreadcrumbItem = (item: BreadcrumbItem) => {
    setBreadcrumbItems((prevItems) => [...prevItems, item]);
  };

  const resetBreadcrumb = () => {
    setBreadcrumbItems([]);
  };

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbItems,
        setBreadcrumbItems,
        addBreadcrumbItem,
        resetBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const BreadcrumbUpdater = ({ items }: { items: BreadcrumbItem[] }) => {
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems(items);
  }, [items, setBreadcrumbItems]);

  return null;
};
