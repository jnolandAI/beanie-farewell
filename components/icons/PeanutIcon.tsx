import React from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';

interface PeanutIconProps {
  size?: number;
  color?: string;
  tagColor?: string;
}

export function PeanutIcon({
  size = 80,
  color = '#4ECDC4',
  tagColor = '#FF6B6B'
}: PeanutIconProps) {
  // Slightly darker shade for inner ear
  const innerEarColor = '#3DBDB5';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Left Ear - large elephant ear */}
      <Ellipse cx="18" cy="40" rx="16" ry="22" fill={color} />
      <Ellipse cx="20" cy="40" rx="10" ry="15" fill={innerEarColor} />

      {/* Right Ear - large elephant ear */}
      <Ellipse cx="82" cy="40" rx="16" ry="22" fill={color} />
      <Ellipse cx="80" cy="40" rx="10" ry="15" fill={innerEarColor} />

      {/* Head */}
      <Circle cx="50" cy="38" r="28" fill={color} />

      {/* Trunk */}
      <Path
        d="M 50 50
           Q 50 58 48 65
           Q 46 72 42 78
           Q 40 82 44 84
           Q 48 86 52 82
           Q 56 78 54 72
           Q 52 66 52 58
           Q 52 54 50 50"
        fill={color}
      />

      {/* Trunk highlight */}
      <Path
        d="M 48 55
           Q 47 62 45 68
           Q 44 72 46 74"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
      />

      {/* Trunk tip/end */}
      <Ellipse cx="48" cy="83" rx="5" ry="3" fill={innerEarColor} />

      {/* Left Eye */}
      <Circle cx="40" cy="35" r="5" fill="#2D3436" />
      <Circle cx="38.5" cy="33.5" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <Circle cx="60" cy="35" r="5" fill="#2D3436" />
      <Circle cx="58.5" cy="33.5" r="1.5" fill="#FFFFFF" />

      {/* Blush marks for extra cuteness */}
      <Ellipse cx="30" cy="42" rx="4" ry="2.5" fill="#FFB6B6" opacity={0.5} />
      <Ellipse cx="70" cy="42" rx="4" ry="2.5" fill="#FFB6B6" opacity={0.5} />

      {/* Small tusks */}
      <Ellipse cx="42" cy="52" rx="2" ry="4" fill="#FFF5F0" />
      <Ellipse cx="58" cy="52" rx="2" ry="4" fill="#FFF5F0" />

      {/* Body hint at bottom */}
      <Ellipse cx="50" cy="92" rx="18" ry="8" fill={color} />

      {/* Ty-style heart tag hanging from right ear */}
      <G>
        {/* Tag string/loop */}
        <Path
          d="M 92 35 Q 96 38 96 45"
          stroke={tagColor}
          strokeWidth="1.5"
          fill="none"
          opacity={0.8}
        />

        {/* Heart-shaped tag */}
        <Path
          d="M 96 47
             C 96 44 93 42 90.5 42
             C 88 42 86 44.5 86 47
             C 86 51 91 55 91 55
             C 91 55 96 51 96 47 Z"
          fill={tagColor}
        />

        {/* Tag highlight for depth */}
        <Circle cx="89" cy="46" r="1.5" fill="#FFFFFF" opacity={0.5} />
      </G>
    </Svg>
  );
}

export default PeanutIcon;
