import ProgressBar from './ProgressBar';
import PointsDisplay from './PointsDisplay';

const DesktopLayout = ({ scale, isAnimating, rewardsData }) => {
  return (
    <div className="hidden md:flex items-center space-x-4 w-full max-w-md">
      <PointsDisplay 
        rewardsData={rewardsData} 
        isAnimating={isAnimating} 
      />
      <div className="flex-grow">
        <ProgressBar 
          scale={scale} 
          isAnimating={isAnimating} 
        />
      </div>
    </div>
  );
};

export default DesktopLayout;
