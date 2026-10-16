import React, { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { Button, Input, ErrorBox } from '../ui';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) return setError('Ingresa tu correo y contraseña');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 48, textAlign: 'center' }}>🍳</Text>
          <Text style={{ fontSize: 30, fontWeight: '900', color: colors.primary, textAlign: 'center' }}>Recetario</Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginBottom: 28 }}>Tus recetas, siempre a la mano</Text>

          <ErrorBox message={error} />
          <Input label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="tu@correo.com" />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" onSubmitEditing={submit} />
          <Button title="Iniciar sesión" onPress={submit} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: colors.muted }}>
              ¿No tienes cuenta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
