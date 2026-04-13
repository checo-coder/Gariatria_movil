import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client";

// Importación de tus componentes
import GraficaBarras from "../_componentes/GraficaBarras";
import GraficaCalor from "../_componentes/GraficaCalor";
import GraficaRosca from "../_componentes/GraficaRosca";
import MenuJuegos from "../_componentes/MenuJuegos";

// =====================================================================
// 1. CONFIGURACIÓN GLOBAL
// =====================================================================
const API_URL = "http://192.168.100.38:4000"; // Tu IP
const socket = io(API_URL);
const TAREA_RASTREO_ABUELITO = "TAREA_RASTREO_ABUELITO";

// =====================================================================
// 2. DEFINICIÓN DE LA TAREA EN SEGUNDO PLANO
// =====================================================================
TaskManager.defineTask(TAREA_RASTREO_ABUELITO, async ({ data, error }) => {
  console.log("🔥 ¡TAREA DE FONDO DESPERTÓ!");

  if (error) {
    console.error("❌ Error en tarea de fondo:", error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const latitud = locations[0].coords.latitude;
    const longitud = locations[0].coords.longitude;

    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const idPaciente = decoded.idUsuario;

      await fetch(`${API_URL}/ubicacion-fondo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: idPaciente,
          latitud: latitud,
          longitud: longitud,
        }),
      });
      console.log(`🌐 [Fondo] Coordenada enviada: ${latitud}, ${longitud}`);
    } catch (e) {
      console.error("❌ No se pudo enviar el GPS de fondo:", e);
    }
  }
});

// =====================================================================
// 3. DEFINICIÓN DE TIPOS
// =====================================================================
interface Estadistica {
  date: string;
  count: number;
}

interface MedStats {
  estado: string;
  cantidad: number;
}

// =====================================================================
// 4. COMPONENTE PRINCIPAL
// =====================================================================
export default function PantallaPrincipal() {
  const [rol, setRol] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estados GPS Paciente
  const [rastreoActivo, setRastreoActivo] = useState(false);

  // Estados de datos para el Cuidador
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [medsHoy, setMedsHoy] = useState<MedStats[]>([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  const router = useRouter();

  // =====================================================================
  // FUNCIÓN: REGISTRAR PUSH TOKEN
  // =====================================================================
  const registrarParaNotificacionesPush = async (idUsuario: string) => {
    try {
      if (!Device.isDevice) {
        console.log("Las notificaciones push no funcionan en el simulador");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("¡No se dio permiso para las notificaciones!");
        return;
      }

      // Obtener el token de Expo
      // Nota: Si Expo te pide projectId, ponlo aquí adentro: { projectId: "tu-id" }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log("📲 Push Token obtenido:", token);

      // Enviar el token a PostgreSQL
      await fetch(`${API_URL}/guardar-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: idUsuario,
          token: token,
        }),
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "Alertas de Seguridad",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } catch (error) {
      console.error("Error al registrar notificaciones:", error);
    }
  };

  // --- EFECTO 1: OBTENER DATOS DEL USUARIO Y REGISTRAR TOKEN ---
  useEffect(() => {
    const obtenerDatosToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          setRol(decoded.rol);
          setId(decoded.idUsuario);
          setNombre(decoded.nombre);

          // 🔥 Mandamos a guardar la dirección de este celular
          registrarParaNotificacionesPush(decoded.idUsuario);
        }
      } catch (error) {
        console.error("Error al leer token:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatosToken();
  }, []);

  // --- EFECTO 2: RASTREO GPS AVANZADO (Solo si es Persona Mayor) ---
  useEffect(() => {
    if (rol === "Persona Mayor" && id) {
      iniciarRastreoSeguro();
    }
  }, [rol, id]);

  const iniciarRastreoSeguro = async () => {
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        Alert.alert("Atención", "Necesitamos tu permiso de ubicación.");
        return;
      }

      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Selecciona 'Permitir todo el tiempo'.",
        );
        return;
      }

      const yaEstaCorriendo = await TaskManager.isTaskRegisteredAsync(
        TAREA_RASTREO_ABUELITO,
      );

      // Limpiamos tarea zombi si existe
      if (yaEstaCorriendo) {
        console.log("🧹 Limpiando tarea zombi anterior...");
        await Location.stopLocationUpdatesAsync(TAREA_RASTREO_ABUELITO);
      }

      // Encendemos el motor (Distancia 0 para pruebas)
      await Location.startLocationUpdatesAsync(TAREA_RASTREO_ABUELITO, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Protección Activa",
          notificationBody: "Compartiendo ubicación por tu seguridad.",
          notificationColor: "#2ecc71",
        },
      });
      console.log("✅ Motor de rastreo REINICIADO y ENCENDIDO");
      setRastreoActivo(true);
    } catch (err) {
      console.error("Error al iniciar rastreo seguro:", err);
    }
  };

  // --- EFECTO 3: CARGAR ESTADÍSTICAS (Solo si es Cuidador) ---
  useEffect(() => {
    if (!id || rol !== "cuidador") return;

    const cargarDatosPanel = async () => {
      try {
        setCargandoEstadisticas(true);

        const [resGral, resMeds] = await Promise.all([
          fetch(`${API_URL}/estadisticas/${id}`),
          fetch(`${API_URL}/estadisticas/medicamentos-hoy/${id}`),
        ]);

        const datosGral = resGral.ok ? await resGral.json() : [];
        const datosMeds = resMeds.ok ? await resMeds.json() : [];

        setEstadisticas(Array.isArray(datosGral) ? datosGral : []);
        setMedsHoy(Array.isArray(datosMeds) ? datosMeds : []);
      } catch (e) {
        console.error("Error cargando estadísticas:", e);
        setEstadisticas([]);
        setMedsHoy([]);
      } finally {
        setCargandoEstadisticas(false);
      }
    };

    cargarDatosPanel();
  }, [id, rol]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {rol === "Persona Mayor" ? (
        // --- VISTA PACIENTE ---
        <View style={styles.contenedor}>
          <Text style={styles.tituloBienvenida}>¡Hola, {nombre}!</Text>
          <Text style={styles.subtitulo}>Tus ejercicios de hoy:</Text>
          <MenuJuegos />
          {rastreoActivo && (
            <View style={styles.badgeRastreo}>
              <Text style={styles.textoBadge}>
                🛡️ Rastreo de seguridad activo
              </Text>
            </View>
          )}
        </View>
      ) : rol === "cuidador" ? (
        // --- VISTA CUIDADOR ---
        <ScrollView contentContainerStyle={styles.contenedorCuidador}>
          <Text style={styles.tituloBienvenida}>Panel del Cuidador</Text>
          <Text style={styles.subtitulo}>Paciente: {nombre}</Text>

          <GraficaRosca datos={medsHoy} cargando={cargandoEstadisticas} />

          <View style={styles.seccion}>
            <GraficaBarras
              titulo="Actividad Semanal"
              datos={estadisticas}
              cargando={cargandoEstadisticas}
            />
          </View>

          <View style={styles.seccion}>
            <GraficaCalor
              titulo="Consistencia de Actividad"
              datos={estadisticas}
              cargando={cargandoEstadisticas}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centrado}>
          <Text>Error de sesión. Por favor, vuelve a entrar.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F5F6FA" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  contenedor: { flex: 1, padding: 20, alignItems: "center" },
  contenedorCuidador: { padding: 20, alignItems: "center" },
  tituloBienvenida: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
  },
  subtitulo: { fontSize: 16, color: "#7f8c8d", marginBottom: 20 },
  seccion: { width: "100%", marginTop: 10 },
  badgeRastreo: {
    marginTop: 20,
    backgroundColor: "#dff9fb",
    padding: 10,
    borderRadius: 20,
  },
  textoBadge: { color: "#0097e6", fontWeight: "bold", fontSize: 12 },
});
