'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLightbulb, 
  FaCrystalBall, 
  FaChartLine, 
  FaTrophy, 
  FaCalendarAlt,
  FaArrowUp,
  FaInfoCircle,
  FaSparkles,
  FaPrescriptionBottle,
  FaShoppingCart
} from 'react-icons/fa';
import { 
  generateEarningForecasts, 
  generateContextualInsights, 
  generateUsageRecommendations 
} from '@/lib/loyalty/contextualIntelligenceService';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';

/**
 * Contextual Insights Component - Phase 3 Implementation
 * 
 * Displays intelligent insights including:
 * 1. Predictive earning forecasts
 * 2. Contextual recommendations
 * 3. Usage pattern insights
 * 4. Tier progression predictions
 */

const ContextualInsights = ({ 
  orderData = null,
  orderHistory = [],
  variant = 'full', // 'full', 'compact', 'forecast-only'
  className = ""
}) => {
  const { userData, isLoading } = useImprovedLoyaltyStore();
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showForecast, setShowForecast] = useState(false);

  // Generate insights
  const insights = useMemo(() => {
    if (!userData || isLoading) return null;

    return {
      forecasts: generateEarningForecasts(userData, orderHistory, orderData),
      contextual: generateContextualInsights(orderData || {}, userData, orderHistory),
      recommendations: generateUsageRecommendations(userData, orderHistory)
    };
  }, [userData, orderHistory, orderData, isLoading]);

  if (isLoading || !insights) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (variant === 'forecast-only') {
    return <ForecastOnlyView forecasts={insights.forecasts} className={className} />;
  }

  if (variant === 'compact') {
    return <CompactView insights={insights} className={className} />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaCrystalBall className="text-white text-xl" />
            <h3 className="text-white font-bold text-lg">Smart Insights</h3>
          </div>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-1 text-sm transition-colors"
          >
            {showForecast ? 'Hide' : 'Show'} Forecast
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Forecasts Section */}
        <AnimatePresence>
          {showForecast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                Earning Forecasts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.forecasts.map((forecast, index) => (
                  <ForecastCard 
                    key={forecast.type} 
                    forecast={forecast} 
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contextual Insights */}
        {insights.contextual.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FaLightbulb className="mr-2 text-yellow-500" />
              Smart Recommendations
            </h4>
            <div className="space-y-3">
              {insights.contextual.map((insight, index) => (
                <InsightCard 
                  key={`${insight.type}-${index}`} 
                  insight={insight} 
                  onClick={() => setSelectedInsight(insight)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Usage Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FaSparkles className="mr-2 text-purple-500" />
              Personalized Tips
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {insights.recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <InsightModal 
            insight={selectedInsight} 
            onClose={() => setSelectedInsight(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Forecast Card Component
const ForecastCard = ({ forecast, index }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'tier_progression': return FaTrophy;
      case 'monthly_projection': return FaCalendarAlt;
      case 'prescription_savings': return FaPrescriptionBottle;
      case 'current_order_impact': return FaShoppingCart;
      default: return FaChartLine;
    }
  };

  const Icon = getIcon(forecast.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="text-blue-600 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-gray-900 text-sm">{forecast.title}</h5>
          <p className="text-gray-600 text-sm mt-1">{forecast.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{forecast.timeframe}</span>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                forecast.confidence > 0.7 ? 'bg-green-400' : 
                forecast.confidence > 0.5 ? 'bg-yellow-400' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-500">
                {Math.round(forecast.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Insight Card Component
const InsightCard = ({ insight, onClick }) => {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-700';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getPriorityStyle(insight.priority)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{insight.message}</p>
          {insight.actionable && (
            <div className="mt-2 flex items-center text-xs">
              <FaInfoCircle className="mr-1" />
              <span>Click for details</span>
            </div>
          )}
        </div>
        {insight.actionable && (
          <FaArrowUp className="text-sm transform rotate-45 opacity-60" />
        )}
      </div>
    </motion.div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
      <h5 className="font-medium text-gray-900 text-sm mb-2">{recommendation.title}</h5>
      <p className="text-gray-600 text-sm mb-3">{recommendation.description}</p>
      <div className="bg-purple-100 rounded-lg p-3">
        <p className="text-purple-800 text-sm font-medium">{recommendation.suggestion}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Personalized for you</span>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${
            recommendation.confidence > 0.7 ? 'bg-green-400' : 
            recommendation.confidence > 0.5 ? 'bg-yellow-400' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-gray-500">
            {Math.round(recommendation.confidence * 100)}% match
          </span>
        </div>
      </div>
    </div>
  );
};

// Compact View Component
const CompactView = ({ insights, className }) => {
  const topInsight = insights.contextual[0];
  const topForecast = insights.forecasts[0];

  if (!topInsight && !topForecast) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <FaLightbulb className="text-yellow-500" />
        <span className="font-medium text-gray-900 text-sm">Smart Insight</span>
      </div>
      
      {topInsight && (
        <p className="text-gray-600 text-sm mb-3">{topInsight.message}</p>
      )}
      
      {topForecast && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-blue-800 text-sm font-medium">{topForecast.description}</p>
          <p className="text-blue-600 text-xs mt-1">{topForecast.timeframe}</p>
        </div>
      )}
    </div>
  );
};

// Forecast Only View Component
const ForecastOnlyView = ({ forecasts, className }) => {
  if (!forecasts.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {forecasts.slice(0, 2).map((forecast, index) => (
        <ForecastCard key={forecast.type} forecast={forecast} index={index} />
      ))}
    </div>
  );
};

// Insight Modal Component
const InsightModal = ({ insight, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Insight Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            insight.priority === 'high' ? 'border-red-200 bg-red-50' :
            insight.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <p className="text-gray-800 font-medium">{insight.message}</p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Type:</strong> {insight.type.replace(/_/g, ' ')}</p>
            <p><strong>Priority:</strong> {insight.priority}</p>
            <p><strong>Actionable:</strong> {insight.actionable ? 'Yes' : 'No'}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContextualInsights; 