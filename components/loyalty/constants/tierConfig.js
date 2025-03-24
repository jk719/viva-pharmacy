import { FaGem, FaCrown, FaCar } from 'react-icons/fa';
import { IoMdRibbon, IoMdStar, IoMdTrophy, IoIosFlash, IoIosRocket } from 'react-icons/io';

export const TIER_COLORS = {
  BRONZE: {
    icon: 'text-amber-600',
    bg: 'from-amber-100 to-amber-300',
    background: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    progress: 'bg-amber-500'
  },
  SILVER: {
    icon: 'text-slate-500',
    bg: 'from-slate-100 to-slate-300',
    background: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    progress: 'bg-gray-400'
  },
  GOLD: {
    icon: 'text-yellow-500',
    bg: 'from-yellow-100 to-yellow-300',
    background: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    progress: 'bg-yellow-400'
  },
  PLATINUM: {
    icon: 'text-cyan-600',
    bg: 'from-cyan-100 to-cyan-300',
    background: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    progress: 'bg-slate-400'
  },
  SAPPHIRE: {
    icon: 'text-blue-600',
    bg: 'from-blue-100 to-blue-300',
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    progress: 'bg-blue-500'
  },
  DIAMOND: {
    icon: 'text-indigo-600',
    bg: 'from-indigo-100 to-indigo-300',
    background: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    progress: 'bg-purple-500'
  },
  LEGEND: {
    icon: 'text-violet-600',
    bg: 'from-violet-100 to-violet-300',
    background: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    progress: 'bg-red-500'
  }
};

export const TIER_ICONS = {
  BRONZE: <IoMdRibbon />,
  SILVER: <IoMdStar />,
  GOLD: <IoMdTrophy />,
  PLATINUM: <IoIosFlash />,
  SAPPHIRE: <IoIosRocket />,
  DIAMOND: <FaGem />,
  LEGEND: <FaCrown />
};

export { TIER_CONFIG } from '@/lib/loyalty/tierConfig'; 