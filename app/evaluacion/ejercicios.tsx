import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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
import { DATOS_EJERCICIOS } from "../../_utils/ejercicios";

const API_URL = "http://192.168.100.38:4000";

export default function PantallaEjercicio() {
  const { tipo } = useLocalSearchParams();
  const router = useRouter();
  const config = DATOS_EJERCICIOS[tipo as string];

  const [paso, setPaso] = useState("instrucciones");
  const [resultado, setResultado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const guardarResultado = async () => {
    try {
      const idCliente = await SecureStore.getItemAsync("idDelPaciente");
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const respuesta = await fetch(`${API_URL}/api/stats/evaluacion-fisica`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_cliente: idCliente,
          nombre_ejercicio: config.nombre,
          metrica: `${resultado} ${config.unidad}`,
          observaciones: `${observaciones}`,
        }),
      });

      if (respuesta.ok) {
        Alert.alert("🎉 ¡Muy bien!", "Tu progreso ha sido guardado con éxito.");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la evaluación.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{config.nombre}</Text>

        {paso === "instrucciones" ? (
          <>
            <Image source={config.animacion} style={styles.gif} />
            <Text style={styles.instruccion}>{config.instruccion}</Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => setPaso("registro")}
            >
              <Text style={styles.textoBoton}>Entendido, ¡Empezar!</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instruccion}>¿Cuál fue tu resultado?</Text>
            <Text style={styles.sub}>{config.unidad}:</Text>
            <TextInput
              style={styles.input}
              placeholder={config.placeholder}
              keyboardType="numeric"
              value={resultado}
              onChangeText={setResultado}
              autoFocus
            />

            <Text style={styles.instruccion}>Observaciones:</Text>
            <TextInput
              style={styles.input}
              placeholder="me canse"
              value={observaciones}
              onChangeText={setObservaciones}
              autoFocus
            />
            <TouchableOpacity
              style={styles.botonVerde}
              onPress={guardarResultado}
            >
              <Text style={styles.textoBoton}>Guardar Progreso</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 20,
  },
  gif: { width: 250, height: 400, borderRadius: 15, marginBottom: 20 },
  instruccion: {
    fontSize: 18,
    textAlign: "center",
    color: "#636E72",
    lineHeight: 26,
    marginBottom: 30,
  },
  boton: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  botonVerde: {
    backgroundColor: "#71c3f6ff",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  textoBoton: { color: "white", fontWeight: "bold", fontSize: 18 },
  sub: { alignSelf: "flex-start", color: "#B2BEC3", marginBottom: 5 },
  input: {
    borderBottomWidth: 3,
    borderBottomColor: "#3498db",
    width: "100%",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 40,
    color: "#2D3436",
  },
});
