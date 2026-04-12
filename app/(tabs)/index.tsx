import * as Location from "expo-location"; // Para el GPS
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client"; // Para el tiempo real

// Importación de tus componentes
import GraficaBarras from "../_componentes/GraficaBarras";
import GraficaCalor from "../_componentes/GraficaCalor";
import GraficaRosca from "../_componentes/GraficaRosca";
import MenuJuegos from "../_componentes/MenuJuegos";

// 1. Configuración del Socket (Usa la IP de tu servidor)
const socket = io("http://192.168.100.38:4000");

// 2. Definición de tipos para TypeScript
interface Estadistica {
  date: string;
  count: number;
}

interface MedStats {
  estado: string;
  cantidad: number;
}

export default function PantallaPrincipal() {
  const [rol, setRol] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estados de datos para el Cuidador
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [medsHoy, setMedsHoy] = useState<MedStats[]>([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  const router = useRouter();

  // --- EFECTO 1: OBTENER DATOS DEL USUARIO ---
  useEffect(() => {
    const obtenerDatosToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (token) {
          const decoded: any = jwtDecode(token);
          setRol(decoded.rol);
          setId(decoded.idUsuario);
          setNombre(decoded.nombre);
        }
      } catch (error) {
        console.error("Error al leer token:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatosToken();
  }, []);

  // --- EFECTO 2: RASTREO GPS (Solo si es Persona Mayor) ---
  useEffect(() => {
    if (rol === "Persona Mayor" && id) {
      iniciarRastreoRealtime();
    }
  }, [rol, id]);

  const iniciarRastreoRealtime = async () => {
    try {
      // Pedir permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permiso de GPS denegado");
        return;
      }

      // Empezar a vigilar la posición y emitir por socket
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Cada 10 segundos
          distanceInterval: 10, // O cada 10 metros
        },
        (loc) => {
          socket.emit("enviar-ubicacion", {
            id_paciente: id,
            latitud: loc.coords.latitude,
            longitud: loc.coords.longitude,
          });
        },
      );
    } catch (err) {
      console.error("Error en configuración de rastreo:", err);
    }
  };

  // --- EFECTO 3: CARGAR ESTADÍSTICAS (Solo si es Cuidador) ---
  useEffect(() => {
    if (!id || rol !== "cuidador") return;

    const cargarDatosPanel = async () => {
      try {
        setCargandoEstadisticas(true);

        // Peticiones paralelas
        const [resGral, resMeds] = await Promise.all([
          fetch(`http://192.168.100.38:4000/estadisticas/${id}`),
          fetch(
            `http://192.168.100.38:4000/estadisticas/medicamentos-hoy/${id}`,
          ),
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
          <View style={styles.badgeRastreo}>
            <Text style={styles.textoBadge}>
              🛡️ Rastreo de seguridad activo
            </Text>
          </View>
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
