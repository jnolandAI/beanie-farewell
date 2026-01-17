import React from 'react';
import Svg, { Path, Circle, G, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

interface HeartTagIconProps {
  size?: number;
  color?: string;
  textColor?: string;
}

export function HeartTagIcon({
  size = 80,
  color = '#FF6B6B',
  textColor = '#FFFFFF'
}: HeartTagIconProps) {
  // Slightly darker shade for gradient depth
  const darkerColor = '#E85555';
  // String/ribbon color
  const stringColor = '#B2BEC3';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Gradient for heart depth */}
        <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="50%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={darkerColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* String/ribbon hanging from tag */}
      <G>
        {/* Wavy string going up */}
        <Path
          d="M 50 6 Q 54 10 50 14 Q 46 18 50 22"
          stroke={stringColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Extra string curl at top */}
        <Path
          d="M 50 6 Q 47 2 50 0"
          stroke={stringColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </G>

      {/* Small oval loop/hole at top of tag */}
      <Ellipse
        cx="50"
        cy="26"
        rx="6"
        ry="5"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />
      {/* Loop inner highlight */}
      <Ellipse
        cx="50"
        cy="26"
        rx="6"
        ry="5"
        fill="none"
        stroke={darkerColor}
        strokeWidth="2"
      />

      {/* Main heart shape - classic Ty tag silhouette */}
      <Path
        d="M 50 34
           C 50 31 44 24 32 24
           C 18 24 10 38 10 50
           C 10 68 32 84 50 98
           C 68 84 90 68 90 50
           C 90 38 82 24 68 24
           C 56 24 50 31 50 34 Z"
        fill="url(#heartGradient)"
      />

      {/* Heart highlight for 3D shine effect - left curve */}
      <Path
        d="M 26 40
           C 21 46 18 54 20 62"
        stroke={textColor}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />

      {/* Small shine dot */}
      <Circle cx="28" cy="42" r="4" fill={textColor} opacity={0.45} />

      {/* Stylized "b" for Beanie - trademark-safe alternative */}
      <G>
        {/* Letter "b" - vertical stem */}
        <Path
          d="M 40 48 L 40 76"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
        {/* Letter "b" - bowl/curve */}
        <Path
          d="M 40 58
             Q 40 52 50 52
             Q 64 52 64 64
             Q 64 76 50 76
             Q 40 76 40 70"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.9}
        />
      </G>

      {/* Subtle inner heart outline for premium feel */}
      <Path
        d="M 50 44
           C 50 42 46 37 38 37
           C 28 37 22 47 22 55
           C 22 68 38 79 50 88
           C 62 79 78 68 78 55
           C 78 47 72 37 62 37
           C 54 37 50 42 50 44 Z"
        fill="none"
        stroke={textColor}
        strokeWidth="1"
        opacity={0.15}
      />
    </Svg>
  );
}

export default HeartTagIcon;
