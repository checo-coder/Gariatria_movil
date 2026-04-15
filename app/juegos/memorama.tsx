import { useRouter } from "expo-router";
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
import MemoramaCard from "../_componentes/MemoramaCard";

const API_URL = "http://192.168.100.38:4000";

interface Carta {
  code: string;
  img: string;
}

export default function JuegoMemorama() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [adivinadas, setAdivindas] = useState<number[]>([]);
  const [error, setError] = useState<number>(0);
  const [cargando, setCargando] = useState(true);

  // --- LÓGICA DE VISTA INICIAL ---
  const [mostrandoTodo, setMostrandoTodo] = useState(true);

  // --- MÉTRICAS (OCULTAS AL USUARIO) ---
  const [puntaje, setPuntaje] = useState<number>(0);
  const [comboActual, setComboActual] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [tiempoInicio] = useState<Date>(new Date());

  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/api/stats/juegos/memoria`)
      .then((response) => response.json())
      .then((data) => {
        setCartas(data.cards);
        setCargando(false);
        // AL TERMINAR DE CARGAR, ESPERAR 3 SEGUNDOS Y VOLTEAR
        setTimeout(() => {
          setMostrandoTodo(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Error cargando cartas:", err);
        setCargando(false);
      });
  }, []);

  const guardarResultadoFinal = async (
    totalAciertos: number,
    totalErrores: number,
    puntajeFinal: number,
  ) => {
    try {
      const idCliente = await SecureStore.getItemAsync("idDelPaciente");
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const tiempoFin = new Date();
      const segundos = Math.floor(
        (tiempoFin.getTime() - tiempoInicio.getTime()) / 1000,
      );

      const body = {
        id_cliente: idCliente,
        id_juego: 1, // REVISA QUE ESTE SEA EL ID EN TU BD
        puntaje: puntajeFinal,
        aciertos: totalAciertos,
        errores: totalErrores,
        tiempo: segundos,
        detalles: { max_combo: maxCombo, finalizo: true },
      };

      const respuesta = await fetch(`${API_URL}/api/stats/juegos/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        console.log("❌ Error del servidor:", errorData);
        throw new Error("Respuesta no exitosa");
      }

      console.log("✅ Resultado guardado silenciosamente");
    } catch (err) {
      console.error("🔴 Error guardando resultado:", err);
    }
  };

  const onClickCarta = (index: number) => {
    // Si estamos en los 3 segundos iniciales, no dejar clickear
    if (mostrandoTodo) return;

    if (
      seleccionadas.length < 2 &&
      !seleccionadas.includes(index) &&
      !adivinadas.includes(index)
    ) {
      setSeleccionadas([...seleccionadas, index]);
    }
  };

  useEffect(() => {
    if (seleccionadas.length === 2) {
      const carta1 = cartas[seleccionadas[0]];
      const carta2 = cartas[seleccionadas[1]];

      if (carta1.code === carta2.code) {
        const nuevasAdivinadas = [...adivinadas, ...seleccionadas];
        setAdivindas(nuevasAdivinadas);

        // Puntuación interna
        const puntosGanados = comboActual > 0 ? 3 : 1;
        const nuevoPuntaje = puntaje + puntosGanados;
        setPuntaje(nuevoPuntaje);
        setComboActual((prev) => prev + 1);
        if (comboActual + 1 > maxCombo) setMaxCombo(comboActual + 1);

        setSeleccionadas([]);

        if (nuevasAdivinadas.length === cartas.length && cartas.length > 0) {
          guardarResultadoFinal(
            nuevasAdivinadas.length / 2,
            error,
            nuevoPuntaje,
          );
          Alert.alert(
            "¡Felicidades!",
            "Has completado el ejercicio de memoria.",
            [{ text: "Continuar", onPress: () => router.back() }],
          );
        }
      } else {
        setError(error + 1);
        setPuntaje((prev) => prev - 1);
        setComboActual(0);
        setTimeout(() => setSeleccionadas([]), 1000);
      }
    }
  }, [seleccionadas]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FF7675" />
        <Text style={styles.textoCarga}>Preparando tu juego...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Memorama</Text>
      <Text style={styles.subtitulo}>
        {mostrandoTodo ? "¡Observa bien las cartas!" : "Encuentra las parejas"}
      </Text>

      <FlatList
        data={cartas}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          // MOSTRAR SI: Es el inicio, está seleccionada o ya se adivinó
          const estaVisible =
            mostrandoTodo ||
            seleccionadas.includes(index) ||
            adivinadas.includes(index);
          return (
            <MemoramaCard
              image={item.img}
              estaVolteada={estaVisible}
              onClick={() => onClickCarta(index)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", paddingTop: 50 },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  textoCarga: { marginTop: 10, fontSize: 16, color: "#636E72" },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2D3436",
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#636E72",
  },
  grid: { alignItems: "center", paddingBottom: 20 },
});
