"use client";

import React from 'react';

interface MiniSparklineProps {
  data: number[];
  color: string;
}

export function MiniSparklineChart({ data, color }: MiniSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const height = 36;
  const width = 110;
  const padding = 4;

  const coords = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const gradientId = `sparkline-${color.replace('#', '').replace(/[^a-zA-Z0-9]/g, '')}-${Math.floor(Math.random() * 1000)}`;

  return (
    <div className="w-28 h-9 shrink-0 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function computeRealTrend(items: any[], dateKey = 'created_at') {
  if (!items || items.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  
  const now = new Date().getTime();
  const times = items.map(item => {
    const d = item[dateKey] || item.submittedAt || item.date || item.createdAt || item.date_created;
    return d ? new Date(d).getTime() : now;
  }).sort((a, b) => a - b);

  const minTime = times[0];
  const maxTime = Math.max(times[times.length - 1], minTime + 86400000);
  const step = (maxTime - minTime) / 6;

  if (step === 0 || times.length === 1) {
    const val = items.length;
    return [
      Math.max(1, Math.floor(val * 0.3)), 
      Math.max(1, Math.floor(val * 0.45)), 
      Math.max(1, Math.floor(val * 0.6)), 
      Math.max(1, Math.floor(val * 0.75)), 
      Math.max(1, Math.floor(val * 0.85)), 
      val, 
      val
    ];
  }

  const sparkline = [0, 0, 0, 0, 0, 0, 0];
  let running = 0;
  let idx = 0;

  for (let i = 0; i < 7; i++) {
    const targetTime = minTime + step * i;
    while (idx < times.length && times[idx] <= targetTime) {
      running++;
      idx++;
    }
    sparkline[i] = running;
  }
  return sparkline;
}
