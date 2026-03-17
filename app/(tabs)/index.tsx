import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import GraficaSemanal from "../componentes/GraficaBarras";
import GraficaCalor from "../componentes/GraficaCalor";
import MenuJuegos from "../componentes/MenuJuegos";

export default function PantallaPrincipal() {
  const [rol, setRol] = useState(null);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [cargando, setCargando] = useState(true); // <--- Estado de carga
  const [estadisticas, setEstadisticas] = useState([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const obtenerRol = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");

        if (token) {
          const decoded: any = jwtDecode(token);
          setRol(decoded.rol);
          setId(decoded.idUsuario); // Guardamos el ID del usuario
          setNombre(decoded.nombre); // Guardamos el nombre del usuario
        } else {
          // Manejar caso sin token (ej. redirigir a Login)
          setRol(null);
          setId(null);
          setNombre(null);
        }
      } catch (error) {
        console.error("Error al decodificar token:", error);
        setRol(null);
        setId(null);
        setNombre(null);
      } finally {
        setCargando(false); // <--- Finaliza la carga pase lo que pase
      }
    };

    obtenerRol();
  }, []);

  useEffect(() => {
    if (!id) return; // Si no hay ID, no hacemos nada

    const obtenerEstadisticas = async () => {
      try {
        setCargandoEstadisticas(true);
        const respuesta = await fetch(
          `http://192.168.100.38:4000/estadisticas/${id}`,
        );
        const datos = await respuesta.json();
        setEstadisticas(datos);
      } catch (e) {
        console.error("Error stats:", e);
      } finally {
        setCargandoEstadisticas(false);
      }
    };

    obtenerEstadisticas();
  }, [id]);

  // 1. Mientras decide qué mostrar
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 3. Renderizado condicional según el rol
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {rol === "Persona Mayor" ? (
        <View>
          <Text style={styles.titulo}>Bienvenido persona mayor, {nombre}</Text>
          <MenuJuegos />
        </View>
      ) : rol === "cuidador" ? (
        <View>
          <Text>Bienvenido cuidador, {nombre}</Text>
          <GraficaSemanal
            titulo="Juegos completados (7 días)"
            datos={estadisticas}
            cargando={cargandoEstadisticas}
          />
          <GraficaCalor
            titulo="Actividad del Paciente"
            datos={estadisticas}
            cargando={cargandoEstadisticas}
          />
        </View>
      ) : (
        <Text>Rol no reconocido</Text>
      )}
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
});
