import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import * as api from '../api';
import ImageField from '../ImageField';
import { Button, Input, Chip, ErrorBox, SectionTitle, Loading, CATEGORIES, DIFFICULTY_LABEL } from '../ui';
import { colors } from '../theme';

const emptyIng = () => ({ name: '', quantity: '', unit: '' });

export default function RecipeFormScreen({ route, navigation }) {
  const editId = route.params?.id;
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [allGroups, setAllGroups] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('facil');
  const [prep, setPrep] = useState('');
  const [cook, setCook] = useState('');
  const [servings, setServings] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [ingredients, setIngredients] = useState([emptyIng()]);
  const [steps, setSteps] = useState(['']);
  const [groupIds, setGroupIds] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar receta' : 'Nueva receta' });
    (async () => {
      try {
        const g = await api.groups.list();
        setAllGroups(g);
        if (editId) {
          const r = await api.recipes.get(editId);
          setTitle(r.title);
          setDescription(r.description || '');
          setCategory(r.category || '');
          setDifficulty(r.difficulty || 'facil');
          setPrep(String(r.prepTimeMinutes || ''));
          setCook(String(r.cookTimeMinutes || ''));
          setServings(String(r.servings || 1));
          setImageUrl(r.imageUrl || '');
          setNotes(r.notes || '');
          setIsPublic(!!r.isPublic);
          setIngredients(
            r.ingredients.length
              ? r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity != null ? String(i.quantity) : '', unit: i.unit || '' }))
              : [emptyIng()]
          );
          setSteps(r.steps.length ? r.steps : ['']);
          setGroupIds((r.groups || []).map((x) => x._id));
        }
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    })();
  }, [editId, navigation]);

  const updateIng = (i, k, v) => setIngredients((arr) => arr.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const updateStep = (i, v) => setSteps((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const toggleGroup = (id) => setGroupIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const num = (s) => {
    const n = parseFloat(String(s).replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };

  const save = async () => {
    setError('');
    setTitleError('');
    const cleanIngs = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim(), quantity: num(i.quantity), unit: i.unit.trim() }));
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) return setTitleError('El título es obligatorio');
    if (!cleanIngs.length) return setError('Agrega al menos un ingrediente');
    if (!cleanSteps.length) return setError('Agrega al menos un paso');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      ingredients: cleanIngs,
      steps: cleanSteps,
      prepTimeMinutes: num(prep) ?? 0,
      cookTimeMinutes: num(cook) ?? 0,
      servings: Math.max(1, Math.round(num(servings) ?? 1)),
      difficulty,
      category: category.trim().toLowerCase(),
      imageUrl: imageUrl.trim(),
      notes: notes.trim(),
      isPublic,
      groups: groupIds,
    };

    setSaving(true);
    try {
      if (editId) await api.recipes.update(editId, payload);
      else await api.recipes.create(payload);
      navigation.goBack();
    } catch (e) {
      if (e.status === 409) setTitleError('Ya tienes una receta con ese título. Usa otro nombre.');
      else setError(e.message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const RowBtn = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 10, paddingVertical: 12 }}>
      <Text style={{ color: colors.danger, fontSize: 18 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <ErrorBox message={error} />
        <Input label="Título *" value={title} onChangeText={(v) => { setTitle(v); setTitleError(''); }} maxLength={120} placeholder="Ej: Arepas de queso" error={titleError} />
        <Input label="Descripción" value={description} onChangeText={setDescription} multiline maxLength={1000} placeholder="Breve descripción" />

        <Text style={{ fontWeight: '600', fontSize: 13, marginBottom: 6, color: colors.text }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
          {CATEGORIES.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? '' : c)} />)}
        </View>
        <Input value={category} onChangeText={setCategory} placeholder="…u otra categoría" autoCapitalize="none" />

        <Text style={{ fontWeight: '600', fontSize: 13, marginBottom: 6, color: colors.text }}>Dificultad</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {Object.entries(DIFFICULTY_LABEL).map(([k, label]) => <Chip key={k} label={label} selected={difficulty === k} onPress={() => setDifficulty(k)} />)}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Prep. (min)" value={prep} onChangeText={setPrep} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Cocción (min)" value={cook} onChangeText={setCook} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Porciones" value={servings} onChangeText={setServings} keyboardType="numeric" /></View>
        </View>

        <ImageField label="Foto de la receta" value={imageUrl} onChange={setImageUrl} aspect={[4, 3]} width={800} />

        <SectionTitle>Ingredientes *</SectionTitle>
        {ingredients.map((ing, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
            <View style={{ flex: 1 }}><Input value={ing.quantity} onChangeText={(v) => updateIng(i, 'quantity', v)} placeholder="Cant." keyboardType="numeric" /></View>
            <View style={{ flex: 1.2 }}><Input value={ing.unit} onChangeText={(v) => updateIng(i, 'unit', v)} placeholder="Unidad" autoCapitalize="none" /></View>
            <View style={{ flex: 2.4 }}><Input value={ing.name} onChangeText={(v) => updateIng(i, 'name', v)} placeholder="Ingrediente" /></View>
            <RowBtn label="✕" onPress={() => setIngredients((a) => (a.length > 1 ? a.filter((_, idx) => idx !== i) : [emptyIng()]))} />
          </View>
        ))}
        <Button title="+ Agregar ingrediente" variant="outline" small onPress={() => setIngredients((a) => [...a, emptyIng()])} style={{ alignSelf: 'flex-start', marginBottom: 12 }} />

        <SectionTitle>Pasos *</SectionTitle>
        {steps.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
            <Text style={{ fontWeight: '800', color: colors.primary, paddingTop: 13, width: 22 }}>{i + 1}.</Text>
            <View style={{ flex: 1 }}><Input value={s} onChangeText={(v) => updateStep(i, v)} multiline placeholder={`Paso ${i + 1}`} style={{ minHeight: 56 }} /></View>
            <RowBtn label="✕" onPress={() => setSteps((a) => (a.length > 1 ? a.filter((_, idx) => idx !== i) : ['']))} />
          </View>
        ))}
        <Button title="+ Agregar paso" variant="outline" small onPress={() => setSteps((a) => [...a, ''])} style={{ alignSelf: 'flex-start', marginBottom: 12 }} />

        <Input label="Notas" value={notes} onChangeText={setNotes} multiline maxLength={1000} placeholder="Trucos, variantes, sustituciones…" />

        <SectionTitle>Grupos</SectionTitle>
        {allGroups.length === 0 ? (
          <Text style={{ color: colors.muted, marginBottom: 12 }}>Aún no tienes grupos. Créalos en la pestaña “Grupos”.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {allGroups.map((g) => <Chip key={g._id} label={`📁 ${g.name}`} selected={groupIds.includes(g._id)} onPress={() => toggleGroup(g._id)} />)}
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>Receta pública</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Aparecerá en “Generales” para todos los usuarios</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.primary }} />
        </View>

        <Button title={editId ? 'Guardar cambios' : 'Crear receta'} onPress={save} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}