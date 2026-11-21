# Lab 12 : Développement d'une application CRUD avec une API REST et React Native

- **URL de la plateforme** : https://mliaedu.toubkalit.com/student/courses/38/labs/550
- **Formation** : React Native

---

## 1. Objectifs
- Développer une application mobile complète effectuant les 4 opérations **CRUD** (Create, Read, Update, Delete) avec une API REST.
- Centraliser et configurer les requêtes HTTP avec `axios` (instance `client.js`).
- Gérer les formulaires de saisie et la validation des données avec `TextInput`.
- Afficher les données avec `FlatList` et le support du rafraîchissement (Pull-to-Refresh).
- Implémenter les confirmations de suppression avec `Alert.alert`.
- Gérer les états de chargement (`ActivityIndicator`) et les erreurs réseau.

---

## 2. Dépendances requises
```bash
npm install axios
```

---

## 3. Structure des fichiers
```text
tp12/
  src/
    api/
      client.js
    components/
      ProductItem.jsx
      ProductForm.jsx
    screens/
      HomeScreen.jsx
  App.js
  package.json
```

---

## 4. Configuration Axios : `src/api/client.js`
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.escuelajs.co/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

---

## 5. Composant ProductItem : `src/components/ProductItem.jsx`
```jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProductItem({ product, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{product.price} €</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(product)} style={styles.editBtn}>
          <Text style={styles.btnText}>Éditer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(product.id)} style={styles.deleteBtn}>
          <Text style={styles.btnText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  price: { color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { backgroundColor: '#f0ad4e', padding: 8, borderRadius: 5, marginRight: 5 },
  deleteBtn: { backgroundColor: '#d9534f', padding: 8, borderRadius: 5 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
```

---

## 6. Composant ProductForm : `src/components/ProductForm.jsx`
```jsx
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
```

---

## 7. Écran HomeScreen : `src/screens/HomeScreen.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import apiClient from '../api/client';
import ProductItem from '../components/ProductItem';
import ProductForm from '../components/ProductForm';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data.slice(0, 15));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedProduct) {
        // UPDATE (PUT)
        const res = await apiClient.put(`/products/${selectedProduct.id}`, data);
        setProducts(products.map((p) => (p.id === selectedProduct.id ? res.data : p)));
        setSelectedProduct(null);
      } else {
        // CREATE (POST)
        const res = await apiClient.post('/products', {
          ...data,
          description: 'Description par défaut',
          categoryId: 1,
          images: ['https://placehold.co/600x400'],
        });
        setProducts([res.data, ...products]);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit.');
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/products/${id}`);
            setProducts(products.filter((p) => p.id !== id));
          } catch (err) {
            Alert.alert('Erreur', 'Impossible de supprimer le produit.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion de Produits (CRUD REST)</Text>
      <ProductForm onSubmit={handleFormSubmit} initialData={selectedProduct} />

      {loading ? (
        <ActivityIndicator size="large" color="#EE9972" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <ProductItem
              product={item}
              onEdit={setSelectedProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
});
```

---

## 8. Intégration dans App.js
**Fichier : `App.js`**
```javascript
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
```
