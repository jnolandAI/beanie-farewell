import React from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';

interface TeddyBearIconProps {
  size?: number;
  color?: string;
  tagColor?: string;
}

export function TeddyBearIcon({
  size = 80,
  color = '#FF6B6B',
  tagColor = '#FF6B6B'
}: TeddyBearIconProps) {
  // Slightly darker shade for inner ear
  const innerEarColor = '#E85555';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Left Ear */}
      <Circle cx="25" cy="25" r="14" fill={color} />
      <Circle cx="25" cy="25" r="8" fill={innerEarColor} />

      {/* Right Ear */}
      <Circle cx="75" cy="25" r="14" fill={color} />
      <Circle cx="75" cy="25" r="8" fill={innerEarColor} />

      {/* Head */}
      <Circle cx="50" cy="45" r="32" fill={color} />

      {/* Snout/Muzzle area - cream colored */}
      <Ellipse cx="50" cy="55" rx="14" ry="11" fill="#FFF5F0" />

      {/* Left Eye */}
      <Circle cx="38" cy="40" r="5" fill="#2D3436" />
      <Circle cx="36.5" cy="38.5" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <Circle cx="62" cy="40" r="5" fill="#2D3436" />
      <Circle cx="60.5" cy="38.5" r="1.5" fill="#FFFFFF" />

      {/* Nose */}
      <Ellipse cx="50" cy="51" rx="5" ry="4" fill="#2D3436" />
      <Ellipse cx="48.5" cy="49.5" rx="1.5" ry="1" fill="#636E72" />

      {/* Smile */}
      <Path
        d="M 44 58 Q 50 64 56 58"
        stroke="#2D3436"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Body hint at bottom */}
      <Ellipse cx="50" cy="85" rx="22" ry="14" fill={color} />

      {/* Belly patch */}
      <Ellipse cx="50" cy="85" rx="12" ry="8" fill="#FFFFFF" opacity={0.35} />

      {/* Blush marks for extra cuteness */}
      <Ellipse cx="28" cy="50" rx="5" ry="3" fill="#FFB6B6" opacity={0.5} />
      <Ellipse cx="72" cy="50" rx="5" ry="3" fill="#FFB6B6" opacity={0.5} />

      {/* Ty-style heart tag hanging from right ear */}
      <G>
        {/* Tag string/loop */}
        <Path
          d="M 83 20 Q 90 22 92 30"
          stroke={tagColor}
          strokeWidth="1.5"
          fill="none"
          opacity={0.8}
        />

        {/* Heart-shaped tag */}
        <Path
          d="M 92 32
             C 92 29 89 27 86.5 27
             C 84 27 82 29.5 82 32
             C 82 36 87 40 87 40
             C 87 40 92 36 92 32 Z"
          fill={tagColor}
        />

        {/* Tag highlight for depth */}
        <Circle cx="85" cy="31" r="1.5" fill="#FFFFFF" opacity={0.5} />
      </G>
    </Svg>
  );
}

export default TeddyBearIcon;
