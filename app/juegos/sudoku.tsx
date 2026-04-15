import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import sudoku from "sudoku";

const { width } = Dimensions.get("window");
const CELL_SIZE = Math.floor((width - 40) / 9);
const API_URL = "http://192.168.100.38:4000";

export default function SudokuLocal() {
  // --- ESTADOS DEL JUEGO ---
  const [tablero, setTablero] = useState<(number | null)[]>([]);
  const [solucion, setSolucion] = useState<(number | null)[]>([]);
  const [originales, setOriginales] = useState<boolean[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  // --- MÉTRICAS SILENCIOSAS ---
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [tiempoInicio] = useState(new Date());
  const [celdasInicialesVacias, setCeldasInicialesVacias] = useState(0);

  useEffect(() => {
    generarNuevoJuego();
  }, []);

  const generarNuevoJuego = () => {
    const puzzle = sudoku.makepuzzle();
    const solve = sudoku.solvepuzzle(puzzle);

    // Tipamos 'n' para evitar el error de TypeScript
    const tableroAjustado = puzzle.map((n: number | null) =>
      n !== null ? n + 1 : null,
    );
    const solucionAjustada = solve.map((n: number) => n + 1);

    const vacias = tableroAjustado.filter(
      (n: number | null) => n === null,
    ).length;

    setCeldasInicialesVacias(vacias);
    setTablero(tableroAjustado);
    setSolucion(solucionAjustada);
    setOriginales(tableroAjustado.map((n: number | null) => n !== null));
    setSeleccionado(null);
    setCargando(false);
  };

  const guardarResultado = async (
    puntosFinales: number,
    totalAciertos: number,
    totalErrores: number,
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
        id_juego: 2, // ID del juego Sudoku en tu tabla 'juegos'
        puntaje: puntosFinales,
        aciertos: totalAciertos,
        errores: totalErrores,
        tiempo: segundos,
        detalles: {
          celdas_vacias_iniciales: celdasInicialesVacias,
          fecha_iso: tiempoFin.toISOString(),
        },
      };

      const respuesta = await fetch(`${API_URL}/api/stats/juegos/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (respuesta.ok) {
        console.log("✅ Sudoku guardado con éxito");
      }
    } catch (err) {
      console.error("❌ Error guardando sudoku:", err);
    }
  };

  const ponerNumero = (num: number | null) => {
    if (seleccionado !== null && !originales[seleccionado]) {
      const valorCorrecto = solucion[seleccionado];

      // Lógica de puntuación interna
      if (num !== null) {
        if (num === valorCorrecto) {
          setAciertos((prev) => prev + 1);
          setPuntaje((prev) => prev + 2); // +2 por acierto
        } else {
          setErrores((prev) => prev + 1);
          setPuntaje((prev) => prev - 1); // -1 por error
        }
      }

      const nuevoTablero = [...tablero];
      nuevoTablero[seleccionado] = num;
      setTablero(nuevoTablero);

      // Verificar si el tablero está lleno
      if (!nuevoTablero.includes(null)) {
        const ganado = nuevoTablero.every((val, i) => val === solucion[i]);
        if (ganado) {
          // Ajuste final de puntos para el envío
          const puntosParaGuardar = puntaje + (num === valorCorrecto ? 2 : -1);
          guardarResultado(
            puntosParaGuardar,
            aciertos + (num === valorCorrecto ? 1 : 0),
            errores + (num !== valorCorrecto ? 1 : 0),
          );

          Alert.alert(
            "¡Excelente!",
            "Has completado este ejercicio de lógica.",
            [{ text: "Continuar", onPress: () => router.back() }],
          );
        }
      }
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#353b48" />
        <Text>Preparando tablero...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Gimnasia Mental</Text>
      <Text style={styles.instruccion}>Rellena los números que faltan</Text>

      <View style={styles.gridContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((rowIndex: number) => (
          <View key={`row-${rowIndex}`} style={styles.fila}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((colIndex: number) => {
              const index = rowIndex * 9 + colIndex;
              const item = tablero[index];

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSeleccionado(index)}
                  style={[
                    styles.celda,
                    seleccionado === index && styles.seleccionada,
                    colIndex % 3 === 2 && colIndex !== 8 && styles.bordeDerecho,
                    rowIndex % 3 === 2 &&
                      rowIndex !== 8 &&
                      styles.bordeInferior,
                  ]}
                >
                  <Text
                    style={[
                      styles.textoCelda,
                      originales[index]
                        ? styles.textoFijo
                        : styles.textoUsuario,
                      item !== null &&
                        !originales[index] &&
                        item !== solucion[index] && { color: "#e74c3c" },
                    ]}
                  >
                    {item !== null ? item : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.teclado}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n: number) => (
          <TouchableOpacity
            key={n}
            style={styles.botonNum}
            onPress={() => ponerNumero(n)}
          >
            <Text style={styles.textoBoton}>{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.botonNum, { backgroundColor: "#95a5a6" }]}
          onPress={() => ponerNumero(null)}
        >
          <Text style={styles.textoBoton}>⌫</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnReinicio} onPress={generarNuevoJuego}>
        <Text style={styles.textoReinicio}>Limpiar Tablero</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f6fa",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 40,
  },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#2f3640" },
  instruccion: { fontSize: 16, color: "#636e72", marginBottom: 20 },
  gridContainer: {
    borderWidth: 2,
    borderColor: "#2f3640",
    backgroundColor: "#fff",
    elevation: 5,
  },
  fila: { flexDirection: "row" },
  celda: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: "#dcdde1",
    justifyContent: "center",
    alignItems: "center",
  },
  seleccionada: { backgroundColor: "#d1ccc0" },
  bordeDerecho: { borderRightWidth: 2, borderRightColor: "#2f3640" },
  bordeInferior: { borderBottomWidth: 2, borderBottomColor: "#2f3640" },
  textoCelda: { fontSize: 20 },
  textoFijo: { fontWeight: "bold", color: "#2f3640" },
  textoUsuario: { color: "#0097e6", fontWeight: "bold" },
  teclado: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 15,
  },
  botonNum: {
    width: width * 0.15,
    height: 55,
    backgroundColor: "#353b48",
    margin: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  textoBoton: { color: "#f5f6fa", fontSize: 24, fontWeight: "bold" },
  btnReinicio: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
  },
  textoReinicio: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
