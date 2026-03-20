import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>BIENVENIDO</Text>
            <Text style={styles.mainTitle}>Registrar nuevo usuario</Text>
          </View>

          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ej. Ana"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Apellidos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ej. García"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Correo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput 
                style={styles.input}
                placeholder="ana@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput}
                  placeholder="........"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Verificar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verificar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput}
                  placeholder="........"
                  secureTextEntry={!showVerifyPassword}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowVerifyPassword(!showVerifyPassword)}>
                  <Ionicons 
                    name={showVerifyPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Fecha de Nacimiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <View style={styles.iconInputContainer}>
                <TextInput 
                  style={styles.iconInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#94a3b8"
                />
                <Ionicons name="calendar-outline" size={22} color="#64748b" />
              </View>
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+52</Text>
                </View>
                <TextInput 
                  style={styles.phoneInput}
                  placeholder="0000000000"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Responsable / Grado */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsable / Grado</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>Seleccionar cargo</Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Botón Guardar */}
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="save-outline" size={20} color="#000" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.line} />
            </View>

            {/* Iniciar Sesión */}
            <Text style={styles.footerText}>¿Ya cuentas con una cuenta?</Text>
            <TouchableOpacity style={styles.loginButton}>
              <Ionicons name="log-in-outline" size={22} color="#fff" style={styles.loginIcon} />
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <Text style={styles.legalText}>
              Al registrarte, aceptas nuestros términos de servicio y políticas de privacidad para el manejo de datos clínicos.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#0f172a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  iconInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  phoneContainer: {
    flexDirection: 'row',
  },
  countryCode: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    width: 60,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#0f172a',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  dropdownText: {
    fontSize: 16,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#fce7f3',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#0f172a',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 30,
  }
});

export default Registration;