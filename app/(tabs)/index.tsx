import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Componentes del proyecto
import GraficaBarras from "../_componentes/GraficaBarras";
import GraficaCalor from "../_componentes/GraficaCalor";
import GraficaRosca from "../_componentes/GraficaRosca";
import MenuJuegos from "../_componentes/MenuJuegos";

// =====================================================================
// 1. CONFIGURACIÓN Y TAREA DE FONDO
// =====================================================================
const API_URL = "http://192.168.100.38:4000";
const TAREA_RASTREO_ABUELITO = "TAREA_RASTREO_ABUELITO";

let ultimaLat = 0;
let ultimaLon = 0;

TaskManager.defineTask(TAREA_RASTREO_ABUELITO, async ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data as any;
    const latitud = locations[0].coords.latitude;
    const longitud = locations[0].coords.longitude;

    if (latitud === ultimaLat && longitud === ultimaLon) return;

    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (!token) return;
      const decoded: any = jwtDecode(token);

      ultimaLat = latitud;
      ultimaLon = longitud;

      await fetch(`${API_URL}/ubicacion-fondo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: decoded.idUsuario,
          latitud,
          longitud,
        }),
      });
    } catch (e) {
      console.log("Error en envío de fondo");
    }
  }
});

// =====================================================================
// 2. COMPONENTE PRINCIPAL
// =====================================================================
export default function PantallaPrincipal() {
  const [rol, setRol] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [rastreoActivo, setRastreoActivo] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [medsHoy, setMedsHoy] = useState<any[]>([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  // --- EFECTO: CARGAR SESIÓN ---
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          setRol(decoded.rol);
          setId(decoded.idUsuario);
          setNombre(decoded.nombre);

          // Registrar Notificaciones
          if (Device.isDevice) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === "granted") {
              const tokenPush = (await Notifications.getExpoPushTokenAsync())
                .data;
              await fetch(`${API_URL}/guardar-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_cliente: decoded.idUsuario,
                  token: tokenPush,
                }),
              });
            }
          }
        }
      } catch (e) {
        console.error("Error al cargar sesión", e);
      } finally {
        setCargando(false);
      }
    };
    cargarSesion();
  }, []);

  // --- EFECTO: INICIAR GPS ---
  useEffect(() => {
    if (rol === "Persona Mayor" && id) {
      iniciarRastreoSeguro();
    }
  }, [rol, id]);

  const iniciarRastreoSeguro = async () => {
    // 🛡️ REGLA DE ORO: No iniciar si la app no está en primer plano
    if (AppState.currentState !== "active") {
      console.log("Bloqueo preventivo: App en background");
      return;
    }

    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== "granted" || bg !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Por favor activa 'Permitir siempre' la ubicación.",
        );
        return;
      }

      const yaRegistrada = await TaskManager.isTaskRegisteredAsync(
        TAREA_RASTREO_ABUELITO,
      );

      // Si ya está activa, no la reiniciamos para evitar errores de Android
      if (yaRegistrada) {
        console.log("El rastreo ya está en marcha.");
        setRastreoActivo(true);
        return;
      }

      await Location.startLocationUpdatesAsync(TAREA_RASTREO_ABUELITO, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000,
        distanceInterval: 10,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "OldFit: Seguridad Activa",
          notificationBody: "Tu cuidador puede ver tu ubicación.",
          notificationColor: "#3498db",
        },
      });

      setRastreoActivo(true);
      console.log("GPS iniciado con éxito");
    } catch (err) {
      console.error("Error GPS:", err);
    }
  };

  // --- EFECTO: CARGAR PANEL CUIDADOR ---
  useEffect(() => {
    if (id && rol === "cuidador") {
      const cargarDatosCuidador = async () => {
        try {
          const token = await SecureStore.getItemAsync("mi_token_jwt");
          setCargandoEstadisticas(true);
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };
          const [resGral, resMeds] = await Promise.all([
            fetch(`${API_URL}/api/stats/actividad/${id}`, { headers }),
            fetch(`${API_URL}/api/stats/medicamentos-hoy/${id}`, { headers }),
          ]);
          if (resGral.ok) setEstadisticas(await resGral.json());
          if (resMeds.ok) setMedsHoy(await resMeds.json());
        } catch (e) {
          console.error("Error cargando estadísticas");
        } finally {
          setCargandoEstadisticas(false);
        }
      };
      cargarDatosCuidador();
    }
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
        <ScrollView contentContainerStyle={styles.contenedorCuidador}>
          <Text style={styles.tituloBienvenida}>Panel del Cuidador</Text>
          <Text style={styles.subtitulo}>Monitoreando a: {nombre}</Text>

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
              titulo="Consistencia Mensual"
              datos={estadisticas}
              cargando={cargandoEstadisticas}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centrado}>
          <Text>Error de perfil. Por favor, reasigna tu rol.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F5F6FA" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  contenedor: { flex: 1, padding: 20 },
  contenedorCuidador: { padding: 20, alignItems: "center" },
  tituloBienvenida: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 10,
  },
  subtitulo: { fontSize: 16, color: "#7f8c8d", marginBottom: 20 },
  seccion: { width: "100%", marginTop: 15 },
  badgeRastreo: {
    marginTop: 20,
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbdefb",
  },
  textoBadge: { color: "#1976d2", fontWeight: "bold", fontSize: 13 },
});
