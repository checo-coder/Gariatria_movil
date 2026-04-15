import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 1. DEFINIMOS LA ESTRUCTURA DE LOS DATOS (INTERFACE)
interface BarraControlProps {
  modoEdicion: boolean;
  zonaGuardada: any;
  zonaBorrador: any;
  procesando: boolean;
  onIniciar: () => void;
  onEliminar: () => void;
  onCancelar: () => void;
  onGuardar: () => void;
  onAjustarRadio: (cantidad: number) => void;
}

// 2. APLICAMOS LA INTERFACE AL COMPONENTE
export default function BarraControl({
  modoEdicion,
  zonaGuardada,
  zonaBorrador,
  procesando,
  onIniciar,
  onEliminar,
  onCancelar,
  onGuardar,
  onAjustarRadio,
}: BarraControlProps) {
  // <--- Aquí le decimos que use la interface

  if (!modoEdicion) {
    return (
      <View style={styles.barraFlotante}>
        <TouchableOpacity style={styles.botonPildora} onPress={onIniciar}>
          <MaterialCommunityIcons
            name={zonaGuardada ? "pencil" : "map-marker-plus"}
            size={22}
            color="#6ec6e6ff" // O el color que uses en tu CSS
          />
          <Text style={styles.iconoBoton}></Text>
          <Text style={styles.textoBotonPildora}>
            {zonaGuardada ? "Editar Zona Segura" : "Crear Zona Segura"}
          </Text>
        </TouchableOpacity>
        {zonaGuardada && (
          <>
            <View style={styles.divisor} />
            <TouchableOpacity style={styles.botonIcono} onPress={onEliminar}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#FF000080" // Un rojo suave para indicar peligro/borrar
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.tarjetaEdicion}>
      <View style={styles.encabezadoEdicion}>
        <Text style={styles.tituloPanel}>Ajustar Geocerca</Text>
        <Text style={styles.instrucciones}>Mueve el pin o cambia el radio</Text>
      </View>

      <View style={styles.filaBotonesRadio}>
        <TouchableOpacity
          onPress={() => onAjustarRadio(-50)}
          style={styles.botonRadio}
        >
          <Text style={styles.textoRadioBtn}>-</Text>
        </TouchableOpacity>
        <Text style={styles.radioTexto}>{zonaBorrador?.radius}m</Text>
        <TouchableOpacity
          onPress={() => onAjustarRadio(50)}
          style={styles.botonRadio}
        >
          <Text style={styles.textoRadioBtn}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.botonesAccion}>
        <TouchableOpacity style={styles.botonCancelar} onPress={onCancelar}>
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonGuardar}
          onPress={onGuardar}
          disabled={procesando}
        >
          {procesando ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.textoGuardar}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 3. ESTILOS (Asegúrate de tenerlos aquí)
const styles = StyleSheet.create({
  barraFlotante: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    elevation: 8,
    alignItems: "center",
  },
  botonPildora: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textoBotonPildora: {
    color: "#2c3e50",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  divisor: {
    width: 1,
    height: 24,
    backgroundColor: "#ecf0f1",
    marginHorizontal: 5,
  },
  botonIcono: { paddingHorizontal: 15, paddingVertical: 10 },
  iconoBoton: { fontSize: 16 },
  tarjetaEdicion: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 25,
    elevation: 10,
  },
  encabezadoEdicion: { alignItems: "center", marginBottom: 15 },
  tituloPanel: { fontWeight: "bold", fontSize: 18, color: "#2c3e50" },
  instrucciones: { fontSize: 13, color: "#7f8c8d", marginTop: 2 },
  filaBotonesRadio: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  botonRadio: {
    backgroundColor: "#f1f2f6",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
  },
  textoRadioBtn: {
    fontSize: 24,
    color: "#2c3e50",
    fontWeight: "bold",
    marginTop: -3,
  },
  radioTexto: {
    marginHorizontal: 30,
    fontWeight: "bold",
    fontSize: 16,
    color: "#34495e",
  },
  botonesAccion: { flexDirection: "row", justifyContent: "space-between" },
  botonCancelar: {
    backgroundColor: "#f1f2f6",
    paddingVertical: 14,
    borderRadius: 15,
    flex: 0.47,
    alignItems: "center",
  },
  textoCancelar: { color: "#7f8c8d", fontWeight: "bold", fontSize: 15 },
  botonGuardar: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 15,
    flex: 0.47,
    alignItems: "center",
  },
  textoGuardar: { color: "white", fontWeight: "bold", fontSize: 15 },
});
