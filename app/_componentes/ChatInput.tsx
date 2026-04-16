import { Send } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export const ChatInput = ({ mensaje, setMensaje, onSend }: any) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        value={mensaje}
        onChangeText={setMensaje}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: mensaje.trim() ? "#3498db" : "#bdc3c7" },
        ]}
        onPress={onSend}
        disabled={!mensaje.trim()}
      >
        <Send color="white" size={18} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: {
    backgroundColor: "white",
    padding: 10,
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
  input: { flex: 1, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
});
