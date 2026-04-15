import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const API_URL = "http://192.168.100.38:4000";
const OPERACIONES = ["+", "-", "x", "÷"];
const TOTAL_RONDAS = 10;

interface Pregunta {
  num1: number;
  num2: number;
  operacion: string;
  respuestaCorrecta: number;
  opciones: number[];
}

export default function JuegoAritmetica() {
  const router = useRouter();
  const [rondaActual, setRondaActual] = useState(1);
  const [preguntaActual, setPreguntaActual] = useState<Pregunta | null>(null);
  const [cargando, setCargando] = useState(true);

  // --- MÉTRICAS SILENCIOSAS (No se muestran al usuario) ---
  const [puntuacionInterna, setPuntuacionInterna] = useState(0);
  const [totalAciertos, setTotalAciertos] = useState(0);
  const [totalErrores, setTotalErrores] = useState(0);
  const [comboActual, setComboActual] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [tiempoInicio] = useState(new Date());

  useEffect(() => {
    generarPregunta();
  }, [rondaActual]);

  const generarPregunta = () => {
    const operacion =
      OPERACIONES[Math.floor(Math.random() * OPERACIONES.length)];
    let n1 = 0,
      n2 = 0,
      respuesta = 0;

    switch (operacion) {
      case "+":
        n1 = Math.floor(Math.random() * 30) + 1;
        n2 = Math.floor(Math.random() * 30) + 1;
        respuesta = n1 + n2;
        break;
      case "-":
        n1 = Math.floor(Math.random() * 30) + 15;
        n2 = Math.floor(Math.random() * 14) + 1;
        respuesta = n1 - n2;
        break;
      case "x":
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 5) + 1;
        respuesta = n1 * n2;
        break;
      case "÷":
        n2 = Math.floor(Math.random() * 5) + 2;
        respuesta = Math.floor(Math.random() * 10) + 1;
        n1 = n2 * respuesta;
        break;
    }

    const opciones = generarOpcionesFalsas(respuesta);
    setPreguntaActual({
      num1: n1,
      num2: n2,
      operacion,
      respuestaCorrecta: respuesta,
      opciones: opciones,
    });
    setCargando(false);
  };

  const generarOpcionesFalsas = (correcta: number) => {
    const opcionesSet = new Set<number>();
    opcionesSet.add(correcta);
    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 5) + 1;
      const opcionFalsa =
        Math.random() > 0.5 ? correcta + variacion : correcta - variacion;
      if (opcionFalsa >= 0) opcionesSet.add(opcionFalsa);
    }
    return Array.from(opcionesSet).sort(() => Math.random() - 0.5);
  };

  const guardarResultado = async (
    puntos: number,
    aciertos: number,
    errores: number,
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
        id_juego: 3, // ID para Cálculo Rápido
        puntaje: puntos,
        aciertos: aciertos,
        errores: errores,
        tiempo: segundos,
        detalles: {
          max_combo: maxCombo,
          rondas_totales: TOTAL_RONDAS,
          fecha_iso: tiempoFin.toISOString(),
        },
      };

      await fetch(`${API_URL}/api/stats/juegos/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      console.log("✅ Cálculo Rápido guardado");
    } catch (err) {
      console.error("❌ Error guardando aritmética:", err);
    }
  };

  const manejarRespuesta = (opcionSeleccionada: number) => {
    if (!preguntaActual) return;

    let nuevoPuntaje = puntuacionInterna;
    let nuevosAciertos = totalAciertos;
    let nuevosErrores = totalErrores;
    let nuevoCombo = comboActual;

    if (opcionSeleccionada === preguntaActual.respuestaCorrecta) {
      // ACIERTO
      nuevosAciertos++;
      nuevoCombo++;
      nuevoPuntaje += nuevoCombo >= 3 ? 3 : 1; // Bonus si lleva 3 seguidas
      if (nuevoCombo > maxCombo) setMaxCombo(nuevoCombo);
    } else {
      // ERROR
      nuevosErrores++;
      nuevoCombo = 0;
      nuevoPuntaje -= 1;
    }

    // Actualizar estados
    setPuntuacionInterna(nuevoPuntaje);
    setTotalAciertos(nuevosAciertos);
    setTotalErrores(nuevosErrores);
    setComboActual(nuevoCombo);

    if (rondaActual < TOTAL_RONDAS) {
      setRondaActual(rondaActual + 1);
    } else {
      // FIN DEL JUEGO
      guardarResultado(nuevoPuntaje, nuevosAciertos, nuevosErrores);
      Alert.alert(
        "¡Buen trabajo!",
        "Has completado tus ejercicios de cálculo por hoy. ¡Tu mente está en forma!",
        [{ text: "Finalizar", onPress: () => router.back() }],
      );
    }
  };

  if (cargando || !preguntaActual) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#0984E3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textoHeader}>
          Ejercicio {rondaActual} de {TOTAL_RONDAS}
        </Text>
        {/* Eliminamos el contador de aciertos visual para evitar ansiedad */}
      </View>

      <Text style={styles.titulo}>¿Cuál es el resultado?</Text>

      <View style={styles.operacionContainer}>
        <Text style={styles.textoOperacion}>
          {preguntaActual.num1} {preguntaActual.operacion} {preguntaActual.num2}{" "}
          = ?
        </Text>
      </View>

      <View style={styles.opcionesGrid}>
        {preguntaActual.opciones.map((opcion: number, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.botonOpcion}
            onPress={() => manejarRespuesta(opcion)}
          >
            <Text style={styles.textoBotonOpcion}>{opcion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
    paddingTop: 50,
  },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#DFF9FB",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  textoHeader: { fontSize: 18, fontWeight: "bold", color: "#130F40" },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2D3436",
    marginBottom: 30,
  },
  operacionContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
    elevation: 4,
  },
  textoOperacion: { fontSize: 50, fontWeight: "bold", color: "#0984E3" },
  opcionesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  botonOpcion: {
    width: (width - 60) / 2,
    height: 90,
    backgroundColor: "#2ECC71",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  textoBotonOpcion: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
});
