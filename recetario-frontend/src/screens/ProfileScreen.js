import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import * as api from '../api';
import { useAuth } from '../AuthContext';
import { Button, Input, ErrorBox, SectionTitle, confirmAsync, notify } from '../ui';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [delPassword, setDelPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setError('');
    if (!name.trim() || !email.trim()) return setError('Nombre y correo son obligatorios');
    if (newPassword && newPassword.length < 6) return setError('La nueva contraseña debe tener al menos 6 caracteres');
    if (newPassword && !currentPassword) return setError('Ingresa tu contraseña actual para cambiarla');
    setSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim() };
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }
      const updated = await api.users.update(payload);
      setUser(updated);
      setCurrentPassword(''); setNewPassword('');
      notify('Listo', 'Perfil actualizado');
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const deleteAccount = async () => {
    setError('');
    if (!delPassword) return setError('Escribe tu contraseña para confirmar el borrado de la cuenta');
    const ok = await confirmAsync(
      'Eliminar cuenta',
      'Se borrarán tu cuenta, todas tus recetas y todos tus grupos de forma permanente. ¿Continuar?',
      'Eliminar cuenta',
      true
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await api.users.remove(delPassword);
      await logout();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  const logoutNow = async () => {
    if (await confirmAsync('Cerrar sesión', '¿Quieres salir de tu cuenta?', 'Salir')) logout();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={{ width: 84, height: 84, borderRadius: 42 }} />
        ) : (
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{user.name?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 10, color: colors.text }}>{user.name}</Text>
        <Text style={{ color: colors.muted }}>{user.email}</Text>
      </View>

      <ErrorBox message={error} />
      <SectionTitle>Editar perfil</SectionTitle>
      <Input label="Nombre" value={name} onChangeText={setName} maxLength={80} />
      <Input label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline maxLength={300} />
      <Input label="URL de foto" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" placeholder="https://…" />

      <SectionTitle>Cambiar contraseña (opcional)</SectionTitle>
      <Input label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Input label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Button title="Guardar cambios" onPress={save} loading={saving} />
      <Button title="Cerrar sesión" variant="outline" onPress={logoutNow} style={{ marginTop: 10 }} />

      <View style={{ marginTop: 34, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#F3C5BF', backgroundColor: '#FFF6F4' }}>
        <Text style={{ fontWeight: '800', color: colors.danger, marginBottom: 4 }}>Zona de peligro</Text>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>Eliminar tu cuenta borra también todas tus recetas y grupos.</Text>
        <Input label="Confirma con tu contraseña" value={delPassword} onChangeText={setDelPassword} secureTextEntry />
        <Button title="Eliminar mi cuenta" variant="danger" onPress={deleteAccount} loading={deleting} />
      </View>
    </ScrollView>
  );
}
