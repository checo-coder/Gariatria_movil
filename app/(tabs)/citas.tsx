import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TarjetaCita from "../_componentes/TarjetaCita";

const API_URL = "http://192.168.100.38:4000"; // Cambiar por tu URL de Railway cuando subas

export default function PantallaCitas() {
  interface Cita {
    id_cita: number;
    razon: string;
    fecha: string;
    nombre_geriatra: string;
  }

  const [citas, setCitas] = useState<Cita[]>([]);
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    const cargarInfoBase = async () => {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (token) {
        const decoded: any = jwtDecode(token);
        setRol(decoded.rol?.toLowerCase());
      }
      obtenerCitas();
    };
    cargarInfoBase();
  }, []);

  const obtenerCitas = async () => {
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      // Intentamos con id_paciente_asignado (modular) o idDelPaciente (antiguo)
      const idCliente =
        (await SecureStore.getItemAsync("id_paciente_asignado")) ||
        (await SecureStore.getItemAsync("idDelPaciente"));

      if (!idCliente) {
        setCargando(false);
        return;
      }

      const respuesta = await fetch(`${API_URL}/api/citas/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setCitas(datos);
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const handleCancelarCita = async (idCita: number) => {
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const respuesta = await fetch(`${API_URL}/api/citas/${idCita}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (respuesta.ok) {
        // Quitamos la cita de la lista visualmente
        setCitas((prev) => prev.filter((c) => c.id_cita !== idCita));
        Alert.alert("Éxito", "La cita ha sido cancelada.");
      } else {
        const err = await respuesta.json();
        Alert.alert("Error", err.mensaje || "No se pudo cancelar.");
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
      Alert.alert("Error", "Problema de conexión con el servidor.");
    }
  };

  return (
    <View style={styles.container}>
      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => item.id_cita.toString()}
          renderItem={({ item }) => (
            <TarjetaCita
              cita={item}
              rol={rol}
              onCancelar={handleCancelarCita}
            />
          )}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => {
                setRefrescando(true);
                obtenerCitas();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacioContainer}>
              <Text style={styles.vacioTexto}>
                No hay citas programadas próximamente. 🩺
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  lista: { padding: 20 },
  vacioContainer: {
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  vacioTexto: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    lineHeight: 24,
  },
});
