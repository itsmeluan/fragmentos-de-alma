import React, { useEffect, useState } from 'react'
import { Stack, router, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel'
import { Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani'
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
} from '@expo-google-fonts/libre-baskerville'
import { supabase } from '@/lib/supabase'
import { SplashAnimation } from '@/components/splash/SplashAnimation'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
  })

  // Controla a splash animada — esconde após o vídeo completar
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
      return
    }
    // Fallback: se useFonts travar em produção, esconde após 4s
    const timeout = setTimeout(() => SplashScreen.hideAsync(), 4000)
    return () => clearTimeout(timeout)
  }, [fontsLoaded, fontError])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(game)')
      } else {
        router.replace('/(auth)/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(game)')
      } else {
        router.replace('/(auth)/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!fontsLoaded && !fontError) return null

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0F' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(game)" />
      </Stack>

      {/* Splash animada — sobrepõe tudo até o vídeo completar */}
      {!splashDone && (
        <SplashAnimation
          onComplete={() => setSplashDone(true)}
          minDuration={3500}
        />
      )}
    </>
  )
}
