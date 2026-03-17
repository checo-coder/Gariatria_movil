import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const cargarRol = async () => {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (token) {
        const decoded: any = jwtDecode(token);
        setRol(decoded.rol?.toLowerCase()); // Lo pasamos a minúsculas por seguridad
      }
    };
    cargarRol();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3498db",
        // Configuración del Header (la barra de arriba)
        headerStyle: { backgroundColor: "#576a7cff" },
        headerTitleStyle: { fontWeight: "bold" },
        headerRight: () => (
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={{ marginRight: 15, fontSize: 38 }}
            onPress={() => router.push("/homepm")} // Ruta a tu pantalla de ajustes
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      {/* Pantallas de cuidadores */}
      <Tabs.Screen
        name="homecuidador"
        options={{
          title: "Mapa",
          href: rol === "cuidador" ? "/homecuidador" : null, // Redirige según el rol
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="comunicacio"
        options={{
          title: "Chat",
          href: rol === "cuidador" ? "/comunicacio" : null, // Redirige según el rol
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={24} color={color} />
          ),
        }}
      />

      {/* BOTONES PARA AMBOS ROLES */}
      <Tabs.Screen
        name="medicamentos"
        options={{
          title: "Medicinas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-number-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* Pantallas para personas mayores */}
      <Tabs.Screen
        name="evaluaciones"
        options={{
          title: "Evaluación",
          href: rol === "persona mayor" ? "/evaluaciones" : null, // Redirige según el rol
          tabBarIcon: ({ color }) => (
            <Ionicons name="accessibility-outline" size={24} color={color} />
          ),
        }}
      />

      {/* BOTON DE CONFIGURACION */}
      <Tabs.Screen
        name="homepm"
        options={{
          title: "Ajustes",
          href: null, // <--- ESTO oculta el botón de la barra de abajo
          headerShown: true, // Pero permite que la pantalla se vea cuando navegues a ella
        }}
      />
    </Tabs>
  );
}
