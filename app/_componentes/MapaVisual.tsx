import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import MapView, {
    Circle,
    LongPressEvent,
    Marker,
    PROVIDER_GOOGLE,
} from "react-native-maps";

// 1. DEFINIMOS LA INTERFACE (El contrato de los datos)
interface MapaVisualProps {
  ubicacionPaciente: {
    latitude: number;
    longitude: number;
  };
  zonaAMostrar: {
    latitude: number;
    longitude: number;
    radius: number;
  } | null; // Puede ser nulo si no hay zona creada
  modoEdicion: boolean;
  // Especificamos que es una función que recibe un evento de presión larga
  manejarPresionLarga: (e: LongPressEvent) => void;
}

// 2. APLICAMOS LA INTERFACE AL COMPONENTE
export default function MapaVisual({
  ubicacionPaciente,
  zonaAMostrar,
  modoEdicion,
  manejarPresionLarga,
}: MapaVisualProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.mapa}
      showsUserLocation={true}
      onLongPress={manejarPresionLarga}
      initialRegion={{
        ...ubicacionPaciente,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* Marcador del Paciente */}
      <Marker coordinate={ubicacionPaciente} title="Paciente" pinColor="red" />

      {/* Marcador y Círculo de la Geocerca */}
      {zonaAMostrar && (
        <>
          <Marker
            coordinate={{
              latitude: zonaAMostrar.latitude,
              longitude: zonaAMostrar.longitude,
            }}
            title={modoEdicion ? "Arrastra para mover" : "Centro de Zona"}
            pinColor={modoEdicion ? "orange" : "green"}
            draggable={modoEdicion}
            // Aquí usamos el mismo manejador para el arrastre
            onDragEnd={(e) => manejarPresionLarga(e as any)}
          />
          <Circle
            center={{
              latitude: zonaAMostrar.latitude,
              longitude: zonaAMostrar.longitude,
            }}
            radius={zonaAMostrar.radius}
            strokeColor={
              modoEdicion
                ? "rgba(243, 156, 18, 0.8)"
                : "rgba(46, 204, 113, 0.8)"
            }
            fillColor={
              modoEdicion
                ? "rgba(243, 156, 18, 0.2)"
                : "rgba(46, 204, 113, 0.2)"
            }
          />
        </>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapa: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
