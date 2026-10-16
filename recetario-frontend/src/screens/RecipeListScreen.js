import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TextInput, ScrollView, RefreshControl, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../api';
import { RecipeCard, EmptyState, Fab, Chip, ErrorBox, Loading, CATEGORIES } from '../ui';
import { colors } from '../theme';

// mode = 'mine' (recetas personales) | 'public' (recetas en general)
export default function RecipeListScreen({ navigation, mode }) {
  const isMine = mode === 'mine';
  const [recipes, setRecipes] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [group, setGroup] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setError('');
      const params = { search: debounced, category };
      if (isMine) {
        params.group = group;
        const [r, g] = await Promise.all([api.recipes.mine(params), api.groups.list()]);
        setRecipes(r);
        setGroups(g);
      } else {
        setRecipes(await api.recipes.all(params));
      }
    } catch (e) {
      setError(e.message);
      setRecipes((prev) => prev || []);
    }
  }, [debounced, category, group, isMine]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (recipes === null) return <Loading />;

  const filtering = debounced || category || group;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="🔍  Buscar por título"
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text,
          }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <Chip label="Todas" selected={!category} onPress={() => setCategory('')} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? '' : c)} />
          ))}
        </ScrollView>
        {isMine && groups.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip label="Todos los grupos" selected={!group} onPress={() => setGroup('')} />
            {groups.map((g) => (
              <Chip key={g._id} label={`📁 ${g.name}`} selected={group === g._id} onPress={() => setGroup(group === g._id ? '' : g._id)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      <ErrorBox message={error} />

      <FlatList
        data={recipes}
        keyExtractor={(r) => r._id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            showOwner={!isMine}
            onPress={() => navigation.navigate('RecipeDetail', { id: item._id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={filtering ? 'Sin resultados' : isMine ? 'Aún no tienes recetas' : 'Todavía no hay recetas públicas'}
            subtitle={
              filtering
                ? 'Prueba con otra búsqueda o filtro.'
                : isMine
                ? 'Toca el botón + para crear tu primera receta.'
                : 'Marca una de tus recetas como pública para que aparezca aquí.'
            }
          />
        }
      />
      {isMine ? <Fab onPress={() => navigation.navigate('RecipeForm')} /> : null}
    </View>
  );
}
