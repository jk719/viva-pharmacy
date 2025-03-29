'use client';
import { formatDistanceToNow } from 'date-fns';

export default function TimeAgo({ date }) {
  return (
    <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
  );
} 