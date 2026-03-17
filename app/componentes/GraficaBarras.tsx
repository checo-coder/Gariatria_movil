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

  // Función para obtener el nombre del día según una fecha
  const obtenerNombreDia = (fechaObj: Date) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dias[fechaObj.getDay()];
  };

  // Lógica para generar los últimos 7 días terminando en HOY
  const procesarSemanales = () => {
    const listaFinal = [];
    const hoy = new Date();

    for (let i = 6; i >= 0; i--) {
      const fechaBucle = new Date();
      // Restamos i días a la fecha actual
      fechaBucle.setDate(hoy.getDate() - i);

      // Formato YYYY-MM-DD manual para evitar desfases de zona horaria de toISOString
      const año = fechaBucle.getFullYear();
      const mes = String(fechaBucle.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaBucle.getDate()).padStart(2, "0");
      const fechaFormateada = `${año}-${mes}-${dia}`;

      // Buscamos si existe actividad en los datos que vienen del servidor
      const coincidencia = datos.find((item) => {
        // Normalizamos la fecha del item (quitando horas si las trae)
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
    propsForLabels: {
      fontSize: 10,
    },
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
        verticalLabelRotation={0}
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
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495e",
  },
  chart: {
    borderRadius: 16,
    marginRight: 15,
  },
});

export default GraficaBarras;
