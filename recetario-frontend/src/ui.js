import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, StyleSheet, Image,
} from 'react-native';
import { colors, radius } from './theme';

export const DIFFICULTY_LABEL = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' };
export const CATEGORIES = ['desayuno', 'almuerzo', 'cena', 'postre', 'bebida', 'snack'];

export function Button({ title, onPress, variant = 'primary', loading, disabled, small, style }) {
  const v = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
    dangerOutline: { bg: 'transparent', fg: colors.danger, border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.muted, border: 'transparent' },
  }[variant];
  const off = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={off}
      style={[
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: off ? 0.55 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.btnText, small && { fontSize: 13 }, { color: v.fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 80, textAlignVertical: 'top' },
          error && { borderColor: colors.danger },
          style,
        ]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={{ color: colors.danger }}>{message}</Text>
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>🍲</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Fab({ onPress, label = '+' }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.fab}>
      <Text style={{ color: '#fff', fontSize: 28, lineHeight: 30 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function RecipeCard({ recipe, onPress, showOwner, right }) {
  const total = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.cardImage} /> : null}
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
          {!showOwner ? (
            <Text style={[styles.badge, { backgroundColor: recipe.isPublic ? '#DCEFE0' : colors.chip }]}>
              {recipe.isPublic ? 'Pública' : 'Privada'}
            </Text>
          ) : null}
        </View>
        {recipe.description ? (
          <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>{recipe.description}</Text>
        ) : null}
        <Text style={{ color: colors.muted, marginTop: 8, fontSize: 12 }}>
          {[
            recipe.category ? recipe.category : null,
            total ? `⏱ ${total} min` : null,
            DIFFICULTY_LABEL[recipe.difficulty],
            `${recipe.servings} porc.`,
          ].filter(Boolean).join('  ·  ')}
        </Text>
        {showOwner && recipe.owner?.name ? (
          <Text style={{ color: colors.primary, marginTop: 6, fontSize: 12 }}>Por {recipe.owner.name}</Text>
        ) : null}
        {right}
      </View>
    </TouchableOpacity>
  );
}

// Confirmación que funciona en móvil (Alert) y en web (window.confirm)
export function confirmAsync(title, message, confirmText = 'Aceptar', destructive = false) {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(globalThis.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

export function notify(title, message) {
  if (Platform.OS === 'web') globalThis.alert(`${title}\n\n${message || ''}`);
  else Alert.alert(title, message);
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  btnText: { fontWeight: '700', fontSize: 15 },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text,
  },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chip: {
    backgroundColor: colors.chip, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
    marginRight: 8, marginBottom: 8,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#FBE9E7', borderRadius: radius.md, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#F3C5BF',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 10 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  cardImage: { width: '100%', height: 140, backgroundColor: colors.chip },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text },
  badge: { fontSize: 11, fontWeight: '700', color: colors.text, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden', marginLeft: 8 },
});
