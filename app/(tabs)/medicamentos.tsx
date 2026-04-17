import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
// IMPORTAMOS EL COMPONENTE (Asegúrate de que la ruta sea correcta según tus carpetas)
import TarjetaMedicina from "../_componentes/TarjetaMedicina";

const API_URL = "https://backendoldfit-production.up.railway.app";

export default function PantallaMedicamentos() {
  const [tomas, setTomas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const idPaciente = await SecureStore.getItemAsync("idDelPaciente");

      if (!token || !idPaciente) {
        Alert.alert("Error de Sesión", "No se encontró el ID del paciente.");
        setCargando(false);
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/api/movil/meds/tomas/${idPaciente}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setTomas(datos);
      } else {
        Alert.alert(
          "Error del Servidor",
          datos.mensaje || "No se pudieron cargar las medicinas",
        );
      }
    } catch (error) {
      console.error("Error de red:", error);
      Alert.alert(
        "Error de conexión",
        "Revisa tu internet e intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#00CEC9"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={tomas}
          keyExtractor={(item) => item.id_toma.toString()}
          // AQUI USAMOS EL COMPONENTE IMPORTADO
          renderItem={({ item }) => (
            <TarjetaMedicina item={item} onActualizar={cargarMedicamentos} />
          )}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            <Text style={styles.textoVacio}>
              ¡Todo listo! No tienes medicamentos pendientes para las próximas
              24 horas. Recuerda seguir las indicaciones de tu médico y mantener
              tu salud al día.
            </Text>
          }
        />
      )}
    </View>
  );
}

// Aquí solo quedan los estilos del contenedor general
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  listaContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  textoVacio: {
    fontSize: 18,
    textAlign: "center",
    color: "#636E72",
    marginTop: 50,
    paddingHorizontal: 20,
  },
});
