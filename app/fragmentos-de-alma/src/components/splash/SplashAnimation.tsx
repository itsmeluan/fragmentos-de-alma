import React, { useEffect, useRef, useCallback } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { useVideoPlayer, VideoView } from 'expo-video'

const { width: SW, height: SH } = Dimensions.get('window')

// Quanto tempo (ms) esperar antes de chamar onComplete após o fade-out
const FADE_OUT_DURATION = 600

interface SplashAnimationProps {
  // Chamado quando a splash termina — navegar para o app
  onComplete: () => void
  // Duração mínima da splash em ms antes do fade-out (default: 3500)
  minDuration?: number
}

export function SplashAnimation({
  onComplete,
  minDuration = 3500,
}: SplashAnimationProps) {
  const opacity       = useSharedValue(0)
  const hasCompleted  = useRef(false)

  const triggerComplete = useCallback(() => {
    if (hasCompleted.current) return
    hasCompleted.current = true
    onComplete()
  }, [onComplete])

  const startFadeOut = useCallback(() => {
    opacity.value = withTiming(0, {
      duration: FADE_OUT_DURATION,
      easing: Easing.out(Easing.ease),
    }, (finished) => {
      if (finished) runOnJS(triggerComplete)()
    })
  }, [opacity, triggerComplete])

  // Player do vídeo — reprodução automática em loop suave
  const player = useVideoPlayer(
    require('../../../assets/video/sigil_loop_segment_4s.mp4'),
    (p) => {
      p.loop = true
      p.muted = true
      p.play()
    }
  )

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    })

    const timer = setTimeout(startFadeOut, minDuration)
    // Failsafe: garante onComplete mesmo se o fade-out ou vídeo travar
    const failsafe = setTimeout(triggerComplete, minDuration + 2000)
    return () => { clearTimeout(timer); clearTimeout(failsafe) }
  }, [])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[styles.root, animStyle]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
      {/* Overlay escuro nas bordas para mascarar artefatos de borda do vídeo */}
      <View style={styles.vignette} pointerEvents="none" />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  video: {
    width: SW,
    height: SH,
  },
  // Vinheta sutil — radial escuro nas bordas, deixa o centro da arte mais vivo
  vignette: {
    ...StyleSheet.absoluteFill,
    // Não há suporte nativo a gradiente radial sem lib, mas podemos
    // usar uma borda grossa escura sobreposta para simular o efeito
    borderWidth: SW * 0.15,
    borderColor: 'rgba(10,10,15,0.55)',
  },
})
