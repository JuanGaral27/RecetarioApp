import React, { useState } from 'react';
import { Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { Button, Input, ErrorBox } from '../ui';
import { colors } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) return setError('Nombre, correo y contraseña son obligatorios');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        bio: form.bio.trim(),
      });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 4 }}>Crear cuenta</Text>
          <Text style={{ color: colors.muted, marginBottom: 22 }}>Empieza a guardar tus recetas</Text>
          <ErrorBox message={error} />
          <Input label="Nombre" value={form.name} onChangeText={set('name')} placeholder="Tu nombre" />
          <Input label="Correo" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="tu@correo.com" />
          <Input label="Contraseña (mín. 6)" value={form.password} onChangeText={set('password')} secureTextEntry />
          <Input label="Confirmar contraseña" value={form.confirm} onChangeText={set('confirm')} secureTextEntry />
          <Input label="Bio (opcional)" value={form.bio} onChangeText={set('bio')} multiline maxLength={300} placeholder="Cuéntanos algo sobre ti" />
          <Button title="Registrarme" onPress={submit} loading={loading} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: colors.muted }}>
              ¿Ya tienes cuenta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
