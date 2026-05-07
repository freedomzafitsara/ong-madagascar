// src/components/ui/Tabs.tsx
'use client';

import React from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, children }) => {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> => React.isValidElement(child)
  );

  const activeContent = tabs.find(tab => tab.props.id === activeTab)?.props.children;

  return (
    <div>
      <div className="flex gap-2 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => onTabChange(tab.props.id)}
            className={`px-4 py-2 font-medium transition flex items-center gap-2 ${
              activeTab === tab.props.id
                ? 'text-marine-600 border-b-2 border-marine-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.props.icon}
            {tab.props.label}
          </button>
        ))}
      </div>
      <div>{activeContent}</div>
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};
