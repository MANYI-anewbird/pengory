import { ReactNode } from 'react';

interface PompomBorderProps {
  children: ReactNode;
}

export const PompomBorder = ({ children }: PompomBorderProps) => {
  return (
    <div className="min-h-screen bg-white p-0">
      <div className="w-full h-screen">
        {children}
      </div>
    </div>
  );
};
