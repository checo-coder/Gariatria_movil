import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { io } from "socket.io-client";

// 1. Definimos la interfaz para la ubicación
interface Ubicacion {
  latitude: number;
  longitude: number;
}

// 2. Conexión al socket (Asegúrate de usar tu IP)
const socket = io("http://192.168.100.38:4000");

export default function PantallaMapa() {
  // 3. Obtenemos el idPaciente de los parámetros de la ruta
  const { idPaciente } = useLocalSearchParams<{ idPaciente: string }>();

  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!idPaciente) return;

    // Unirse a la sala específica de este paciente
    socket.emit("unirse-rastreo", idPaciente);

    // Escuchar actualizaciones
    socket.on(
      "ubicacion-actualizada",
      (datos: { latitud: number; longitud: number }) => {
        setUbicacion({
          latitude: datos.latitud,
          longitude: datos.longitud,
        });
        setConectado(true);
      },
    );

    // Limpieza al salir
    return () => {
      socket.off("ubicacion-actualizada");
    };
  }, [idPaciente]);

  if (!ubicacion) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.textoCarga}>
          Esperando señal GPS del paciente...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        region={{
          ...ubicacion,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={ubicacion}
          title="Paciente"
          description="Ubicación en tiempo real"
        />
      </MapView>

      <View style={styles.banner}>
        <View
          style={[
            styles.punto,
            { backgroundColor: conectado ? "#2ecc71" : "#e74c3c" },
          ]}
        />
        <Text style={styles.textoBanner}>
          {conectado ? "En vivo" : "Buscando señal..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapa: { flex: 1 },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  textoCarga: { marginTop: 10, color: "#7f8c8d" },
  banner: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  punto: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  textoBanner: { fontWeight: "bold", fontSize: 14, color: "#2c3e50" },
});
