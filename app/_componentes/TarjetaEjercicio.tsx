import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Definimos qué datos necesita recibir la tarjeta
interface TarjetaProps {
  titulo: string;
  sub: string;
  icono: string;
  color: string;
  ultimaFecha?: string;
  onPress: () => void;
}

export default function TarjetaEjercicio({
  titulo,
  sub,
  icono,
  color,
  ultimaFecha,
  onPress,
}: TarjetaProps) {
  const formatearFecha = () => {
    if (!ultimaFecha) return "Aún no realizado";
    const fecha = new Date(ultimaFecha);
    return `Último: ${fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.circuloIcono, { backgroundColor: color + "20" }]}>
        <Ionicons name={icono as any} size={30} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitulo}>{titulo}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
        <Text
          style={[
            styles.fechaTexto,
            { color: ultimaFecha ? "#27ae60" : "#B2BEC3" },
          ]}
        >
          <Ionicons name="time-outline" size={12} /> {formatearFecha()}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#DCDDE1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  circuloIcono: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTitulo: { fontSize: 17, fontWeight: "bold", color: "#2D3436" },
  cardSub: { fontSize: 13, color: "#636E72", marginBottom: 4 },
  fechaTexto: { fontSize: 12, fontWeight: "600" },
});
