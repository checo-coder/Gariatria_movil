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

const { width } = Dimensions.get("window");
const API_URL = "http://192.168.100.38:4000";
const TOTAL_RONDAS = 10;

// BANCO DE DATOS
const BANCO_PREGUNTAS = [
  {
    frase: "Camarón que se duerme...",
    correcta: "se lo lleva la corriente",
    falsas: ["amanece más temprano", "poco aprieta", "no muerde"],
  },
  {
    frase: "A caballo regalado...",
    correcta: "no se le mira el colmillo",
    falsas: ["buena cara", "Dios lo ayuda", "oídos sordos"],
  },
  {
    frase: "Más vale pájaro en mano...",
    correcta: "que ciento volando",
    falsas: ["que perder el nido", "que dos en el árbol", "que estar solo"],
  },
  {
    frase: "Perro que ladra...",
    correcta: "no muerde",
    falsas: ["encuentra hueso", "es mejor amigo", "avisa temprano"],
  },
  {
    frase: "Al que madruga...",
    correcta: "Dios lo ayuda",
    falsas: ["llega más temprano", "encuentra todo cerrado", "tiene más sueño"],
  },
  {
    frase: "Dime con quién andas...",
    correcta: "y te diré quién eres",
    falsas: ["y te daré un consejo", "y sabré a dónde vas", "y seremos amigos"],
  },
  {
    frase: "¿Cuál palabra significa lo mismo que 'RÁPIDO'?",
    correcta: "Veloz",
    falsas: ["Fuerte", "Lento", "Pesado"],
  },
  {
    frase: "¿Qué objeto no pertenece al grupo?",
    correcta: "Manzana",
    falsas: ["Silla", "Mesa", "Sillón"],
  },
  {
    frase: "Ojos que no ven...",
    correcta: "corazón que no siente",
    falsas: [
      "pasos que no avanzan",
      "mente que no piensa",
      "boca que no habla",
    ],
  },
  {
    frase: "En boca cerrada...",
    correcta: "no entran moscas",
    falsas: [
      "se guardan secretos",
      "no hay palabras malas",
      "los dientes descansan",
    ],
  },
];

export default function JuegoLenguaje() {
  const router = useRouter();
  const [preguntasJuego, setPreguntasJuego] = useState<any[]>([]);
  const [rondaActual, setRondaActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  // --- MÉTRICAS SILENCIOSAS ---
  const [puntajeInterno, setPuntajeInterno] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [erroresInternos, setErroresInternos] = useState(0);
  const [comboActual, setComboActual] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [tiempoInicio] = useState(new Date());

  useEffect(() => {
    iniciarJuego();
  }, []);

  const mezclarArreglo = (arreglo: any[]) => {
    return [...arreglo].sort(() => Math.random() - 0.5);
  };

  const iniciarJuego = () => {
    const preguntasMezcladas = mezclarArreglo(BANCO_PREGUNTAS).slice(
      0,
      TOTAL_RONDAS,
    );
    const preguntasPreparadas = preguntasMezcladas.map((p: any) => {
      const opciones = mezclarArreglo([p.correcta, ...p.falsas]);
      return { ...p, opcionesPreparadas: opciones };
    });

    setPreguntasJuego(preguntasPreparadas);
    setRondaActual(0);
    setCargando(false);
  };

  const guardarResultado = async (
    puntosFinales: number,
    totalAciertos: number,
    totalErrores: number,
  ) => {
    try {
      const idCliente = await SecureStore.getItemAsync("idDelPaciente");
      const tiempoFin = new Date();
      const segundos = Math.floor(
        (tiempoFin.getTime() - tiempoInicio.getTime()) / 1000,
      );

      const body = {
        id_cliente: idCliente,
        id_juego: 4, // ID para Lenguaje
        puntaje: puntosFinales,
        aciertos: totalAciertos,
        errores: totalErrores,
        tiempo: segundos,
        detalles: {
          max_combo: maxCombo,
          finalizo: true,
          fecha_iso: tiempoFin.toISOString(),
        },
      };

      await fetch(`${API_URL}/juegos/registrar-resultado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.log("✅ Juego de Lenguaje guardado");
    } catch (err) {
      console.error("❌ Error guardando lenguaje:", err);
    }
  };

  const manejarRespuesta = (respuestaSeleccionada: string) => {
    const preguntaActual = preguntasJuego[rondaActual];

    let nuevoPuntaje = puntajeInterno;
    let nuevosAciertos = aciertos;
    let nuevosErrores = erroresInternos;
    let nuevoCombo = comboActual;

    if (respuestaSeleccionada === preguntaActual.correcta) {
      // ACIERTO
      nuevosAciertos++;
      nuevoCombo++;
      nuevoPuntaje += nuevoCombo >= 3 ? 3 : 1;
      if (nuevoCombo > maxCombo) setMaxCombo(nuevoCombo);
    } else {
      // ERROR
      nuevosErrores++;
      nuevoCombo = 0;
      nuevoPuntaje -= 1;
    }

    // Actualizamos estados internos
    setPuntajeInterno(nuevoPuntaje);
    setAciertos(nuevosAciertos);
    setErroresInternos(nuevosErrores);
    setComboActual(nuevoCombo);

    if (rondaActual + 1 < preguntasJuego.length) {
      setRondaActual(rondaActual + 1);
    } else {
      // FIN DEL JUEGO
      guardarResultado(nuevoPuntaje, nuevosAciertos, nuevosErrores);
      Alert.alert(
        "¡Excelente Trabajo!",
        "Has completado el ejercicio de lenguaje de hoy. ¡Muy bien!",
        [{ text: "Continuar", onPress: () => router.back() }],
      );
    }
  };

  if (cargando || preguntasJuego.length === 0) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#82CCDD" />
      </View>
    );
  }

  const pregunta = preguntasJuego[rondaActual];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textoHeader}>
          Pregunta {rondaActual + 1} de {preguntasJuego.length}
        </Text>
      </View>

      <Text style={styles.instruccion}>Selecciona la respuesta correcta:</Text>

      <View style={styles.preguntaContainer}>
        <Text style={styles.textoPregunta}>{pregunta.frase}</Text>
      </View>

      <View style={styles.opcionesContainer}>
        {pregunta.opcionesPreparadas.map((opcion: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.botonOpcion}
            onPress={() => manejarRespuesta(opcion)}
          >
            <Text
              style={styles.textoBotonOpcion}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {opcion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    marginBottom: 30,
    backgroundColor: "#F8EFBA",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  textoHeader: { fontSize: 18, fontWeight: "bold", color: "#2C3A47" },
  instruccion: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#576574",
    marginBottom: 20,
  },
  preguntaContainer: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#F8EFBA",
  },
  textoPregunta: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3A47",
    textAlign: "center",
  },
  opcionesContainer: { flexDirection: "column" },
  botonOpcion: {
    width: "100%",
    minHeight: 80,
    backgroundColor: "#82CCDD",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 3,
  },
  textoBotonOpcion: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3A47",
    textAlign: "center",
  },
});
