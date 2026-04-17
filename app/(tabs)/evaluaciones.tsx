import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TarjetaEjercicio from "../_componentes/TarjetaEjercicio"; // <--- Importamos el nuevo componente

const API_URL = "https://backendoldfit-production.up.railway.app";

const EJERCICIOS_BASE = [
  {
    id: "1",
    titulo: "Fuerza de Piernas",
    sub: "Levantarse de la silla",
    icono: "body-outline",
    color: "#FF7675",
  },
  {
    id: "2",
    titulo: "Flexibilidad",
    sub: "Tocar las puntas",
    icono: "accessibility-outline",
    color: "#55E6C1",
  },
  {
    id: "3",
    titulo: "Caminata",
    sub: "Marcha en el sitio",
    icono: "walk-outline",
    color: "#54A0FF",
  },
  {
    id: "4",
    titulo: "Fuerza de Brazos",
    sub: "Flexión de codo",
    icono: "barbell-outline",
    color: "#F7B731",
  },
];

export default function MenuEvaluacion() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [fechas, setFechas] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isFocused) cargarUltimasFechas();
  }, [isFocused]);

  const cargarUltimasFechas = async () => {
    try {
      const idCliente = await SecureStore.getItemAsync("idDelPaciente");
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const respuesta = await fetch(
        `${API_URL}/api/movil/stats/evaluaciones/ultimo/${idCliente}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (respuesta.ok) {
        const datos = await respuesta.json();
        const mapaFechas: Record<string, string> = {};
        datos.forEach((item: any) => {
          mapaFechas[item.nombre_ejercicio] = item.ultima_fecha;
        });
        setFechas(mapaFechas);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tituloHeader}>Evaluación Física</Text>
      <Text style={styles.subHeader}>
        Tu progreso es importante. ¡Sigue así!
      </Text>

      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={EJERCICIOS_BASE}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TarjetaEjercicio
              titulo={item.titulo}
              sub={item.sub}
              icono={item.icono}
              color={item.color}
              ultimaFecha={fechas[item.titulo]} // Le pasamos la fecha si existe
              onPress={() =>
                router.push({
                  pathname: "/evaluacion/ejercicios" as any,
                  params: { tipo: item.id },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  tituloHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3436",
    marginTop: 20,
  },
  subHeader: { fontSize: 16, color: "#636E72", marginBottom: 25 },
});
