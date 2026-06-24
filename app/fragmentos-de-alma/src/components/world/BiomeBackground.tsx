import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import {
  Canvas,
  Circle,
  Line,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '@/lib/theme'
import { makeSeededRng } from '@/utils/random'

interface BiomeBackgroundProps {
  biomeId: string
  opacity?: number
}

interface Particle {
  x: number
  y: number
  size: number
}

function particles(seed: string, count: number, width: number, height: number): Particle[] {
  const rng = makeSeededRng(seed)
  return Array.from({ length: count }, () => ({
    x: rng() * width,
    y: rng() * height,
    size: 1 + rng() * 3,
  }))
}

export function BiomeBackground({ biomeId, opacity = 0.4 }: BiomeBackgroundProps) {
  const { width, height } = useWindowDimensions()
  const wave = useSharedValue(0)
  const meteor = useSharedValue(0)
  const genesisParticles = useMemo(() => particles('biome:genesis', 10, width, height), [height, width])
  const abismoParticles = useMemo(() => particles('biome:abismo', 22, width, height), [height, width])
  const celestialStars = useMemo(() => particles('biome:celestial', 50, width, height), [height, width])

  useEffect(() => {
    wave.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )
    meteor.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    )
  }, [meteor, wave])

  const waveStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - wave.value),
    transform: [{ scale: 0.6 + wave.value * 1.8 }],
  }))

  const meteorStyle = useAnimatedStyle(() => ({
    opacity: meteor.value < 0.18 ? meteor.value / 0.18 : meteor.value > 0.72 ? (1 - meteor.value) / 0.28 : 0.7,
    transform: [
      { translateX: (meteor.value - 0.5) * width * 0.7 },
      { translateY: (meteor.value - 0.5) * height * 0.22 },
    ],
  }))

  if (!['genesis', 'abismo', 'celestial'].includes(biomeId)) return null

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      {biomeId === 'genesis' && (
        <Canvas style={{ width, height }}>
          <Rect x={0} y={0} width={width} height={height}>
            <RadialGradient c={vec(width * 0.5, height * 0.42)} r={Math.max(width, height) * 0.65} colors={['#1A1A10', theme.colors.background.primary]} />
          </Rect>
          {genesisParticles.map((particle, index) => (
            <Rect
              key={`stone-${index}`}
              x={particle.x}
              y={particle.y}
              width={particle.size}
              height={particle.size * 1.6}
              color={theme.colors.text.primary}
              opacity={0.12}
            />
          ))}
          {Array.from({ length: 7 }, (_, index) => {
            const y = height * (0.72 + index * 0.035)
            return (
              <Line
                key={`ruin-${index}`}
                p1={vec(width * (0.08 + index * 0.11), y)}
                p2={vec(width * (0.18 + index * 0.11), y + (index % 2 === 0 ? 18 : -10))}
                color={theme.colors.border.subtle}
                opacity={0.48}
                strokeWidth={1}
              />
            )
          })}
          <Circle cx={width * 0.5} cy={height * 0.72} r={width * 0.42} color={theme.colors.gold.light} opacity={0.08} />
          <Circle cx={width * 0.5} cy={height * 0.76} r={width * 0.52} color={theme.colors.text.primary} opacity={0.04} />
        </Canvas>
      )}

      {biomeId === 'abismo' && (
        <>
          <Canvas style={{ width, height }}>
            <Rect x={0} y={0} width={width} height={height}>
              <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={['#0A0A1A', theme.colors.background.primary]} />
            </Rect>
            {abismoParticles.map((particle, index) => (
              <Circle
                key={`bio-${index}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.size * 0.6}
                color="#42A5F5"
                opacity={0.16 + (index % 4) * 0.04}
              />
            ))}
          </Canvas>
          <Animated.View style={[styles.waveLayer, waveStyle]}>
            <Canvas style={{ width, height }}>
              {[0, 1, 2].map(index => (
                <Circle
                  key={`wave-${index}`}
                  cx={width * 0.5}
                  cy={height * 0.45}
                  r={width * (0.18 + index * 0.13)}
                  color="#42A5F5"
                  style="stroke"
                  strokeWidth={1}
                  opacity={0.3 - index * 0.07}
                />
              ))}
            </Canvas>
          </Animated.View>
        </>
      )}

      {biomeId === 'celestial' && (
        <>
          <Canvas style={{ width, height }}>
            <Rect x={0} y={0} width={width} height={height}>
              <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={['#0A0A1E', theme.colors.background.primary]} />
            </Rect>
            <Circle cx={width * 0.28} cy={height * 0.22} r={width * 0.3} color="#6A1B9A" opacity={0.1} />
            {celestialStars.map((star, index) => (
              <Circle
                key={`star-${index}`}
                cx={star.x}
                cy={star.y}
                r={index % 8 === 0 ? 1.35 : 0.75}
                color={theme.colors.text.primary}
                opacity={0.2 + (index % 5) * 0.08}
              />
            ))}
          </Canvas>
          <Animated.View style={[styles.meteorLayer, meteorStyle]}>
            <Canvas style={{ width, height }}>
              <Line
                p1={vec(width * 0.62, height * 0.16)}
                p2={vec(width * 0.8, height * 0.08)}
                color={theme.colors.text.primary}
                strokeWidth={1.4}
                opacity={0.75}
              />
              <Line
                p1={vec(width * 0.6, height * 0.17)}
                p2={vec(width * 0.72, height * 0.12)}
                color={theme.colors.gold.light}
                strokeWidth={0.8}
                opacity={0.45}
              />
            </Canvas>
          </Animated.View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  waveLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meteorLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
})
