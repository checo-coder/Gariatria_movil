import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ContributionGraph } from "react-native-chart-kit";

interface Props {
  datos: { date: string; count: number }[];
  cargando: boolean;
  titulo: string;
}

const screenWidth = Dimensions.get("window").width;

const GraficaCalor = ({ datos, cargando, titulo }: Props) => {
  if (cargando) return <ActivityIndicator size="small" color="#3498db" />;

  // 🛡️ Seguridad para el ContributionGraph
  const datosSeguros = Array.isArray(datos) ? datos : [];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <ContributionGraph
        values={datosSeguros}
        endDate={new Date()}
        numDays={70}
        width={screenWidth - 40}
        height={220}
        tooltipDataAttrs={() => ({})}
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
    elevation: 2,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
});

export default GraficaCalor;
