import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
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
    <Tabs screenOptions={{ tabBarActiveTintColor: "#3498db" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="homecuidador"
        options={{
          title: "Pacientes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="homepm"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
