import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../api';
import { EmptyState, Fab, ErrorBox, Loading } from '../ui';
import { colors } from '../theme';

export default function GroupsScreen({ navigation }) {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setGroups(await api.groups.list());
    } catch (e) {
      setError(e.message);
      setGroups((p) => p || []);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (groups === null) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}><ErrorBox message={error} /></View>
      <FlatList
        data={groups}
        keyExtractor={(g) => g._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('GroupDetail', { id: item._id })}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ fontSize: 28, marginRight: 14 }}>📁</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{item.name}</Text>
              {item.description ? <Text style={{ color: colors.muted, marginTop: 2 }} numberOfLines={1}>{item.description}</Text> : null}
            </View>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{item.recipeCount} {item.recipeCount === 1 ? 'receta' : 'recetas'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState title="Aún no tienes grupos" subtitle="Crea grupos (ej: “Cenas rápidas”) para organizar tus recetas. Una receta puede estar en varios grupos." />}
      />
      <Fab onPress={() => navigation.navigate('GroupForm')} />
    </View>
  );
}
