import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (password !== confirm) {
      Alert.alert('Erro', 'As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter ao menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) throw error
      Alert.alert('Conta criada', 'Confirme seu e-mail e faça login.')
      router.replace('/(auth)/login')
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.ornamentRow}>
          <View style={styles.line} />
          <Text style={styles.ornament}>◆</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.title}>CRIAR CONTA</Text>
        <Text style={styles.subtitle}>Comece sua jornada em Solum</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={theme.colors.text.secondary + '66'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={theme.colors.text.secondary + '66'}
            secureTextEntry
          />

          <Text style={styles.label}>CONFIRMAR SENHA</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repita a senha"
            placeholderTextColor={theme.colors.text.secondary + '66'}
            secureTextEntry
          />

          <Button label="Criar Conta" onPress={handleRegister} loading={loading} style={{ marginTop: theme.spacing.md }} />
          <Button
            label="Já tenho conta"
            onPress={() => router.replace('/(auth)/login')}
            variant="secondary"
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.xxl },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  line: { flex: 1, height: 0.5, backgroundColor: theme.colors.gold.dark },
  ornament: { color: theme.colors.gold.dark, fontSize: 12 },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 28,
    color: theme.colors.gold.main,
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xxl,
    fontStyle: 'italic',
  },
  form: { gap: theme.spacing.sm },
  label: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: theme.spacing.sm,
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
})
