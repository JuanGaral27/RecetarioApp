import React, { useState } from 'react';
import { Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { Button, Input, ErrorBox } from '../ui';
import { colors } from '../theme';
import { validateName, validateEmail, validatePassword, NAME_MAX, PASS_MAX, EMAIL_MAX } from '../validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', bio: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async () => {
    setError('');
    const errs = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: form.password !== form.confirm ? 'Las contraseñas no coinciden' : '',
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
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
          <Input label={`Nombre (4 a ${NAME_MAX} caracteres)`} value={form.name} onChangeText={set('name')} maxLength={NAME_MAX} placeholder="Tu nombre" error={errors.name} />
          <Input label="Correo" value={form.email} onChangeText={set('email')} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" maxLength={EMAIL_MAX} placeholder="nombre@empresa.com" error={errors.email} />
          <Input label={`Contraseña (6 a ${PASS_MAX} caracteres)`} value={form.password} onChangeText={set('password')} secureTextEntry maxLength={PASS_MAX} error={errors.password} />
          <Input label="Confirmar contraseña" value={form.confirm} onChangeText={set('confirm')} secureTextEntry maxLength={PASS_MAX} error={errors.confirm} />
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