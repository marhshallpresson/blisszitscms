
import type {SVGProps} from 'react';

interface AppLogoProps {
  showName?: boolean;
  className?: string;
  iconSize?: number; // Allow explicit icon size control
}

const BlisszitsLogoIcon = (props: SVGProps<SVGSVGElement> & { size?: number }) => {
  const { size = 24, ...svgProps } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 76 72" // Adjusted viewBox to better fit the aspect ratio of the design
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {/* Pink Top Part */}
      <path
        d="M56.9992 14.1191C56.9992 11.9858 56.1835 10.0158 54.7392 8.57142C53.295 7.12713 51.325 6.31142 49.1917 6.31142H20.5709C17.725 6.31142 15.3334 8.57142 15.3334 11.5557V23.2714L31.7584 31.09L15.3334 38.9086V50.6243C15.3334 53.6086 17.725 55.8686 20.5709 55.8686H49.1917C51.325 55.8686 53.295 55.0529 54.7392 53.6086C56.1835 52.1643 56.9992 50.1943 56.9992 48.061V36.1243L40.5742 28.3057L56.9992 20.4871V14.1191Z"
        fill="#F472B6" // Pink color
      />
      {/* Teal Bottom Part - adapted from the pink part, flipped and shifted */}
      <path
        d="M15.3334 48.061C15.3334 50.1943 16.1492 52.1643 17.5934 53.6086C19.0376 55.0529 21.0076 55.8686 23.1417 55.8686L51.7626 55.8686C54.6084 55.8686 56.9992 53.6086 56.9992 50.6243V38.9086L40.5742 31.09L56.9992 23.2714V11.5557C56.9992 8.57142 54.6084 6.31142 51.7626 6.31142H23.1417C21.0076 6.31142 19.0376 7.12713 17.5934 8.57142C16.1492 10.0158 15.3334 11.9858 15.3334 14.1191V26.0557L31.7584 33.8743L15.3334 41.6929V48.061Z"
        fill="#2DD4BF" // Teal color
      />
      {/* Purple Play Button - centered */}
      <path
        d="M31.7584 23.2714L45.3334 31.09L31.7584 38.9086V23.2714Z"
        fill="#8B5CF6" // Purple color
      />
    </svg>
  );
};


export const AppLogo = ({ showName = true, className, iconSize }: AppLogoProps) => {
  // Determine logo size based on showName prop if iconSize is not explicitly passed
  const defaultSize = showName ? 32 : 28;
  const finalSize = iconSize || defaultSize;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <BlisszitsLogoIcon size={finalSize} />
      {showName && <h1 className="text-xl font-bold text-foreground font-headline hidden lg:block">Blisszits</h1>}
    </div>
  );
};
