import React from 'react';

/**
 * A wrapper around HTML select to maintain styling 
 * during migration from Chakra v2 Select to native select
 */
export const ChakraSelectWrapper: React.FC<{
  children: React.ReactNode;
  [key: string]: any;
}> = ({ children, ...props }) => {
  return (
    <div className="relative w-full">      <select 
        className="w-full h-10 pl-4 pr-8 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 hover:border-gray-400"
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
        <svg width="12" height="6" viewBox="0 0 12 6" fill="currentColor">
          <path d="M0 0L6 6L12 0H0Z"></path>
        </svg>
      </div>
    </div>
  );
};

/**
 * Helper to migrate Modal to Dialog
 */
export const ChakraDialogWrapper = {
  Root: ({ isOpen, onClose, children }: any) => (
    <div data-open={isOpen} data-onclose={onClose}>{children}</div>
  ),
  // Additional helper components can be added as needed
};

/**
 * Helper for responsive array syntax migration in v3
 */
export const responsiveArrayToObject = (values: any[]) => {
  if (!Array.isArray(values)) return values;
  
  const breakpoints = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  const result: Record<string, any> = {};
  
  values.forEach((value, index) => {
    if (index < breakpoints.length) {
      result[breakpoints[index]] = value;
    }
  });
  
  return result;
};
