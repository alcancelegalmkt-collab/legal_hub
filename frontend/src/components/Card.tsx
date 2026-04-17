import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle }) => (
  <div className="border-b pb-4 mb-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({ children }) => (
  <div>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <div className="border-t pt-4 mt-4">
    {children}
  </div>
);
