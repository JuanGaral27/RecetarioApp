import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../api';
import { Button, RecipeCard, EmptyState, ErrorBox, Loading, confirmAsync, notify } from '../ui';
import { colors } from '../theme';

export default function GroupDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState(null); // lista de recetas disponibles para agregar
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const g = await api.groups.get(id);
      setGroup(g);
      navigation.setOptions({ title: g.name });
    } catch (e) {
      setError(e.message);
    }
  }, [id, navigation]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openPicker = async () => {
    try {
      const mine = await api.recipes.mine();
      const inGroup = new Set(group.recipes.map((r) => r._id));
      setPicker(mine.filter((r) => !inGroup.has(r._id)));
    } catch (e) { setError(e.message); }
  };

  const addRecipe = async (recipe) => {
    try {
      await api.groups.addRecipe(id, recipe._id);
      setPicker((list) => list.filter((r) => r._id !== recipe._id));
      load();
    } catch (e) { notify('Error', e.message); }
  };

  const removeRecipe = async (recipe) => {
    const ok = await confirmAsync(
      'Quitar del grupo',
      `"${recipe.title}" saldrá de este grupo, pero NO se borrará. Seguirá en tus recetas.`,
      'Quitar'
    );
    if (!ok) return;
    try {
      await api.groups.removeRecipe(id, recipe._id);
      load();
    } catch (e) { notify('Error', e.message); }
  };

  // 1) Pide el aviso al backend (409 con el conteo)  2) si el usuario acepta, borra con confirm=true
  const deleteGroup = async () => {
    setBusy(true);
    try {
      await api.groups.remove(id, false);
      navigation.goBack(); // (solo si el backend no pidiera confirmación)
    } catch (e) {
      if (e.status === 409) {
        const ok = await confirmAsync('Eliminar grupo', e.data?.message?.replace(' Repite la petición con ?confirm=true para confirmar.', '') || e.message, 'Eliminar todo', true);
        if (ok) {
          try {
            await api.groups.remove(id, true);
            navigation.goBack();
            return;
          } catch (e2) { setError(e2.message); }
        }
      } else setError(e.message);
    }
    setBusy(false);
  };

  if (!group) return error ? <View style={{ padding: 20, flex: 1, backgroundColor: colors.bg }}><ErrorBox message={error} /></View> : <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={group.recipes}
        keyExtractor={(r) => r._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <ErrorBox message={error} />
            {group.description ? <Text style={{ color: colors.muted, marginBottom: 12 }}>{group.description}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="+ Agregar receta" small onPress={openPicker} style={{ flex: 1 }} />
              <Button title="Editar" variant="outline" small onPress={() => navigation.navigate('GroupForm', { id })} />
              <Button title="Eliminar" variant="dangerOutline" small onPress={deleteGroup} loading={busy} />
            </View>
            <Text style={{ fontWeight: '800', fontSize: 16, marginTop: 18, color: colors.text }}>
              Recetas ({group.recipes.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { id: item._id })}
            right={<Button title="Quitar del grupo" variant="ghost" small onPress={() => removeRecipe(item)} style={{ alignSelf: 'flex-start', marginTop: 6, paddingLeft: 0 }} />}
          />
        )}
        ListEmptyComponent={<EmptyState title="Este grupo está vacío" subtitle="Agrega recetas con el botón de arriba." />}
      />

      <Modal visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={{ flex: 1, fontSize: 20, fontWeight: '900', color: colors.text }}>Agregar al grupo</Text>
            <TouchableOpacity onPress={() => setPicker(null)}><Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>Listo</Text></TouchableOpacity>
          </View>
          <FlatList
            data={picker || []}
            keyExtractor={(r) => r._id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => addRecipe(item)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ flex: 1, fontWeight: '700', color: colors.text }}>{item.title}</Text>
                <Text style={{ color: colors.primary, fontSize: 22 }}>＋</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState title="No hay más recetas para agregar" subtitle="Todas tus recetas ya están en este grupo (o aún no has creado ninguna)." />}
          />
        </View>
      </Modal>
    </View>
  );
}
