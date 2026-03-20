import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Image, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const INVENTORY_DATA = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    price: '$24.50',
    expiry: '12/2025',
    batch: '#4421',
    status: 'IN STOCK',
    statusColor: '#10b981',
    image: 'https://placehold.co/400x400/e0f2fe/0369a1?text=AMX'
  },
  {
    id: '2',
    name: 'Vitality Vit-C',
    price: '$12.00',
    expiry: '08/2024',
    batch: '#8812',
    status: 'LOW STOCK',
    statusColor: '#f97316',
    image: 'https://placehold.co/400x400/fef3c7/b45309?text=VIT-C'
  },
  {
    id: '3',
    name: 'Insulin Aspart',
    price: '$85.00',
    expiry: '01/2026',
    batch: '#1109',
    status: 'COLD STORAGE',
    statusColor: '#3b82f6',
    image: 'https://placehold.co/400x400/dcfce7/15803d?text=INS'
  },
  {
    id: '4',
    name: 'Ibuprofen 400mg',
    price: '$8.25',
    expiry: '11/2025',
    batch: '#2231',
    status: 'IN STOCK',
    statusColor: '#10b981',
    image: 'https://placehold.co/400x400/f1f5f9/475569?text=IBU'
  }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Items');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
        
        <Text style={styles.productMeta}>Expiry: {item.expiry} • Batch {item.batch}</Text>
        
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Ver Detalle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="pill" size={24} color="#000" />
          </View>
          <Text style={styles.brandTitle}>Farmacia Médica Rincón</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source={{ uri: 'https://placehold.co/100x100/fdf2f8/db2777?text=U' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.sectionLabel}>PHARMACIST CONTROL</Text>
        <Text style={styles.sectionTitle}>Product Inventory</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, category"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.scanButton}>
            <MaterialCommunityIcons name="barcode-scan" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {['All Items', 'Low Stock', 'Expired'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[
                styles.filterTab, 
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addButtonText}>Agregar Producto</Text>
        </TouchableOpacity>

        {/* List */}
        <FlatList
          data={INVENTORY_DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
        />
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#94a3b8" />
          <Text style={styles.navLabel}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="receipt-outline" size={24} color="#000" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>SALES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#94a3b8" />
          <Text style={styles.navLabel}>ALERTS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#94a3b8" />
          <Text style={styles.navLabel}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 56,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  scanButton: {
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeFilterTab: {
    backgroundColor: '#0f172a',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce7f3',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 25,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#0f172a',
  },
  listPadding: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  productMeta: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  detailButtonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 90,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  navItem: {
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: '#fce7f3',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 1,
  },
  activeNavLabel: {
    color: '#000',
  }
});

export default Home;