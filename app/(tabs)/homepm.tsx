import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import BotonAccion from "../_componentes/BotonAccion";

export default function Pantalla() {
  const [rol, setRol] = useState(null);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [cargando, setCargando] = useState(true); // <--- Estado de carga
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
  const cerrarSesionTotal = async () => {
    await SecureStore.deleteItemAsync("mi_token_jwt");
    setRol(null); // Limpia el estado del rol
    setId(null);
    setNombre(null);
    setTimeout(() => {
      router.replace("/inicio");
    }, 100); // Redirige al login
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pantalla cargada correctamente</Text>
      <BotonAccion
        titulo="Cerrar sesión"
        onPress={cerrarSesionTotal}
        color="#e74c3c"
      />
    </View>
  );
}
