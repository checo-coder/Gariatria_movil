import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

interface Props {
  datos: { date: string; count: string | number }[];
  cargando: boolean;
  titulo: string;
}

const screenWidth = Dimensions.get("window").width;

const GraficaBarras = ({ datos, cargando, titulo }: Props) => {
  if (cargando) return <ActivityIndicator size="small" color="#3498db" />;

  // 🛡️ Filtro de seguridad: Si datos no es un arreglo, usamos uno vacío
  const datosSeguros = Array.isArray(datos) ? datos : [];

  const obtenerNombreDia = (fechaObj: Date) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dias[fechaObj.getDay()];
  };

  const procesarSemanales = () => {
    const listaFinal = [];
    const hoy = new Date();

    for (let i = 6; i >= 0; i--) {
      const fechaBucle = new Date();
      fechaBucle.setDate(hoy.getDate() - i);

      const año = fechaBucle.getFullYear();
      const mes = String(fechaBucle.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaBucle.getDate()).padStart(2, "0");
      const fechaFormateada = `${año}-${mes}-${dia}`;

      const coincidencia = datosSeguros.find((item) => {
        if (!item || !item.date) return false;
        const fechaItem = item.date.split("T")[0];
        return fechaItem === fechaFormateada;
      });

      listaFinal.push({
        label: obtenerNombreDia(fechaBucle),
        value: coincidencia ? Number(coincidencia.count) : 0,
      });
    }
    return listaFinal;
  };

  const datosListos = procesarSemanales();

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <BarChart
        data={{
          labels: datosListos.map((d) => d.label),
          datasets: [{ data: datosListos.map((d) => d.value) }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero={true}
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495e",
  },
  chart: { borderRadius: 16 },
});

export default GraficaBarras;
