import { Ionicons } from "@expo/vector-icons"; // Para el ícono del ojo
import { router } from "expo-router"; //Esto es para rutas asa y alexis si ven esto no usen React Navigation yo estoy utilizando expo route es mejor
import * as SecureStore from "expo-secure-store"; // <-- Importamos la librería para el token
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Inicio({}) {
  // 1. ESTADOS
  const [correo, setCorreo] = useState(""); // Cambiado de "nombre" a "correo"
  const [contraseña, setContraseña] = useState(""); //constraseña
  const [verPassword, setVerPassword] = useState(false);

  // 2. LÓGICA DE LOGIN Y JWT
  const iniciarSesion = async () => {
    // Validamos que no estén vacíos
    if (!correo || !contraseña) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      // ⚠️ CAMBIA ESTO: Pon la IP local de tu computadora en lugar de 192.168.1.X
      const urlDelServidor = "http://192.168.100.38:4000/login";

      const respuesta = await fetch(urlDelServidor, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviamos los datos al backend de Node.js
        body: JSON.stringify({ correo: correo, contrasena: contraseña }),
      });

      const datos = await respuesta.json();

      // Si el servidor responde con un status 200 (OK)
      if (respuesta.ok) {
        await SecureStore.setItemAsync("mi_token_jwt", datos.token);

        Alert.alert("Éxito", "Sesión iniciada correctamente");

        router.replace("/(tabs)");
      } else {
        // Si la contraseña o correo están mal, mostramos el error del backend
        Alert.alert("Error", datos.mensaje || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <Text style={styles.header}>OldFit</Text>
      <Text style={styles.subHeader}>Inicio de sesion</Text>
      <Image
        source={require("../assets/images/iconor.png")}
        style={styles.img}
      />

      {/* ENTRADAS DE TEXTO */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo"
          value={correo} // Actualizado
          onChangeText={setCorreo} // Actualizado
          keyboardType="email-address" // Muestra el teclado con el "@"
          autoCapitalize="none" // Evita que la primera letra se ponga mayúscula
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

      {/* BOTÓN */}
      <TouchableOpacity style={styles.button} onPress={iniciarSesion}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  img: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    alignSelf: "center",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#d0eafdff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#34495e",
  },
  input: {
    backgroundColor: "#ffffffff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 15,
  },
  inputPassword: {
    flex: 1, // El input toma todo el espacio disponible
    padding: 15,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
});
