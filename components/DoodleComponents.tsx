import React from 'react';

interface DoodleCardProps {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
  borderColor?: string;
}

export const DoodleCard: React.FC<DoodleCardProps> = ({ 
  children, 
  className = '', 
  rotate = 'rotate-1',
  borderColor = 'border-black'
}) => {
  return (
    <div className={`wobbly-box bg-white border-4 ${borderColor} p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transform ${rotate} transition-transform hover:scale-[1.01] ${className}`}>
      {children}
    </div>
  );
};

interface DoodleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const DoodleButton: React.FC<DoodleButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const colors = {
    primary: 'bg-blue-400 hover:bg-blue-300 border-blue-900 text-white',
    secondary: 'bg-yellow-300 hover:bg-yellow-200 border-yellow-800 text-black',
    danger: 'bg-red-400 hover:bg-red-300 border-red-900 text-white',
  };

  return (
    <button 
      className={`
        hand-font text-xl font-bold py-3 px-8 
        border-4 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        transition-all duration-150
        ${colors[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const Tape: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute h-8 w-32 bg-yellow-200/80 -top-4 left-1/2 -translate-x-1/2 rotate-2 shadow-sm z-10 ${className}`}></div>
);
