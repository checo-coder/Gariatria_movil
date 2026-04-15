// app/componentes/MenuJuegos.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function MenuJuegos() {
  const router = useRouter();

  const juegos = [
    {
      id: "1",
      titulo: "Memorama",
      icono: "apps",
      color: "#FF7675",
      ruta: "../juegos/memorama",
    },
    {
      id: "2",
      titulo: "Sudoku",
      icono: "grid",
      color: "#74B9FF",
      ruta: "/juegos/sudoku",
    },
    {
      id: "3",
      titulo: "Cálculo",
      icono: "calculator",
      color: "#55E6C1",
      ruta: "/juegos/aritmetica",
    },
    {
      id: "4",
      titulo: "Lenguaje",
      icono: "book",
      color: "#F7D794",
      ruta: "/juegos/lenguaje",
    },
  ];

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>¿A qué quieres jugar hoy?</Text>
      <View style={styles.grid}>
        {juegos.map((juego) => (
          <TouchableOpacity
            key={juego.id}
            style={[styles.boton, { backgroundColor: juego.color }]}
            onPress={() => router.push(juego.ruta as any)}
          >
            <Ionicons name={juego.icono as any} size={50} color="white" />
            <Text style={styles.textoBoton}>{juego.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "100%",
    marginTop: 10,
    // Quitamos el padding de aquí porque el padre ya lo tiene
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Separa los botones a los extremos
    width: "100%",
  },
  boton: {
    width: "48%", // El 48% asegura que quepan 2 con un hueco al centro
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoBoton: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
  },
});
