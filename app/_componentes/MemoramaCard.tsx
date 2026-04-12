import React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");
// Calculamos el tamaño para que quepan 3 o 4 por fila
const CARD_SIZE = width * 0.22;

interface Props {
  image: string;
  estaVolteada: boolean;
  onClick: () => void;
}

const MemoramaCard = ({ image, estaVolteada, onClick }: Props) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onClick}
      activeOpacity={0.7}
    >
      {estaVolteada ? (
        <Image
          source={{ uri: image }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={{ uri: "https://deckofcardsapi.com/static/img/back.png" }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.4, // Proporción de carta de baraja
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "95%",
    height: "95%",
  },
});

export default MemoramaCard;
