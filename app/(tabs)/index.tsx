import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [ultimoReporte, setUltimoReporte] = useState<any>(null);
  const [cargandoReporte, setCargandoReporte] = useState(true);

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

          // Cargamos estadísticas y medicamentos
          const [resGral, resMeds] = await Promise.all([
            fetch(`${API_URL}/api/stats/actividad/${id}`, { headers }),
            fetch(`${API_URL}/api/stats/medicamentos-hoy/${id}`, { headers }),
          ]);

          if (resGral.ok) setEstadisticas(await resGral.json());
          if (resMeds.ok) setMedsHoy(await resMeds.json());

          // 🔥 LLAMAMOS A LOS REPORTES
          await fetchUltimoReporte();
        } catch (e) {
          console.error("Error cargando datos del cuidador", e);
        } finally {
          setCargandoEstadisticas(false);
        }
      };
      cargarDatosCuidador();
    }
  }, [id, rol]);

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

  // Cargar PDF de reportes (solo para cuidador)
  const fetchUltimoReporte = async () => {
    try {
      const idPaciente = await SecureStore.getItemAsync("idDelPaciente");
      const token = await SecureStore.getItemAsync("mi_token_jwt");

      if (!idPaciente) {
        console.log("⚠️ No hay id_paciente_asignado");
        setCargandoReporte(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/reportes/ultimo/${idPaciente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // 🔥 LA CORRECCIÓN ESTÁ AQUÍ:
        // Si el servidor manda un [ { ... } ], tomamos el primero data[0]
        if (Array.isArray(data) && data.length > 0) {
          setUltimoReporte(data[0]);
        } else if (data && !Array.isArray(data)) {
          // Si el servidor ya manda el objeto directo
          setUltimoReporte(data);
        } else {
          setUltimoReporte(null);
        }
      } else {
        setUltimoReporte(null);
      }
    } catch (error) {
      console.error("Error fetch reporte:", error);
      setUltimoReporte(null);
    } finally {
      setCargandoReporte(false);
    }
  };

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
          <Text style={styles.subtitulo}>Bienvenido {nombre}</Text>

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
          <View style={styles.seccionHeader}>
            <Text style={styles.tituloSeccion}>Reportes Médicos</Text>
            <TouchableOpacity onPress={() => router.push("/reportes")}>
              <Text style={styles.linkVerTodo}>Ver historial</Text>
            </TouchableOpacity>
          </View>

          {cargandoReporte ? (
            <ActivityIndicator color="#3498db" />
          ) : ultimoReporte ? (
            <TouchableOpacity
              style={styles.tarjetaReporte}
              onPress={() => Linking.openURL(ultimoReporte.url_pdf)}
              activeOpacity={0.8}
            >
              <View style={styles.iconoContenedor}>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={35}
                  color="#e74c3c"
                />
              </View>

              <View style={styles.infoContenedor}>
                <Text style={styles.reporteTitulo} numberOfLines={1}>
                  {ultimoReporte.titulo}
                </Text>
                <Text style={styles.reporteFecha}>
                  Publicado el{" "}
                  {new Date(ultimoReporte.fecha_creacion).toLocaleDateString()}
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#bdc3c7"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>
                No hay reportes médicos aún.
              </Text>
            </View>
          )}
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
  seccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  linkVerTodo: {
    color: "#3498db",
    fontWeight: "600",
    fontSize: 14,
  },
  tarjetaReporte: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    // Sombra para iOS/Android
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconoContenedor: {
    width: 50,
    height: 50,
    backgroundColor: "#fdedec",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContenedor: {
    flex: 1,
    marginLeft: 15,
  },
  reporteTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495e",
  },
  reporteFecha: {
    fontSize: 13,
    color: "#95a5a6",
    marginTop: 2,
  },
  tarjetaVacia: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    alignItems: "center",
  },
  textoVacio: {
    color: "#95a5a6",
    fontStyle: "italic",
  },
  textoBadge: { color: "#1976d2", fontWeight: "bold", fontSize: 13 },
});
