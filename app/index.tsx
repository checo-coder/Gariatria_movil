import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import BotonAccion from "./_componentes/BotonAccion";

export default function Index() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <View style={styles.container_img}>
        <Text style={styles.text}>Bienvendio a OldFit</Text>
        <Image
          source={require("../assets/images/oldfi.png")}
          style={styles.img}
        />
      </View>
      <View style={styles.container}>
        <BotonAccion
          titulo="Registrarse"
          onPress={() => router.push("/registro")}
          color="#4caf50" // Puedes cambiar el color si quieres
        />

        <BotonAccion
          titulo="Iniciar Sesión"
          onPress={() => router.push("/inicio")}
          color="#000000ff"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#4262aeff", // Fondo azul claro "vivo" pero profesional
    paddingHorizontal: 20,
  },
  container_img: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  text: {
    fontSize: 38,
    fontWeight: "800",
    color: "#ffffffff", // Azul oscuro para contraste
    textAlign: "center",
    fontFamily: "Papyrus", // Fuente más caricaturesca
    marginBottom: 10,
  },
  img: {
    width: 320,
    height: 320,
    resizeMode: "contain",
    margin: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#70b4ebff", // Fondo blanco para resaltar los botones
    flexDirection: "row",
    paddingTop: 90,
    gap: 15,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: "60%",
    margin: -120,
  },
  button: {
    backgroundColor: "#37b5beff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15, // Más redondeado se ve más moderno
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase", // Estilo de botón de acción
  },
});
