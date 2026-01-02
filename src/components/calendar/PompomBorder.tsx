import { ReactNode } from 'react';

interface PompomBorderProps {
  children: ReactNode;
}

export const PompomBorder = ({ children }: PompomBorderProps) => {
  return (
    <div className="min-h-screen bg-background p-0">
      <div className="w-full h-screen relative">
        {children}
      </div>
    </div>
  );
};
