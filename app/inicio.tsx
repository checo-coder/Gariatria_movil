import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// 🚀 Importamos SafeAreaView para manejar los bordes de la pantalla
import { SafeAreaView } from "react-native-safe-area-context";

export default function Inicio() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [verPassword, setVerPassword] = useState(false);

  const iniciarSesion = async () => {
    if (!correo || !contraseña) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      const urlDelServidor =
        "https://backendoldfit-production.up.railway.app/api/movil/auth/login";
      const respuesta = await fetch(urlDelServidor, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo, contrasena: contraseña }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        await SecureStore.setItemAsync("mi_token_jwt", datos.token);
        // Guardamos el ID asegurándonos que sea string
        if (datos.id_paciente_asignado) {
          await SecureStore.setItemAsync(
            "idDelPaciente",
            datos.id_paciente_asignado.toString(),
          );
        }
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", datos.mensaje || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  return (
    // 1. SafeAreaView para proteger el notch y la parte superior
    <SafeAreaView style={styles.safeArea}>
      {/* 2. KeyboardAvoidingView para empujar el contenido hacia arriba */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* 3. ScrollView con contentContainerStyle para centrar el contenido */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>OldFit</Text>
          <Text style={styles.subHeader}>Inicio de sesión</Text>

          <Image
            source={require("../assets/images/iconor.png")}
            style={styles.img}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry={!verPassword}
                value={contraseña}
                onChangeText={setContraseña}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setVerPassword(!verPassword)}
              >
                <Ionicons
                  name={verPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={iniciarSesion}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#d0eafd", // Color de fondo del contenedor principal
  },
  scrollContent: {
    flexGrow: 1, // 🚀 Importante para que el contenido se pueda centrar si es pequeño
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40, // Espacio extra al final para que no pegue al borde
  },
  img: {
    width: 250, // 👈 Reducido un poco para que quepa mejor con teclado abierto
    height: 250,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 20,
  },
  subHeader: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#34495e",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 15,
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
