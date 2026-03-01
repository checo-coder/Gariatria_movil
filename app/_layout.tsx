import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [estaCargando, setEstaCargando] = useState(true);
  const [sesionActiva, setSesionActiva] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  // 1. Función para verificar si hay un token guardado
  const verificarToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      // Si hay token, sesionActiva será true, si no, false
      setSesionActiva(!!token);
    } catch (e) {
      setSesionActiva(false);
    } finally {
      setEstaCargando(false);
    }
  };

  // 2. Se ejecuta al abrir la aplicación por primera vez
  useEffect(() => {
    verificarToken();
  }, []);

  // Re-verificamos el token cada vez que la ruta cambie
  // Así, al borrar el token y navegar, el Layout se entera inmediatamente
  useEffect(() => {
    verificarToken();
  }, [segments]);

  useEffect(() => {
    if (estaCargando) return;

    const primerSegmento = segments?.[0] as string;

    // Definimos qué rutas son "públicas" (donde se puede estar sin login)
    const enPantallaDeAutenticacion =
      primerSegmento === "inicio" ||
      primerSegmento === "registro" ||
      primerSegmento === undefined || // El index de la raíz (presentación)
      primerSegmento === "index";

    if (!sesionActiva && !enPantallaDeAutenticacion) {
      // Si el usuario NO tiene sesión y quiere entrar a las pestañas, lo mandamos al login
      router.replace("/inicio");
    } else if (sesionActiva && enPantallaDeAutenticacion) {
      // Si el usuario SI tiene sesión y está en el login/presentación, lo mandamos a la app
      router.replace("/(tabs)");
    }
  }, [sesionActiva, estaCargando, segments]);

  // Pantalla de carga mientras se lee el SecureStore
  if (estaCargando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#d0eafdff",
        }}
      >
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tu pantalla de presentación */}
      <Stack.Screen name="index" />
      {/* Tu pantalla de Login */}
      <Stack.Screen name="inicio" />
      {/* Tu pantalla de Registro */}
      <Stack.Screen name="registro" />
      {/* Tu grupo de navegación principal */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
