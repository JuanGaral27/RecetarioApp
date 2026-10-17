import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { pickImageFromDevice } from './imagePicker';
import { Button } from './ui';
import { colors } from './theme';

// Campo para elegir una foto desde el dispositivo.
// value = imagen actual (data URI o URL), onChange(nuevoValor | '')
export default function ImageField({ label, value, onChange, round, aspect = [4, 3], width = 800 }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = async () => {
    setError('');
    setBusy(true);
    try {
      const img = await pickImageFromDevice({ width, aspect });
      if (img) onChange(img);
    } catch (e) {
      setError('No se pudo cargar la foto. Intenta con otra.');
    }
    setBusy(false);
  };

  const size = round ? { width: 110, height: 110, borderRadius: 55 } : { width: '100%', height: 180, borderRadius: 12 };

  return (
    <View style={{ marginBottom: 14, alignItems: round ? 'center' : 'stretch' }}>
      {label ? <Text style={{ fontWeight: '600', fontSize: 13, color: colors.text, marginBottom: 6, alignSelf: 'flex-start' }}>{label}</Text> : null}
      {value ? (
        <Image source={{ uri: value }} style={[size, { backgroundColor: colors.chip }]} resizeMode="cover" />
      ) : (
        <View style={[size, { backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }]}>
          <Text style={{ fontSize: 30 }}>📷</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Sin foto</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <Button title={value ? 'Cambiar foto' : 'Elegir foto'} variant="outline" small onPress={choose} loading={busy} />
        {value ? <Button title="Quitar" variant="dangerOutline" small onPress={() => onChange('')} /> : null}
      </View>
      {error ? <Text style={{ color: colors.danger, marginTop: 6, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}