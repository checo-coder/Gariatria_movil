import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TarjetaCitaProps {
  cita: any;
  rol: string | null;
  onCancelar: (id: number) => void;
}

export default function TarjetaCita({
  cita,
  rol,
  onCancelar,
}: TarjetaCitaProps) {
  // Formateamos la fecha
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

  const confirmarCancelacion = () => {
    Alert.alert(
      "Cancelar Cita",
      "¿Estás seguro de que deseas cancelar esta consulta médica?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => onCancelar(cita.id_cita),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconoCirculo}>
          <Ionicons name="calendar-outline" size={24} color="#3498db" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textoDia}>{dia}</Text>
          <Text style={styles.textoHora}>{hora}</Text>
        </View>

        {/* BOTÓN ELIMINAR: Solo para cuidadores */}
        {rol === "cuidador" && (
          <TouchableOpacity
            onPress={confirmarCancelacion}
            style={styles.btnEliminar}
          >
            <MaterialCommunityIcons
              name="calendar-remove"
              size={24}
              color="#e74c3c"
            />
          </TouchableOpacity>
        )}
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
  textoHora: { fontSize: 14, color: "#636E72", marginTop: 2 },
  btnEliminar: {
    padding: 8,
    backgroundColor: "#FDECEA",
    borderRadius: 10,
  },
  cuerpo: { marginTop: 5 },
  etiqueta: {
    fontSize: 12,
    color: "#B2BEC3",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  razon: {
    fontSize: 16,
    color: "#2D3436",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 22,
  },
  doctorFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 8,
  },
  nombreDoctor: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
});
