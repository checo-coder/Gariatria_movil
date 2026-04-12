// app/_componentes/GraficaRosca.tsx
import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

interface Props {
  datos: { estado: string; cantidad: number }[];
  cargando: boolean;
}

const screenWidth = Dimensions.get("window").width;

const GraficaRosca = ({ datos, cargando }: Props) => {
  if (cargando) return <ActivityIndicator size="small" color="#e67e22" />;

  // Colores amigables según el estado
  const colores: Record<string, string> = {
    tomado: "#2ecc71", // Verde
    pendiente: "#f1c40f", // Amarillo
    omitido: "#e74c3c", // Rojo
  };

  // Mapeamos los datos de la BD al formato que pide la gráfica
  const data = datos.map((item) => ({
    name: item.estado.toUpperCase(),
    population: item.cantidad,
    color: colores[item.estado] || "#bdc3c7",
    legendFontColor: "#2c3e50",
    legendFontSize: 12,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Adherencia Médica (Hoy)</Text>
      {data.length > 0 ? (
        <PieChart
          data={data}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute // Muestra el número real, no porcentaje
          hasLegend={true}
        />
      ) : (
        <Text style={styles.sinDatos}>
          No hay medicamentos programados para hoy
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    alignItems: "center",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  sinDatos: { color: "#95a5a6", marginVertical: 20 },
});

export default GraficaRosca;
