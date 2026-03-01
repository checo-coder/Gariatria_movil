import { StyleSheet, Text, TouchableOpacity } from "react-native";

// Definimos qué cosas pueden cambiar (props)
interface Props {
  titulo: string;
  onPress: () => void;
  color?: string; // El signo ? lo hace opcional
}

export default function BotonAccion({
  titulo,
  onPress,
  color = "#37b5be",
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
