import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// 1. IMPORTANTE: Necesitamos el SecureStore para el token
import * as SecureStore from "expo-secure-store";

const API_URL = "https://backendoldfit-production.up.railway.app";

export default function TarjetaMedicina({
  item,
  onActualizar,
}: {
  item: any;
  onActualizar: () => void;
}) {
  const fechaObjeto = new Date(item.fecha_hora_programada);
  const yaEsHora = new Date() >= fechaObjeto;

  const diaTexto = fechaObjeto.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
  const horaTexto = fechaObjeto.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "#f39c12";
      case "tomada":
        return "#27ae60";
      case "omitida":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  // 2. CORRECCIÓN: Obtener el token dentro de la función
  const marcarComoTomada = async () => {
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");

      if (!token) {
        Alert.alert("Error", "No se encontró una sesión activa.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/api/meds/tomas/${item.id_toma}/tomada`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // 3. ENVIAR EL TOKEN CORRECTAMENTE
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (respuesta.ok) {
        Alert.alert(
          "¡Excelente!",
          "Has registrado tu medicamento correctamente.",
        );
        onActualizar(); // Esto refresca la lista en la pantalla principal
      } else {
        Alert.alert("Error", "No pudimos registrar la toma.");
      }
    } catch (error) {
      console.error("Error al marcar toma:", error);
      Alert.alert("Error de red", "Revisa tu conexión.");
    }
  };

  return (
    <View style={styles.tarjeta}>
      <View style={styles.horaContainer}>
        <Text style={styles.textoDia}>{diaTexto}</Text>
        <Text style={styles.textoHora} numberOfLines={1} adjustsFontSizeToFit>
          {horaTexto}
        </Text>
      </View>

      <View style={styles.detallesContainer}>
        <View style={styles.filaTitulo}>
          <Text style={styles.nombreMedicina}>{item.nombre_medicamento}</Text>
          <View
            style={[
              styles.badgeEstado,
              { backgroundColor: obtenerColorEstado(item.estado_toma) },
            ]}
          >
            <Text style={styles.textoBadge}>
              {item.estado_toma.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.textoDosis}>
          Dosis: <Text style={styles.textoResaltado}>{item.dosis}</Text>
        </Text>

        {/* 4. OJO: Revisa si en tu DB es 'indicaciones' o 'indicaciones_extra' */}
        {item.indicaciones ? (
          <View style={styles.cajaIndicaciones}>
            <Text style={styles.textoIndicaciones}>
              <Text style={{ fontWeight: "bold" }}>Nota: </Text>
              {item.indicaciones}
            </Text>
          </View>
        ) : null}

        {item.estado_toma === "pendiente" && (
          <TouchableOpacity
            style={[styles.botonTomar, !yaEsHora && styles.botonBloqueado]}
            onPress={marcarComoTomada}
            disabled={!yaEsHora}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name={yaEsHora ? "check-circle" : "clock-outline"}
                size={20}
                color={yaEsHora ? "#30a862ff" : "#95a5a6"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.textoBotonTomar,
                  !yaEsHora && styles.textoBloqueado,
                ]}
              >
                {yaEsHora ? "Marcar como tomada" : "Aún no es hora"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#bdecffff",
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: "row",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 8,
    borderLeftColor: "#6ec6e6ff",
    overflow: "hidden",
  },
  horaContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafaff",
    borderRightWidth: 1,
    borderRightColor: "#DFE6E9",
    width: 110,
  },
  textoDia: {
    fontSize: 16,
    color: "#636E72",
    textTransform: "capitalize",
    marginBottom: 5,
  },
  textoHora: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    textAlign: "center",
  },
  detallesContainer: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  nombreMedicina: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3436",
  },
  badgeEstado: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  textoBadge: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  textoDosis: {
    fontSize: 16,
    color: "#636E72",
  },
  textoResaltado: {
    fontWeight: "bold",
    color: "#2D3436",
  },
  cajaIndicaciones: {
    marginTop: 10,
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffe69c",
  },
  textoIndicaciones: {
    fontSize: 14,
    color: "#856404",
  },
  // ESTILOS DEL BOTÓN NORMAL
  botonTomar: {
    marginTop: 15,
    backgroundColor: "#e8f8f5", // Un verde muy clarito de fondo
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#48d884ff",
  },
  textoBotonTomar: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#30a862ff",
  },
  // NUEVOS ESTILOS PARA EL BOTÓN BLOQUEADO
  botonBloqueado: {
    backgroundColor: "#F1F2F6",
    borderColor: "#DFE6E9",
  },
  textoBloqueado: {
    color: "#B2BEC3", // Texto gris para indicar inactividad
  },
});
