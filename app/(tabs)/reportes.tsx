import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface Reporte {
  id_reporte: number;
  titulo: string;
  url_pdf: string;
  fecha_creacion: string;
}
const API_URL = "https://backendoldfit-production.up.railway.app";

export default function HistorialReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    const idPaciente = await SecureStore.getItemAsync("idDelPaciente");
    const token = await SecureStore.getItemAsync("mi_token_jwt");

    const res = await fetch(
      `${API_URL}/api/movil/reportes/historial/${idPaciente}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("🔗 Pidiendo historial a:", res);
    const datos = await res.json();
    console.log("📄 Respuesta bruta del servidor:", datos);
    setReportes(datos);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Reportes</Text>
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id_reporte.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemReporte}
            onPress={() => Linking.openURL(item.url_pdf)}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={30}
              color="#3498db"
            />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.itemTitulo}>{item.titulo}</Text>
              <Text style={styles.itemFecha}>
                Emitido el: {new Date(item.fecha_creacion).toLocaleDateString()}
              </Text>
            </View>
            <MaterialCommunityIcons name="download" size={24} color="#bdc3c7" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  itemReporte: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  itemTitulo: { fontSize: 16, fontWeight: "bold", color: "#34495e" },
  itemFecha: { fontSize: 13, color: "#7f8c8d" },
});
