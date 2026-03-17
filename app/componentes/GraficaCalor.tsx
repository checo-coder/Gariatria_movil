import React from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";

// Definimos qué datos necesita recibir el componente
interface Props {
  datos: { date: string; count: number }[];
  cargando: boolean;
  titulo: string;
}

const screenWidth = Dimensions.get("window").width;

const GraficaCalor = ({ datos, cargando, titulo }: Props) => {
  if (cargando) return <ActivityIndicator size="small" color="#3498db" />;

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        {titulo}
      </Text>
      <ContributionGraph
        values={datos}
        endDate={new Date()}
        numDays={70} // Mostrar la última semana
        width={Dimensions.get("window").width - 70}
        height={220}
        tooltipDataAttrs={(value) => ({})}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
      />
    </View>
  );
};

export default GraficaCalor;
