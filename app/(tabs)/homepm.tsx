import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://192.168.100.38:4000";

export default function PantallaConfiguracion() {
  const [perfil, setPerfil] = useState<any>(null);
  const [vinculo, setVinculo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (!token) return router.replace("/inicio");

      const decoded: any = jwtDecode(token);
      const respuesta = await fetch(
        `${API_URL}/auth/perfil/${decoded.idUsuario}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setPerfil(datos.usuario);
        setVinculo(datos.vinculo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("mi_token_jwt");
          router.replace("/inicio");
        },
      },
    ]);
  };

  if (cargando)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="account-circle"
            size={90}
            color="#FFF"
          />

          <Text style={styles.nombrePrincipal}>
            {perfil?.nombre} {perfil?.apellidop}
          </Text>
          <Text style={styles.apellidoSecundario}>{perfil?.apellidom}</Text>
          <Text style={styles.apellidoSecundario}>
            Numero de vinculacion: {perfil?.id_cliente}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  perfil?.rol === "cuidador" ? "#3498db" : "#2ecc71",
              },
            ]}
          >
            <Text style={styles.badgeText}>{perfil?.rol?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cuerpo}>
          {/* SECCIÓN: DATOS PERSONALES */}
          <Text style={styles.etiquetaSeccion}>Mi Cuenta</Text>
          <View style={styles.tarjeta}>
            <FilaDato icono="email" label="Correo" valor={perfil?.correo} />
            <FilaDato
              icono="calendar-month"
              label="Edad"
              valor={`${perfil?.edad} años`}
            />
          </View>

          {/* SECCIÓN: GERIATRA */}
          <Text style={styles.etiquetaSeccion}>Geriatra Responsable</Text>
          <View
            style={[
              styles.tarjeta,
              { borderLeftColor: "#9b59b6", borderLeftWidth: 6 },
            ]}
          >
            {perfil?.nombre_geriatra ? (
              <View>
                <View style={styles.filaVinculo}>
                  <MaterialCommunityIcons
                    name="doctor"
                    size={28}
                    color="#9b59b6"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.nombreVinculo}>
                      Dr. {perfil.nombre_geriatra} {perfil.apellidop_geriatra}{" "}
                      {perfil.apellidom_geriatra}
                    </Text>
                    <Text style={styles.cedulaTexto}>
                      Cédula: {perfil.cedula_geriatra || "Sin registrar"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.vacio}>Sin médico asignado</Text>
            )}
          </View>

          {/* SECCIÓN: VÍNCULO */}
          <Text style={styles.etiquetaSeccion}>
            {perfil?.rol === "cuidador" ? "Mi Paciente" : "Mi Cuidador"}
          </Text>
          <View
            style={[
              styles.tarjeta,
              { borderLeftColor: "#f1c40f", borderLeftWidth: 6 },
            ]}
          >
            {vinculo ? (
              <View style={styles.filaVinculo}>
                <MaterialCommunityIcons
                  name="account-multiple"
                  size={28}
                  color="#f39c12"
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.nombreVinculo}>
                    {vinculo.nombre} {vinculo.apellidop} {vinculo.apellidom}
                  </Text>
                  <Text style={styles.correoVinculo}>{vinculo.correo}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.vacio}>Sin compañero asignado</Text>
            )}
          </View>

          {/* BOTÓN SALIR */}
          <TouchableOpacity style={styles.btnLogOut} onPress={cerrarSesion}>
            <MaterialCommunityIcons
              name="logout-variant"
              size={24}
              color="#FFF"
            />
            <Text style={styles.btnText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            OldFit • Sistema para la Salud del Adulto Mayor
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente para las filas de información básica
function FilaDato({ icono, label, valor }: any) {
  return (
    <View style={styles.infoFila}>
      <MaterialCommunityIcons name={icono} size={22} color="#7f8c8d" />
      <View style={{ marginLeft: 15 }}>
        <Text style={styles.txtLabel}>{label}</Text>
        <Text style={styles.txtValor}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    backgroundColor: "#2c3e50",
    paddingVertical: 45,
    alignItems: "center",
    borderBottomRightRadius: 35,
    borderBottomLeftRadius: 35,
  },
  nombrePrincipal: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  apellidoSecundario: { color: "#bdc3c7", fontSize: 16, marginTop: -2 },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: { color: "#FFF", fontWeight: "bold", fontSize: 11 },
  cuerpo: { padding: 22 },
  etiquetaSeccion: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#95a5a6",
    marginBottom: 10,
    marginTop: 15,
    textTransform: "uppercase",
  },
  tarjeta: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },
  infoFila: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  txtLabel: { fontSize: 12, color: "#95a5a6" },
  txtValor: { fontSize: 16, fontWeight: "600", color: "#2c3e50" },
  filaVinculo: { flexDirection: "row", alignItems: "center" },
  nombreVinculo: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  cedulaTexto: {
    fontSize: 13,
    color: "#9b59b6",
    fontWeight: "600",
    marginTop: 2,
  },
  correoVinculo: { fontSize: 13, color: "#7f8c8d" },
  vacio: { fontStyle: "italic", color: "#bdc3c7", textAlign: "center" },
  btnLogOut: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    padding: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginLeft: 10 },
  footer: {
    textAlign: "center",
    color: "#bdc3c7",
    marginTop: 40,
    fontSize: 11,
  },
});
