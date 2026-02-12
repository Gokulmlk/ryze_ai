import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, Menu, Settings, Home, User, Search, Bell } from 'lucide-react';

// ============================================
// FIXED COMPONENT LIBRARY
// These components NEVER change
// AI can only select, compose, and configure them
// ============================================

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  variant = 'default' 
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    bordered: 'bg-white border-2 border-gray-300'
  };
  
  return (
    <div className={`rounded-lg overflow-hidden ${variantClasses[variant]}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export const Input = ({ 
  label, 
  placeholder, 
  type = 'text',
  value,
  onChange,
  error,
  disabled = false 
}: {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export const Table = ({ 
  headers, 
  rows,
  striped = false 
}: {
  headers: string[];
  rows: string[][];
  striped?: boolean;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-gray-200' : ''}`}>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={striped && rowIdx % 2 === 1 ? 'bg-gray-50' : ''}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  footer 
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          <div className="px-6 py-4">
            {children}
          </div>
          
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Sidebar = ({ 
  isOpen, 
  items,
  onItemClick 
}: {
  isOpen: boolean;
  items: Array<{ icon: string; label: string; id: string }>;
  onItemClick?: (id: string) => void;
}) => {
  const iconMap: any = {
    home: Home,
    user: User,
    settings: Settings,
    search: Search,
    bell: Bell,
    menu: Menu
  };
  
  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Navigation</h2>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || Home;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export const Navbar = ({ 
  title, 
  items,
  onMenuClick 
}: {
  title: string;
  items?: Array<{ label: string; onClick?: () => void }>;
  onMenuClick?: () => void;
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {items && items.length > 0 && (
          <div className="flex items-center gap-4">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export const Chart = ({ 
  type, 
  data,
  xKey,
  yKey,
  title 
}: {
  type: 'line' | 'bar';
  data: Array<any>;
  xKey: string;
  yKey: string;
  title?: string;
}) => {
  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;
  
  return (
    <div className="w-full">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent type="monotone" dataKey={yKey} fill="#3b82f6" stroke="#3b82f6" />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

// Component Registry - Used for validation
export const ALLOWED_COMPONENTS = [
  'Button',
  'Card',
  'Input',
  'Table',
  'Modal',
  'Sidebar',
  'Navbar',
  'Chart'
] as const;

export type AllowedComponent = typeof ALLOWED_COMPONENTS[number];
