import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
// Asegúrate de que la ruta coincida con donde creaste tu archivo
import { programarNotificacionesGlobal } from "../../_utils/notificaciones";

// ==========================================
// CONFIGURACIÓN GLOBAL DE NOTIFICACIONES
// ==========================================
// Esto asegura que la notificación suene y se muestre en pantalla
// incluso si el abuelito está usando la app en ese momento.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabsLayout() {
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const arrancarApp = async () => {
      try {
        // Usamos tu estándar de JWT
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          const rolUsuario = decoded.rol?.toLowerCase();
          setRol(rolUsuario); // Lo pasamos a minúsculas por seguridad

          if (rolUsuario === "persona mayor") {
            const idPaciente = await SecureStore.getItemAsync("idDelPaciente");
            if (idPaciente) {
              sincronizarAlarmasSilenciosamente(idPaciente, token);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar el rol o sincronizar:", error);
      } finally {
        setCargando(false);
      }
    };
    arrancarApp();
  }, []);

  const sincronizarAlarmasSilenciosamente = async (
    idPaciente: string,
    token: string,
  ) => {
    try {
      // 1. Pedimos permisos. Si es la primera vez saldrá un cartel,
      // si ya dio permiso antes, pasa directo.
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      // 2. Configuración obligatoria para Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("medicamentos", {
          name: "Recordatorios de Medicinas",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3498db",
        });
      }

      // 3. Descargamos la agenda del día
      // ⚠️ Asegúrate de que esta sea tu IP actual
      const respuesta = await fetch(
        `http://192.168.100.13:4000/tomas/${idPaciente}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        // 4. Mandamos los datos a nuestra función para que ponga las alarmas
        await programarNotificacionesGlobal(datos);
      }
    } catch (error) {
      console.log("Error al sincronizar alarmas en segundo plano:", error);
    }
  };

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

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

      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial de Medicamentos",
          href: rol === "cuidador" ? "/historial" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* BOTONES PARA AMBOS ROLES */}
      <Tabs.Screen
        name="medicamentos"
        options={{
          title: "Agenda Médica",
          href: rol === "persona mayor" ? "/medicamentos" : null,
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
