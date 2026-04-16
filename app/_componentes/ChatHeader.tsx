import { useRouter } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ChatHeader = ({ medico }: { medico: any }) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ChevronLeft color="#2c3e50" size={24} />
      </TouchableOpacity>
      <View style={styles.avatarMini}>
        <User color="white" size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {/* Combinamos los nuevos campos del backend */}
          Dr. {medico?.nombre} {medico?.apellidop}
        </Text>
        <Text style={styles.headerSub}>
          Cédula: {medico?.cedula || "Verificada"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  backBtn: { marginRight: 10 },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  headerSub: { fontSize: 11, color: "#7f8c8d" },
});
