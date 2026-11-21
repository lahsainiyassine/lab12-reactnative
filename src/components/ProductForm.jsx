import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

export default function ProductForm({ onSubmit, initialData }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setPrice(initialData.price.toString());
    } else {
      setTitle('');
      setPrice('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setErrorMessage('Le titre est obligatoire.');
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Veuillez entrer un prix valide.');
      return;
    }
    setErrorMessage('');
    onSubmit({ title, price: numericPrice });
    setTitle('');
    setPrice('');
  };

  return (
    <View style={styles.form}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        placeholder="Titre du produit"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Prix (€)"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <Button
        title={initialData ? 'Modifier le produit' : 'Ajouter le produit'}
        onPress={handleSubmit}
        color="#EE9972"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  error: { color: 'red', marginBottom: 8 },
});
