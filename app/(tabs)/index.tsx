import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
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
const API_URL = "https://backendoldfit-production.up.railway.app";
const TAREA_RASTREO_ABUELITO = "TAREA_RASTREO_ABUELITO";

let ultimaLat = 0;
let ultimaLon = 0;

TaskManager.defineTask(TAREA_RASTREO_ABUELITO, async ({ data, error }) => {
  if (error) {
    console.log("🚩 [FLAG 1] Error en TaskManager:", error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    const latitud = locations[0].coords.latitude;
    const longitud = locations[0].coords.longitude;

    console.log("🚩 [FLAG 2] Tarea despertó. Lat:", latitud, "Lon:", longitud);

    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (!token) {
        console.log("🚩 [FLAG 3] Abortado: No hay token en SecureStore");
        return;
      }

      // Evitar envíos duplicados si la posición es idéntica
      if (latitud === ultimaLat && longitud === ultimaLon) return;

      // CORRECCIÓN: Decodificamos ANTES de usar la variable
      const decoded: any = jwtDecode(token);
      console.log("🚩 [FLAG 4] Enviando para Paciente ID:", decoded.idUsuario);

      ultimaLat = latitud;
      ultimaLon = longitud;

      const response = await fetch(`${API_URL}/ubicacion-fondo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: decoded.idUsuario,
          latitud,
          longitud,
        }),
      });

      console.log("🚩 [FLAG 5] Respuesta Servidor (Status):", response.status);
    } catch (e) {
      console.log("🚩 [FLAG 6] Error fatal en envío de fondo:", e);
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
      console.log("🚩 [FLAG 7] Cargando sesión...");
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          console.log("🚩 [FLAG 8] Token decodificado. Rol:", decoded.rol);
          setRol(decoded.rol);
          setId(decoded.idUsuario);
          setNombre(decoded.nombre);

          // if (Device.isDevice) {
          //   const { status } = await Notifications.requestPermissionsAsync();
          //   if (status === "granted") {
          //     const tokenPush = (await Notifications.getExpoPushTokenAsync())
          //       .data;
          //     await fetch(`${API_URL}/api/guardar-token`, {
          //       method: "POST",
          //       headers: { "Content-Type": "application/json" },
          //       body: JSON.stringify({
          //         id_cliente: decoded.idUsuario,
          //         token: tokenPush,
          //       }),
          //     });
          //   }
          // }
        }
      } catch (e) {
        console.error("Error al cargar sesión", e);
      } finally {
        setCargando(false);
      }
    };
    cargarSesion();
  }, []);

  // --- EFECTO: CARGAR PANEL CUIDADOR ---
  useEffect(() => {
    if (id && rol === "cuidador") {
      console.log("🚩 [FLAG 9] Iniciando carga de datos para Cuidador");
      const cargarDatosCuidador = async () => {
        try {
          const token = await SecureStore.getItemAsync("mi_token_jwt");
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const [resGral, resMeds] = await Promise.all([
            fetch(`${API_URL}/api/movil/stats/actividad/${id}`, { headers }),
            fetch(`${API_URL}/api/movil/stats/medicamentos-hoy/${id}`, {
              headers,
            }),
          ]);

          if (resGral.ok) setEstadisticas(await resGral.json());
          if (resMeds.ok) setMedsHoy(await resMeds.json());

          await fetchUltimoReporte();
        } catch (e) {
          console.error("Error cargando datos", e);
        } finally {
          setCargandoEstadisticas(false);
        }
      };
      cargarDatosCuidador();
    }
  }, [id, rol]);

  // --- EFECTO: INICIAR GPS ---
  useEffect(() => {
    // ⚠️ REVISIÓN: Asegúrate de que el rol sea exactamente "Persona Mayor" o "persona mayor"
    if (rol === "Persona Mayor" && id) {
      console.log("🚩 [FLAG 10] Iniciando rastreo seguro para Paciente");
      iniciarRastreoSeguro();
    }
  }, [rol, id]);

  const iniciarRastreoSeguro = async () => {
    if (AppState.currentState !== "active") return;

    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== "granted" || bg !== "granted") {
        Alert.alert("Error", "Debes activar permisos de ubicación 'Siempre'.");
        return;
      }

      const yaRegistrada = await TaskManager.isTaskRegisteredAsync(
        TAREA_RASTREO_ABUELITO,
      );
      if (yaRegistrada) {
        setRastreoActivo(true);
        return;
      }

      await Location.startLocationUpdatesAsync(TAREA_RASTREO_ABUELITO, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: "OldFit: Seguridad Activa",
          notificationBody: "Compartiendo ubicación con tu cuidador.",
          notificationColor: "#3498db",
        },
      });

      setRastreoActivo(true);
      console.log("✅ GPS iniciado con éxito");
    } catch (err) {
      console.error("Error GPS:", err);
    }
  };

  const fetchUltimoReporte = async () => {
    try {
      const idPaciente = await SecureStore.getItemAsync("idDelPaciente");
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      if (!idPaciente) return;

      const res = await fetch(
        `${API_URL}/api/movil/reportes/ultimo/${idPaciente}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setUltimoReporte(Array.isArray(data) ? data[0] : data);
      }
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
  tituloSeccion: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  linkVerTodo: { color: "#3498db", fontWeight: "600", fontSize: 14 },
  tarjetaReporte: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    elevation: 3,
  },
  iconoContenedor: {
    width: 50,
    height: 50,
    backgroundColor: "#fdedec",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContenedor: { flex: 1, marginLeft: 15 },
  reporteTitulo: { fontSize: 16, fontWeight: "bold", color: "#34495e" },
  reporteFecha: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  tarjetaVacia: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    alignItems: "center",
  },
  textoVacio: { color: "#95a5a6", fontStyle: "italic" },
  textoBadge: { color: "#1976d2", fontWeight: "bold", fontSize: 13 },
});
