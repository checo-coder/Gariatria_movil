import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TarjetaCita from "../_componentes/TarjetaCita";

const API_URL = "http://192.168.100.38:4000";

export default function PantallaCitas() {
  interface Cita {
    id_cita: number;
    razon: string;
    fecha: string;
    nombre_geriatra: string;
  }
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const obtenerCitas = async () => {
    try {
      // Usamos idDelPaciente que es el que guardaste en el login
      const idCliente = await SecureStore.getItemAsync("idDelPaciente");
      console.log("ID del cliente obtenido del SecureStore:", idCliente);
      if (!idCliente) return;

      const respuesta = await fetch(`${API_URL}/citas/${idCliente}`);
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setCitas(datos);
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    obtenerCitas();
  }, []);

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
          renderItem={({ item }) => <TarjetaCita cita={item} />}
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
                No tienes citas próximas programadas. 🩺
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
  vacioContainer: { marginTop: 100, alignItems: "center" },
  vacioTexto: { fontSize: 16, color: "#636E72", textAlign: "center" },
});
