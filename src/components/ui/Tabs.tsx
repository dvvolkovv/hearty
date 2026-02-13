import { ReactNode, createContext, useContext, useState } from 'react';
import { clsx } from 'clsx';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
};

export interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Tabs component - Container for tab navigation
 */
export const Tabs = ({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = ''
}: TabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const activeTab = controlledValue ?? uncontrolledValue;
  const setActiveTab = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className = '' }: TabsListProps) => (
  <div
    className={clsx(
      'inline-flex h-10 items-center justify-start rounded-lg bg-gray-100 p-1',
      className
    )}
  >
    {children}
  </div>
);

export interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const TabsTrigger = ({ children, value, className = '' }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2',
        'text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        className
      )}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const TabsContent = ({ children, value, className = '' }: TabsContentProps) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={clsx('mt-4', className)}>
      {children}
    </div>
  );
};
