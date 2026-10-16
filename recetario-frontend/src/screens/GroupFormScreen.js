import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import * as api from '../api';
import { Button, Input, ErrorBox, Loading } from '../ui';
import { colors } from '../theme';

export default function GroupFormScreen({ route, navigation }) {
  const editId = route.params?.id;
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar grupo' : 'Nuevo grupo' });
    if (!editId) return;
    api.groups.get(editId)
      .then((g) => { setName(g.name); setDescription(g.description || ''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [editId, navigation]);

  const save = async () => {
    setError(''); setNameError('');
    if (!name.trim()) return setNameError('El nombre es obligatorio');
    setSaving(true);
    try {
      const data = { name: name.trim(), description: description.trim() };
      if (editId) await api.groups.update(editId, data);
      else await api.groups.create(data);
      navigation.goBack();
    } catch (e) {
      if (e.status === 409) setNameError('Ya tienes un grupo con ese nombre.');
      else setError(e.message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
      <ErrorBox message={error} />
      <Input label="Nombre *" value={name} onChangeText={(v) => { setName(v); setNameError(''); }} maxLength={80} placeholder="Ej: Cenas rápidas" error={nameError} />
      <Input label="Descripción" value={description} onChangeText={setDescription} multiline maxLength={300} placeholder="Opcional" />
      <Button title={editId ? 'Guardar cambios' : 'Crear grupo'} onPress={save} loading={saving} />
    </ScrollView>
  );
}
