/**
 * Tab Navigation Component
 * 
 * Reusable tab component with count badges
 */

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function TabNavigation({ tabs, activeTab, onChange, className = '' }: TabNavigationProps) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                group inline-flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all
                ${
                  isActive
                    ? 'border-[#14235C] text-[#14235C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && (
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#14235C]' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? 'bg-[#14235C] text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
