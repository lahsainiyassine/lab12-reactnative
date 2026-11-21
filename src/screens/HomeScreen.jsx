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
      const res = await apiClient.get('/products?limit=15');
      setProducts(res.data);
    } catch (err) {
      console.error('Erreur chargement:', err.message);
      Alert.alert('Erreur', 'Impossible de charger les produits : ' + err.message);
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
        await apiClient.put(`/products/${selectedProduct.id}`, data);
        setProducts(
          products.map((p) => (p.id === selectedProduct.id ? { ...p, ...data } : p))
        );
        setSelectedProduct(null);
      } else {
        // CREATE (POST)
        const res = await apiClient.post('/products', {
          ...data,
          description: 'Description du produit',
          category: 'electronics',
          image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        });
        const newProduct = {
          id: res.data?.id || Date.now(),
          ...data,
        };
        setProducts([newProduct, ...products]);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit : ' + err.message);
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
            Alert.alert('Erreur', 'Impossible de supprimer le produit : ' + err.message);
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
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', paddingTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
});
