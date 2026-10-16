import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../api';
import { useAuth } from '../AuthContext';
import { Button, Chip, Loading, ErrorBox, SectionTitle, confirmAsync, DIFFICULTY_LABEL } from '../ui';
import { colors } from '../theme';

export default function RecipeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api.recipes.get(id)
        .then((r) => { if (active) { setRecipe(r); navigation.setOptions({ title: r.title }); } })
        .catch((e) => active && setError(e.message));
      return () => { active = false; };
    }, [id, navigation])
  );

  if (error && !recipe) {
    return <View style={{ padding: 20, flex: 1, backgroundColor: colors.bg }}><ErrorBox message={error} /></View>;
  }
  if (!recipe) return <Loading />;

  const isOwner = String(recipe.owner?._id) === String(user._id);
  const total = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const remove = async () => {
    const ok = await confirmAsync('Eliminar receta', `¿Seguro que quieres eliminar "${recipe.title}"? Esta acción no se puede deshacer.`, 'Eliminar', true);
    if (!ok) return;
    setDeleting(true);
    try {
      await api.recipes.remove(recipe._id);
      navigation.goBack();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  const Stat = ({ label, value }) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={{ width: '100%', height: 220 }} /> : null}
      <View style={{ padding: 18 }}>
        <ErrorBox message={error} />
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text }}>{recipe.title}</Text>
        <Text style={{ color: colors.primary, marginTop: 4, fontWeight: '600' }}>
          {isOwner ? (recipe.isPublic ? 'Receta pública' : 'Receta privada') : `Por ${recipe.owner?.name}`}
          {recipe.category ? `  ·  ${recipe.category}` : ''}
        </Text>
        {recipe.description ? <Text style={{ color: colors.text, marginTop: 10, lineHeight: 21 }}>{recipe.description}</Text> : null}

        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, marginTop: 16, borderWidth: 1, borderColor: colors.border }}>
          <Stat label="Preparación" value={`${recipe.prepTimeMinutes || 0} min`} />
          <Stat label="Cocción" value={`${recipe.cookTimeMinutes || 0} min`} />
          <Stat label="Porciones" value={recipe.servings} />
          <Stat label="Dificultad" value={DIFFICULTY_LABEL[recipe.difficulty]} />
        </View>
        {total ? <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6, fontSize: 12 }}>Tiempo total: {total} min</Text> : null}

        {recipe.groups?.length ? (
          <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap' }}>
            {recipe.groups.map((g) => <Chip key={g._id} label={`📁 ${g.name}`} />)}
          </View>
        ) : null}

        <SectionTitle style={{ marginTop: 18 }}>Ingredientes</SectionTitle>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ width: 90, fontWeight: '700', color: colors.primary }}>
              {[ing.quantity, ing.unit].filter((x) => x !== undefined && x !== null && x !== '').join(' ')}
            </Text>
            <Text style={{ flex: 1, color: colors.text }}>{ing.name}</Text>
          </View>
        ))}

        <SectionTitle style={{ marginTop: 20 }}>Preparación</SectionTitle>
        {recipe.steps.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, lineHeight: 21, color: colors.text }}>{s}</Text>
          </View>
        ))}

        {recipe.notes ? (
          <>
            <SectionTitle style={{ marginTop: 12 }}>Notas</SectionTitle>
            <Text style={{ color: colors.text, lineHeight: 21 }}>{recipe.notes}</Text>
          </>
        ) : null}

        {isOwner ? (
          <View style={{ marginTop: 28, gap: 10 }}>
            <Button title="Editar receta" onPress={() => navigation.navigate('RecipeForm', { id: recipe._id })} />
            <Button title="Eliminar receta" variant="dangerOutline" onPress={remove} loading={deleting} />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
