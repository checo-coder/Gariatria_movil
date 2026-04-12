import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
// Reutilizamos nuestra tarjeta mágica
import TarjetaMedicina from "../_componentes/TarjetaMedicina";

// ⚠️ Asegúrate de poner tu IP correcta
const API_URL = "http://192.168.100.38:4000";

export default function PantallaInicio() {
  const [proximas, setProximas] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  // Esta función descarga AMBAS listas al mismo tiempo
  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const idPaciente = await SecureStore.getItemAsync("idDelPaciente");

      if (!token || !idPaciente) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Disparamos las dos peticiones a Node simultáneamente para que sea más rápido
      const [resProximas, resHistorial] = await Promise.all([
        fetch(`${API_URL}/tomas/proximas/${idPaciente}`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_URL}/historial/${idPaciente}`, { method: "GET", headers }),
      ]);

      if (resProximas.ok && resHistorial.ok) {
        const datosProximas = await resProximas.json();
        const datosHistorial = await resHistorial.json();

        setProximas(datosProximas);
        // Cortamos el historial a solo las 3 o 4 más recientes para no hacer esta pantalla infinita
        setRecientes(datosHistorial.slice(0, 4));
      }
    } catch (error) {
      console.error("Error al cargar el panel de inicio:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          {/* PRIMERA SECCIÓN: PRÓXIMAS A TOMAR */}
          <Text style={styles.tituloSeccion}>Próximas tomas:</Text>
          <View style={styles.seccionContainer}>
            {proximas.length > 0 ? (
              proximas.map((item) => (
                <TarjetaMedicina
                  key={item.id_toma.toString()}
                  item={item}
                  onActualizar={cargarDashboard}
                />
              ))
            ) : (
              <Text style={styles.textoVacio}>
                No tienes medicinas pendientes por ahora. 🎉
              </Text>
            )}
          </View>

          {/* SEGUNDA SECCIÓN: TOMADAS RECIENTEMENTE */}
          <Text style={[styles.tituloSeccion, { marginTop: 10 }]}>
            Tomadas recientemente:
          </Text>
          <View style={styles.seccionContainer}>
            {recientes.length > 0 ? (
              recientes.map((item) => (
                <TarjetaMedicina
                  key={item.id_toma.toString()}
                  item={item}
                  // No ocupamos recargar al darle clic aquí porque ya están tomadas
                  onActualizar={() => {}}
                />
              ))
            ) : (
              <Text style={styles.textoVacio}>
                Aún no has registrado tomas hoy. 🕰️
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  headerBienvenida: {
    backgroundColor: "#3498db",
    padding: 25,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  textoHola: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  textoSub: {
    fontSize: 16,
    color: "#E1F0FA",
    marginTop: 5,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seccionContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  textoVacio: {
    fontSize: 16,
    textAlign: "center",
    color: "#636E72",
    marginBottom: 20,
    paddingHorizontal: 20,
    fontStyle: "italic",
  },
});
