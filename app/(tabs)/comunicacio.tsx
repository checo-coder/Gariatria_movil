import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

// --- IMPORTACIÓN DE COMPONENTES MODULARES ---
import { ChatHeader } from "../_componentes/ChatHeader";
import { ChatInput } from "../_componentes/ChatInput";
import { MensajeBurbuja } from "../_componentes/MensajeBurbuja";

// 1. INTERFACES
interface Mensaje {
  id_mensaje?: number;
  id_conversacion: number;
  id_remitente?: number;
  tipo_remitente: string;
  contenido_texto: string;
  fechaEnvio?: string | Date;
}

interface Medico {
  id_geriatra: number;
  nombre: string;
  apellidop: string;
  apellidom: string;
  cedula: string;
}

const API_URL = "http://192.168.100.38:4000";

export default function ChatScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [idChat, setIdChat] = useState<number | null>(null);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [rolUsuario, setRolUsuario] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  const socket = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const inicializarChat = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (!token) return;

        // A. Decodificar mi rol para saber de qué lado poner mis burbujas
        const decoded: any = jwtDecode(token);
        setRolUsuario(decoded.rol);

        // B. Obtener mi Geriatra (usando la nueva ruta de asignación)
        const resMed = await fetch(`${API_URL}/api/chat/mi-geriatra`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resMed.ok) throw new Error("No se encontró médico");
        const datosMed = await resMed.json();
        setMedico(datosMed);

        // C. Obtener/Crear conversación
        const resChat = await fetch(
          `${API_URL}/api/chat/conversacion/${datosMed.id_geriatra}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const datosChat = await resChat.json();
        setIdChat(datosChat.id_conversacion);

        // D. Cargar Historial
        const resMsgs = await fetch(
          `${API_URL}/api/chat/mensajes/${datosChat.id_conversacion}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const historial = await resMsgs.json();
        setMensajes(historial);

        // E. Conexión Real-Time vía Sockets
        socket.current = io(API_URL);
        socket.current.emit("unirse-chat", datosChat.id_conversacion);

        socket.current.on("recibir-mensaje", (msg: Mensaje) => {
          setMensajes((prev) => [...prev, msg]);
        });
      } catch (error) {
        console.error("Error inicializando chat:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarChat();

    // Limpieza al salir de la pantalla
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const manejarEnvio = async () => {
    if (!nuevoMensaje.trim() || !idChat || !socket.current) return;

    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");

      const objetoMensaje = {
        id_conversacion: idChat,
        contenido_texto: nuevoMensaje,
        tipo_remitente: rolUsuario, // "cuidador" o "Persona Mayor"
      };

      // 1. Guardar en Base de Datos
      const res = await fetch(`${API_URL}/api/chat/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(objetoMensaje),
      });

      const mensajeGuardado = await res.json();

      // 2. Notificar por Socket a los demás
      socket.current.emit("enviar-mensaje", mensajeGuardado);

      setNuevoMensaje(""); // Limpiar input
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 170 : 90}
      >
        {/* Componente Modular: Header con datos del médico */}
        <ChatHeader medico={medico} />

        {/* Lista de Mensajes con scroll automático al final */}
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item, index) =>
            item.id_mensaje?.toString() || index.toString()
          }
          contentContainerStyle={styles.listaScroll}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <MensajeBurbuja
              item={item}
              esMio={item.tipo_remitente === rolUsuario}
            />
          )}
        />

        {/* Componente Modular: Barra de entrada de texto */}
        <ChatInput
          mensaje={nuevoMensaje}
          setMensaje={setNuevoMensaje}
          onSend={manejarEnvio}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listaScroll: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
});
