import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MemoramaCard from "../componentes/MemoramaCard";

interface Carta {
  code: string; // Identificador único para comparar pares
  img: string; // URL de la imagen de la carta
}

export default function JuegoMemorama() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [adivinadas, setAdivindas] = useState<number[]>([]);
  const [error, setError] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  // 1. Carga de cartas desde tu API
  useEffect(() => {
    fetch("http://192.168.100.38:4000/memoria") // USA TU IP LOCAL, NO localhost
      .then((response) => response.json())
      .then((data) => {
        setCartas(data.cards);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  }, []);

  // 2. Lógica de selección
  const onClickCarta = (index: number) => {
    if (
      seleccionadas.length < 2 &&
      !seleccionadas.includes(index) &&
      !adivinadas.includes(index)
    ) {
      setSeleccionadas([...seleccionadas, index]);
    }
  };

  // 3. Lógica de comparación
  useEffect(() => {
    if (seleccionadas.length === 2) {
      const carta1 = cartas[seleccionadas[0]];
      const carta2 = cartas[seleccionadas[1]];

      if (carta1.code === carta2.code) {
        const nuevasAdivinadas = [...adivinadas, ...seleccionadas];
        setAdivindas(nuevasAdivinadas);
        setSeleccionadas([]);

        // Verificar si ganó
        if (nuevasAdivinadas.length === cartas.length && cartas.length > 0) {
          Alert.alert("¡Felicidades!", "Has encontrado todos los pares", [
            { text: "Volver al menú", onPress: () => router.back() },
          ]);
        }
      } else {
        setError(error + 1);
        setTimeout(() => {
          setSeleccionadas([]);
        }, 1000);
      }
    }
  }, [seleccionadas]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FF7675" />
        <Text>Preparando cartas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Memorama Cognitivo</Text>
      <Text style={styles.subtitulo}>
        Pares encontrados: {adivinadas.length / 2}
        Errores: {error}
      </Text>

      <FlatList
        data={cartas}
        numColumns={3} // Ajusta según el tamaño de las cartas
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const estaVolteada =
            seleccionadas.includes(index) || adivinadas.includes(index);
          return (
            <MemoramaCard
              image={item.img}
              estaVolteada={estaVolteada}
              onClick={() => onClickCarta(index)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingTop: 40,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2D3436",
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#636E72",
  },
  grid: {
    alignItems: "center",
    paddingBottom: 20,
  },
});
