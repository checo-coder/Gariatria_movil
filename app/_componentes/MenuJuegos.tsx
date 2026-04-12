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
  contenedor: { padding: 20 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  boton: {
    width: width * 0.4, // Casi la mitad de la pantalla
    height: width * 0.4,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  textoBoton: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
  },
});
