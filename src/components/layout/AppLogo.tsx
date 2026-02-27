// src/components/layout/AppLogo.tsx
import type {SVGProps} from 'react';

interface AppLogoProps {
  showName?: boolean;
  className?: string;
  iconSize?: number;
}

const BlisszitsLogoIcon = (props: SVGProps<SVGSVGElement> & { size?: number }) => {
  const { size = 24, ...svgProps } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="hsl(var(--primary))" />
      <path d="M12 2L22 7V17L12 22" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 7L12 12L22 7" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
};


export const AppLogo = ({ showName = true, className, iconSize }: AppLogoProps) => {
  const defaultSize = showName ? 28 : 24;
  const finalSize = iconSize || defaultSize;

  return (
    <div className={`flex items-center space-x-2 ${className}`} suppressHydrationWarning>
      <BlisszitsLogoIcon size={finalSize} />
      {showName && <h1 className="text-xl font-bold text-foreground font-headline hidden sm:inline-block">Blisszits</h1>}
    </div>
  );
};
