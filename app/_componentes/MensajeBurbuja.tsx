import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const MensajeBurbuja = ({
  item,
  esMio,
}: {
  item: any;
  esMio: boolean;
}) => (
  <View style={[styles.burbuja, esMio ? styles.mia : styles.otra]}>
    <Text style={[styles.textoMsg, esMio ? styles.textoMio : styles.textoOtro]}>
      {item.contenido_texto}
    </Text>
    <Text style={[styles.hora, esMio ? styles.horaMia : styles.horaOtra]}>
      {new Date(item.fechaEnvio).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  burbuja: { maxWidth: "80%", padding: 12, borderRadius: 18, marginBottom: 10 },
  mia: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
    borderBottomRightRadius: 2,
  },
  otra: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  textoMsg: { fontSize: 15 },
  textoMio: { color: "white" },
  textoOtro: { color: "#333" },
  hora: { fontSize: 9, marginTop: 4, alignSelf: "flex-end" },
  horaMia: { color: "#d1d1d1" },
  horaOtra: { color: "#95a5a6" },
});
