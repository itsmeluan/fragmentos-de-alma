import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      router.replace('/(game)')
    } catch (e) {
      Alert.alert('Erro ao entrar', e instanceof Error ? e.message : 'Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={styles.container}>
        {/* Logotipo */}
        <View style={styles.logoArea}>
          <View style={styles.ornamentTop} />
          <Text style={styles.logoTitle}>FRAGMENTOS</Text>
          <Text style={styles.logoSubtitle}>de Alma</Text>
          <View style={styles.ornamentBottom} />
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={theme.colors.text.secondary + '55'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: theme.spacing.md }]}>SENHA</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.text.secondary + '55'}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            label="Entrar em Solum"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: theme.spacing.lg }}
          />

          <Button
            label="Criar conta"
            onPress={() => router.push('/(auth)/register')}
            variant="secondary"
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>

        <Text style={styles.footer}>© Fragmentos de Alma — Solum</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  logoArea: { alignItems: 'center', gap: theme.spacing.xs },
  ornamentTop: {
    width: 60,
    height: 1,
    backgroundColor: theme.colors.gold.dark,
    marginBottom: theme.spacing.md,
  },
  ornamentBottom: {
    width: 60,
    height: 1,
    backgroundColor: theme.colors.gold.dark,
    marginTop: theme.spacing.md,
  },
  logoTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 32,
    color: theme.colors.gold.main,
    letterSpacing: 6,
    textAlign: 'center',
  },
  logoSubtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 16,
    color: theme.colors.text.secondary,
    letterSpacing: 3,
    fontStyle: 'italic',
  },
  form: { gap: theme.spacing.xs },
  label: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  input: {
    height: 48,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.border.radius.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 15,
  },
  footer: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary + '55',
    letterSpacing: 1,
    textAlign: 'center',
  },
})
