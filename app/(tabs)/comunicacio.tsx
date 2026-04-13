import { ChevronLeft, Image as ImageIcon, Send } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- DATOS DE PRUEBA (MOCK DATA) ---
const MENSAJES_MOCK = [
  {
    _id: "1",
    text: "Hola Dr. ¿Cómo está el paciente?",
    senderId: "cuidador_id",
    createdAt: new Date(),
  },
  {
    _id: "2",
    text: "Todo bien, los niveles de glucosa están estables.",
    senderId: "geriatra_id",
    createdAt: new Date(),
  },
  {
    _id: "3",
    text: "Perfecto, le envío la foto de la receta.",
    senderId: "cuidador_id",
    image: "https://via.placeholder.com/150",
    createdAt: new Date(),
  },
];

export default function ChatScreen() {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState(MENSAJES_MOCK);
  const miId = "cuidador_id"; // Esto vendrá de tu JWT después

  const renderItem = ({ item }: any) => {
    const esMio = item.senderId === miId;

    return (
      <View
        style={[
          styles.contenedorBurbuja,
          esMio ? styles.miMensaje : styles.otroMensaje,
        ]}
      >
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.imagenMensaje} />
        )}
        {item.text && (
          <Text style={esMio ? styles.textoMio : styles.textoOtro}>
            {item.text}
          </Text>
        )}
        <Text style={styles.hora}>10:30 AM</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {/* Encabezado Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity>
          <ChevronLeft color="#2c3e50" size={28} />
        </TouchableOpacity>
        <View style={styles.infoUsuario}>
          <Text style={styles.nombreChat}>Dr. Roberto Gómez</Text>
          <Text style={styles.estadoChat}>En línea</Text>
        </View>
      </View>

      {/* Lista de Mensajes */}
      <FlatList
        data={mensajes}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listaMensajes}
      />

      {/* Barra de Entrada */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.botonIcono}>
          <ImageIcon color="#7f8c8d" size={24} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChangeText={setMensaje}
          multiline
        />

        <TouchableOpacity style={styles.botonEnviar}>
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    paddingTop: 50,
    elevation: 2,
  },
  infoUsuario: { marginLeft: 15 },
  nombreChat: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  estadoChat: { fontSize: 12, color: "#27ae60" },
  listaMensajes: { padding: 15 },
  contenedorBurbuja: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  miMensaje: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
    borderBottomRightRadius: 2,
  },
  otroMensaje: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 2,
  },
  textoMio: { color: "white", fontSize: 15 },
  textoOtro: { color: "#2c3e50", fontSize: 15 },
  imagenMensaje: { width: 200, height: 150, borderRadius: 10, marginBottom: 5 },
  hora: {
    fontSize: 10,
    color: "rgba(0,0,0,0.4)",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f2f6",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    maxHeight: 100,
  },
  botonEnviar: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  botonIcono: { padding: 5 },
});
