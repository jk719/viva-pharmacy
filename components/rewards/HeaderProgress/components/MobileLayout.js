import ProgressBar from './ProgressBar';
import PointsDisplay from './PointsDisplay';

const MobileLayout = ({ scale, isAnimating, rewardsData }) => {
  return (
    <div className="flex flex-col space-y-2 w-full md:hidden p-4">
      <PointsDisplay 
        rewardsData={rewardsData} 
        isAnimating={isAnimating} 
      />
      <ProgressBar 
        scale={scale} 
        isAnimating={isAnimating} 
      />
    </div>
  );
};

export default MobileLayout;
