import { Sparkles } from 'lucide-react';

interface AppLogoProps {
  showName?: boolean;
  className?: string;
}

export const AppLogo = ({ showName = true, className }: AppLogoProps) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="bg-primary p-2 rounded-lg">
        <Sparkles className="text-primary-foreground" size={showName ? 24 : 20} />
      </div>
      {showName && <h1 className="text-xl font-bold text-foreground font-headline hidden lg:block">Blisszits</h1>}
    </div>
  );
};
