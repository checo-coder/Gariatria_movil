import * as SecureStore from "expo-secure-store";
import { ChevronLeft, Send, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

// 1. INTERFACES PARA TYPESCRIPT
interface Mensaje {
  id_mensaje?: number;
  id_conversacion: number;
  id_remitente?: number;
  tipo_remitente: "cuidador" | "geriatra" | "Persona Mayor";
  contenido_texto: string;
  fecha_envio?: string | Date;
}

interface Medico {
  id_geriatra: number;
  nombre: string;
}

const API_URL = "http://192.168.100.38:4000";

export default function ChatScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [idChat, setIdChat] = useState<number | null>(null);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [cargando, setCargando] = useState(true);

  const socket = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets(); // 🚀 Para calcular espacios del notch

  useEffect(() => {
    const inicializarTodo = async () => {
      try {
        const token = await SecureStore.getItemAsync("mi_token_jwt");
        if (!token) return;

        // A. Obtener médico asignado
        const resMed = await fetch(`${API_URL}/api/chat/mi-geriatra`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resMed.ok) throw new Error("No médico");
        const datosMed = await resMed.json();
        setMedico(datosMed);

        // B. Obtener ID de conversación
        const resChat = await fetch(
          `${API_URL}/api/chat/conversacion/${datosMed.id_geriatra}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const datosChat = await resChat.json();
        setIdChat(datosChat.id_conversacion);

        // C. Cargar historial
        const resMsgs = await fetch(
          `${API_URL}/api/chat/mensajes/${datosChat.id_conversacion}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const historial = await resMsgs.json();
        setMensajes(historial);

        // D. Conectar Socket
        socket.current = io(API_URL);
        socket.current.emit("unirse-chat", datosChat.id_conversacion);
        socket.current.on("recibir-mensaje", (msg: Mensaje) => {
          setMensajes((prev) => [...prev, msg]);
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarTodo();
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !idChat || !socket.current) return;
    try {
      const token = await SecureStore.getItemAsync("mi_token_jwt");
      const dataMsg: Mensaje = {
        id_conversacion: idChat,
        contenido_texto: nuevoMensaje,
        tipo_remitente: "cuidador",
      };

      const res = await fetch(`${API_URL}/api/chat/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataMsg),
      });

      const mensajeGuardado = await res.json();
      socket.current.emit("enviar-mensaje", mensajeGuardado);
      setNuevoMensaje("");
    } catch (error) {
      console.error(error);
    }
  };

  if (cargando)
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // 🚀 AJUSTE CLAVE: Si se sigue tapando, sube este número a 100 o 110
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}
      >
        {/* Header Compacto */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <ChevronLeft color="#2c3e50" size={24} />
          </TouchableOpacity>
          <View style={styles.avatarMini}>
            <User color="white" size={16} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Dr. {medico?.nombre}
            </Text>
            <Text style={styles.headerSub}>En línea</Text>
          </View>
        </View>

        {/* Lista de Mensajes */}
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.lista}
          style={{ flex: 1 }} // Obliga a la lista a ocupar el espacio y comprimirse
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const esMio = item.tipo_remitente === "cuidador";
            return (
              <View style={[styles.burbuja, esMio ? styles.mia : styles.otra]}>
                <Text
                  style={[
                    styles.textoMsg,
                    esMio ? styles.textoMio : styles.textoOtro,
                  ]}
                >
                  {item.contenido_texto}
                </Text>
              </View>
            );
          }}
        />

        {/* Barra de Entrada (Input) */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChangeText={setNuevoMensaje}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: nuevoMensaje.trim() ? "#3498db" : "#bdc3c7",
                },
              ]}
              onPress={enviarMensaje}
              disabled={!nuevoMensaje.trim()}
            >
              <Send color="white" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8, // 👈 Altura reducida
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  backBtn: { marginRight: 10 },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  headerSub: { fontSize: 11, color: "#27ae60" },
  lista: { paddingHorizontal: 15, paddingVertical: 15 },
  burbuja: { maxWidth: "85%", padding: 12, borderRadius: 18, marginBottom: 8 },
  mia: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
    borderBottomRightRadius: 2,
  },
  otra: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderBottomLeftRadius: 2,
  },
  textoMsg: { fontSize: 15, lineHeight: 20 },
  textoMio: { color: "white" },
  textoOtro: { color: "#333" },
  inputWrapper: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
});
