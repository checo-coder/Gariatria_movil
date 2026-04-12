import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TarjetaCita({ cita }: { cita: any }) {
  // Formateamos la fecha que viene de TIMESTAMPTZ
  const fechaObj = new Date(cita.fecha);
  const dia = fechaObj.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const hora = fechaObj.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconoCirculo}>
          <Ionicons name="calendar-outline" size={24} color="#3498db" />
        </View>
        <View>
          <Text style={styles.textoDia}>{dia}</Text>
          <Text style={styles.textoHora}>{hora}</Text>
        </View>
      </View>

      <View style={styles.cuerpo}>
        <Text style={styles.etiqueta}>Motivo de la consulta:</Text>
        <Text style={styles.razon}>{cita.razon}</Text>

        <View style={styles.doctorFila}>
          <Ionicons name="person-circle-outline" size={20} color="#636E72" />
          <Text style={styles.nombreDoctor}>
            Geriatra: {cita.nombre_geriatra}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
    paddingBottom: 12,
  },
  iconoCirculo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E1F0FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textoDia: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    textTransform: "capitalize",
  },
  textoHora: { fontSize: 14, color: "#3498db", fontWeight: "600" },
  cuerpo: { gap: 5 },
  etiqueta: {
    fontSize: 12,
    color: "#B2BEC3",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  razon: {
    fontSize: 18,
    color: "#2D3436",
    marginBottom: 10,
    fontWeight: "500",
  },
  doctorFila: { flexDirection: "row", alignItems: "center", gap: 6 },
  nombreDoctor: { fontSize: 15, color: "#636E72" },
});
