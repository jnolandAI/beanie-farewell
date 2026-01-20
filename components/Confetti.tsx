import { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti colors - Memphis palette
const CONFETTI_COLORS = [
  '#FF00FF', // Magenta
  '#FFD700', // Gold
  '#00CED1', // Teal
  '#FF6B35', // Orange
  '#8B5CF6', // Purple
  '#FF1493', // Deep Pink
];

interface ConfettiPieceProps {
  index: number;
  color: string;
  startDelay: number;
}

function ConfettiPiece({ index, color, startDelay }: ConfettiPieceProps) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Random starting position
  const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const endX = useMemo(() => (Math.random() - 0.5) * 200, []);
  const duration = useMemo(() => 2000 + Math.random() * 1500, []);
  const rotations = useMemo(() => 2 + Math.random() * 4, []);

  // Random shape
  const isCircle = useMemo(() => Math.random() > 0.5, []);
  const size = useMemo(() => 8 + Math.random() * 8, []);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        // Fall down
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 100,
          duration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Drift sideways
        Animated.timing(translateX, {
          toValue: endX,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        // Rotate
        Animated.timing(rotate, {
          toValue: rotations,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade out near end
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animation.start();
  }, [translateY, translateX, rotate, opacity, startDelay, duration, endX, rotations]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: startX,
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: spin },
          ],
        },
      ]}
    />
  );
}

interface ConfettiProps {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 50, duration = 3000 }: ConfettiProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      startDelay: Math.random() * 500, // Stagger the start
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.index}
          index={piece.index}
          color={piece.color}
          startDelay={piece.startDelay}
        />
      ))}
    </View>
  );
}

// Burst confetti - shoots from center outward
export function ConfettiBurst({ count = 30 }: { count?: number }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        index: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        angle,
      };
    });
  }, [count]);

  return (
    <View style={styles.burstContainer} pointerEvents="none">
      {pieces.map((piece) => (
        <BurstPiece
          key={piece.index}
          color={piece.color}
          angle={piece.angle}
        />
      ))}
    </View>
  );
}

function BurstPiece({ color, angle }: { color: string; angle: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const distance = 150 + Math.random() * 100;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance;
  const size = 6 + Math.random() * 6;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.burstPiece,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [
            {
              translateX: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, endX],
              }),
            },
            {
              translateY: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, endY],
              }),
            },
            { scale },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
  },
  burstContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 0,
    height: 0,
    zIndex: 1000,
  },
  burstPiece: {
    position: 'absolute',
  },
});
