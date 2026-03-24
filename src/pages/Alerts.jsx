import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NOTIFICATION_DATA = [
  {
    id: '1',
    type: 'VENCIDO',
    name: 'Amoxicilina 500mg',
    batch: 'AMX-2023-09',
    expiryDate: '15 OCT 2023',
    stock: '24 Unidades',
    icon: 'calendar-remove',
    color: '#ef4444'
  },
  {
    id: '2',
    type: 'PROXIMO',
    name: 'Paracetamol Jarabe',
    batch: 'PRT-2024-12',
    expiryDate: '20 DIC 2024',
    stock: '120 Unidades',
    icon: 'clock-outline',
    color: '#f43f5e'
  },
  {
    id: '3',
    type: 'PROXIMO',
    name: 'Insulina Glargina',
    batch: 'INS-2024-05',
    expiryDate: '15 ENE 2025',
    stock: '8 Unidades',
    icon: 'thermometer-alert',
    color: '#f43f5e'
  }
];

const Alerts = () => {
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
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainPadding}>
          <Text style={styles.sectionLabel}>CENTRO DE CONTROL</Text>
          <Text style={styles.sectionTitle}>NOTIFICACIONES</Text>

          {/* Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Medicamentos próximos a vencer</Text>
            <Text style={styles.bannerDesc}>
              Gestione el inventario crítico para garantizar la seguridad del paciente y evitar pérdidas operativas.
            </Text>
          </View>

          {/* List */}
          {NOTIFICATION_DATA.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={[styles.typeText, { color: item.color }]}>
                    {item.type === 'VENCIDO' ? 'PRODUCTO VENCIDO' : 'PROXIMO A VENCER'}
                  </Text>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.batchText}>Lote: {item.batch}</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'VENCIDO' ? '#fee2e2' : '#fce7f3' }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VENCIMIENTO</Text>
                  <Text style={[styles.detailValue, { color: item.color }]}>{item.expiryDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>STOCK</Text>
                  <Text style={styles.detailValue}>{item.stock}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton, { backgroundColor: item.type === 'VENCIDO' ? '#ef4444' : '#fee2e2' }]}>
                  <Text style={[styles.deleteButtonText, { color: item.type === 'VENCIDO' ? '#fff' : '#ef4444' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Shortcut */}
          <TouchableOpacity style={styles.addShortcut}>
            <View style={styles.addCircle}>
              <Ionicons name="add" size={32} color="#000" />
            </View>
            <Text style={styles.addShortcutText}>Agregar Medicamento</Text>
            <Text style={styles.addShortcutSub}>Escanee un nuevo lote para monitorear su vencimiento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="barcode-scan" size={24} color="#000" />
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#94a3b8" />
          <Text style={styles.navLabel}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="receipt-outline" size={24} color="#94a3b8" />
          <Text style={styles.navLabel}>SALES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="notifications" size={24} color="#000" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>ALERTS</Text>
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
    backgroundColor: '#f8fafc',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainPadding: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 25,
  },
  banner: {
    backgroundColor: '#fce7f3',
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  bannerDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  typeBadge: {
    flex: 1,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  batchText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontWeight: '700',
  },
  addShortcut: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addShortcutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addShortcutSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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

export default Alerts;