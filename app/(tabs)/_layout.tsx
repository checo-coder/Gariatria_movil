import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { programarNotificacionesGlobal } from "../../_utils/notificaciones";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabsLayout() {
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const arrancarApp = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          const rolUsuario = decoded.rol?.toLowerCase();
          setRol(rolUsuario);

          if (rolUsuario === "persona mayor") {
            const idPaciente = await SecureStore.getItemAsync("idDelPaciente");
            if (idPaciente) {
              sincronizarAlarmasSilenciosamente(idPaciente, token);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar el rol:", error);
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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("medicamentos", {
          name: "Recordatorios de Medicinas",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0984E3",
        });
      }

      const respuesta = await fetch(
        `http://192.168.100.38:4000/tomas/${idPaciente}`,
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
        await programarNotificacionesGlobal(datos);
      }
    } catch (error) {
      console.log("Error al sincronizar alarmas:", error);
    }
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0984E3",
        tabBarInactiveTintColor: "#636E72",
        tabBarShowLabel: false, // Regresamos al look limpio sin texto

        // Esto centra los iconos verticalmente en la barra clásica
        tabBarItemStyle: {
          height: 65,
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarStyle: styles.classicTabBar,

        headerStyle: styles.headerStyle,
        headerTintColor: "#FFFFFF",
        headerTitleStyle: styles.headerTitle,
        headerRight: () => (
          <Ionicons
            name="settings-outline"
            size={26}
            color="white"
            style={styles.headerIcon}
            onPress={() => router.push("/homepm")}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      {/* ICONOS QUE TE GUSTARON (Mezcla de MCI e Ionicons) */}
      <Tabs.Screen
        name="homecuidador"
        options={{
          title: "Mapa",
          href: rol === "cuidador" ? "/homecuidador" : null,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={30}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="comunicacio"
        options={{
          title: "Chat",
          href: rol === "cuidador" ? "/comunicacio" : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="historial"
        options={{
          title: "Reportes",
          href: rol === "cuidador" ? "/historial" : null,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clipboard-text-clock"
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="medicamentos"
        options={{
          title: "Medicina",
          href: rol === "persona mayor" ? "/medicamentos" : null,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pill" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="evaluaciones"
        options={{
          title: "Estado",
          href: rol === "persona mayor" ? "/evaluaciones" : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="fitness" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="homepm" options={{ href: null, title: "Ajustes" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  // BARRA CLÁSICA (Sin position absolute para no tapar nada)
  classicTabBar: {
    backgroundColor: "#f2fbfcff",
    height: 65,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",

    // Sombra sutil para separar del contenido
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    // Eliminamos paddings extras
    paddingBottom: 0,
  },
  headerStyle: {
    backgroundColor: "#2D3436",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  headerIcon: {
    marginRight: 20,
  },
});
