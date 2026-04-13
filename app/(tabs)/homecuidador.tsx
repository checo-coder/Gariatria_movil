import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { LongPressEvent } from "react-native-maps";
import { io } from "socket.io-client";

// Importación de componentes
import BarraControl from "../_componentes/BarraControl";
import MapaVisual from "../_componentes/MapaVisual";

const API_URL = "http://192.168.100.38:4000";
const socket = io(API_URL);

export default function PantallaMapa() {
  const [idPaciente, setIdPaciente] = useState<string | null>(null);
  const [ubicacionPaciente, setUbicacionPaciente] = useState<any>(null);
  const [conectado, setConectado] = useState(false);

  const [zonaGuardada, setZonaGuardada] = useState<any>(null);
  const [zonaBorrador, setZonaBorrador] = useState<any>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      const id = await SecureStore.getItemAsync("idDelPaciente");
      setIdPaciente(id);
      if (id) cargarZonaSegura(id);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") console.warn("GPS denegado");
    };
    inicializar();
  }, []);

  useEffect(() => {
    if (!idPaciente) return;
    socket.emit("unirse-rastreo", idPaciente);
    socket.on("ubicacion-actualizada", (datos) => {
      setUbicacionPaciente({
        latitude: datos.latitud,
        longitude: datos.longitud,
      });
      setConectado(true);
    });
    return () => {
      socket.off("ubicacion-actualizada");
    };
  }, [idPaciente]);

  const cargarZonaSegura = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/paciente/zona-segura/${id}`);
      if (res.ok) {
        const data = await res.json();
        setZonaGuardada(data);
      }
    } catch (e) {
      console.log("Sin zona en BD");
    }
  };

  const iniciarEdicion = () => {
    if (zonaGuardada) {
      setZonaBorrador({ ...zonaGuardada });
    } else if (ubicacionPaciente) {
      setZonaBorrador({ ...ubicacionPaciente, radius: 200 });
    }
    setModoEdicion(true);
  };

  const manejarPresionLarga = (e: LongPressEvent | any) => {
    if (!modoEdicion) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setZonaBorrador((prev: any) => ({
      ...prev,
      latitude,
      longitude,
      radius: prev?.radius || 200,
    }));
  };

  const ajustarRadio = (cantidad: number) => {
    setZonaBorrador((prev: any) => ({
      ...prev,
      radius: Math.max(50, (prev?.radius || 200) + cantidad),
    }));
  };

  const guardarZonaEnBD = async () => {
    if (!idPaciente || !zonaBorrador) return;
    setProcesando(true);
    try {
      const res = await fetch(`${API_URL}/paciente/configurar-zona`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: idPaciente,
          lat: zonaBorrador.latitude,
          lon: zonaBorrador.longitude,
          radio: zonaBorrador.radius,
        }),
      });
      if (res.ok) {
        setZonaGuardada(zonaBorrador);
        setModoEdicion(false);
        Alert.alert("Éxito", "Zona guardada.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setProcesando(false);
    }
  };

  const eliminarZonaEnBD = async () => {
    Alert.alert("Eliminar", "¿Quitar protección?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!idPaciente) return;
          setProcesando(true);
          try {
            const res = await fetch(
              `${API_URL}/paciente/zona-segura/${idPaciente}`,
              { method: "DELETE" },
            );
            if (res.ok) {
              setZonaGuardada(null);
              setZonaBorrador(null);
              setModoEdicion(false);
            }
          } catch (e) {
            Alert.alert("Error", "No se eliminó.");
          } finally {
            setProcesando(false);
          }
        },
      },
    ]);
  };

  if (!ubicacionPaciente)
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.textoCarga}>Localizando...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <MapaVisual
        ubicacionPaciente={ubicacionPaciente}
        zonaAMostrar={modoEdicion ? zonaBorrador : zonaGuardada}
        modoEdicion={modoEdicion}
        manejarPresionLarga={manejarPresionLarga}
      />
      <BarraControl
        modoEdicion={modoEdicion}
        zonaGuardada={zonaGuardada}
        zonaBorrador={zonaBorrador}
        procesando={procesando}
        onIniciar={iniciarEdicion}
        onEliminar={eliminarZonaEnBD}
        onCancelar={() => setModoEdicion(false)}
        onGuardar={guardarZonaEnBD}
        onAjustarRadio={ajustarRadio}
      />
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: conectado ? "#2ecc71" : "#e74c3c" },
        ]}
      >
        <Text style={styles.statusTexto}>
          {conectado ? "En vivo" : "Buscando..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  textoCarga: { marginTop: 15, fontWeight: "bold" },
  statusBadge: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 20,
  },
  statusTexto: { color: "white", fontWeight: "bold", fontSize: 12 },
});
