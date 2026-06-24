import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  Path,
  Text as SkiaText,
  matchFont,
  vec,
} from '@shopify/react-native-skia'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '@/lib/theme'

interface AlchemicalCircleProps {
  active: boolean
  size?: number
  style?: ViewStyle
}

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ'] as const

function trianglePath(size: number, inverted: boolean): string {
  const c = size / 2
  const r = size * 0.34
  const points = inverted
    ? [
        { x: c, y: c + r },
        { x: c - r * 0.9, y: c - r * 0.55 },
        { x: c + r * 0.9, y: c - r * 0.55 },
      ]
    : [
        { x: c, y: c - r },
        { x: c + r * 0.9, y: c + r * 0.55 },
        { x: c - r * 0.9, y: c + r * 0.55 },
      ]

  return `M${points[0].x} ${points[0].y}L${points[1].x} ${points[1].y}L${points[2].x} ${points[2].y}Z`
}

export function AlchemicalCircle({ active, size = 120, style }: AlchemicalCircleProps) {
  const outerRotation = useSharedValue(0)
  const middleRotation = useSharedValue(0)
  const pulse = useSharedValue(1)
  const runeOpacity = useSharedValue(active ? 0.8 : 0.3)
  const font = useMemo(
    () => matchFont({ fontFamily: 'Cinzel', fontSize: Math.max(10, size * 0.085) }),
    [size]
  )

  useEffect(() => {
    if (active) {
      outerRotation.value = withRepeat(
        withTiming(360, { duration: 30000, easing: Easing.linear }),
        -1,
        false
      )
      middleRotation.value = withRepeat(
        withTiming(-360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      )
      pulse.value = 0.95
      pulse.value = withRepeat(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
      runeOpacity.value = withRepeat(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    } else {
      cancelAnimation(outerRotation)
      cancelAnimation(middleRotation)
      cancelAnimation(pulse)
      cancelAnimation(runeOpacity)
      pulse.value = withTiming(1, { duration: 180 })
      runeOpacity.value = withTiming(0.3, { duration: 180 })
    }
  }, [active, middleRotation, outerRotation, pulse, runeOpacity])

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerRotation.value}deg` }],
  }))
  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${middleRotation.value}deg` }],
  }))
  const triangleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))
  const runeStyle = useAnimatedStyle(() => ({
    opacity: runeOpacity.value,
  }))

  const center = size / 2
  const outerRadius = size * 0.45
  const middleRadius = size * 0.35
  const innerRadius = size * 0.085

  return (
    <View style={[styles.wrap, { width: size, height: size, opacity: active ? 1 : 0.3 }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
        <Canvas style={{ width: size, height: size }}>
          <Circle cx={center} cy={center} r={outerRadius} color={theme.colors.gold.main} style="stroke" strokeWidth={1} opacity={0.8} />
          {Array.from({ length: 8 }, (_, index) => {
            const angle = index * Math.PI / 4
            const inner = outerRadius - size * 0.04
            const outer = outerRadius + size * 0.015
            return (
              <Line
                key={`mark-${index}`}
                p1={vec(center + Math.cos(angle) * inner, center + Math.sin(angle) * inner)}
                p2={vec(center + Math.cos(angle) * outer, center + Math.sin(angle) * outer)}
                color={theme.colors.gold.light}
                strokeWidth={1.2}
              />
            )
          })}
        </Canvas>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, middleStyle]}>
        <Canvas style={{ width: size, height: size }}>
          <Circle cx={center} cy={center} r={middleRadius} color={theme.colors.gold.dark} style="stroke" strokeWidth={1}>
            <DashPathEffect intervals={[4, 8]} />
          </Circle>
        </Canvas>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, triangleStyle]}>
        <Canvas style={{ width: size, height: size }}>
          <Path path={trianglePath(size, false)} color={theme.colors.gold.main} opacity={0.3} />
          <Path path={trianglePath(size, true)} color={theme.colors.gold.dark} opacity={0.3} />
          <Circle cx={center} cy={center} r={innerRadius} color={theme.colors.gold.light} opacity={0.5} />
        </Canvas>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, runeStyle]}>
        <Canvas style={{ width: size, height: size }}>
          <Group>
            {RUNES.map((rune, index) => {
              const angle = index * Math.PI * 2 / RUNES.length - Math.PI / 2
              const x = center + Math.cos(angle) * (middleRadius + size * 0.005) - size * 0.025
              const y = center + Math.sin(angle) * (middleRadius + size * 0.005) + size * 0.028
              return (
                <SkiaText
                  key={rune}
                  x={x}
                  y={y}
                  text={rune}
                  font={font}
                  color={theme.colors.gold.light}
                  opacity={0.82}
                />
              )
            })}
          </Group>
        </Canvas>
      </Animated.View>

      {active && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, outerStyle]}>
          {Array.from({ length: 6 }, (_, index) => {
            const angle = index * Math.PI * 2 / 6
            const particleRadius = outerRadius + size * 0.055
            return (
              <View
                key={`particle-${index}`}
                style={[
                  styles.particle,
                  {
                    left: center + Math.cos(angle) * particleRadius - 2,
                    top: center + Math.sin(angle) * particleRadius - 2,
                  },
                ]}
              />
            )
          })}
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gold.light,
  },
})
