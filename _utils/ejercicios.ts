// app/_utils/ejercicios.ts

export const DATOS_EJERCICIOS: Record<string, any> = {
  "1": {
    nombre: "Fuerza de Piernas",
    instruccion:
      "Siéntate en una silla firme. Cruza los brazos y levántate y siéntate 5 veces lo más rápido que puedas.",
    animacion: require("../assets/images/fuerza-de-piernas.png"),
    unidad: "Repeticiones",
    placeholder: "Ej: 12",
  },
  "2": {
    nombre: "Flexibilidad",
    instruccion:
      "Sentado en el borde de la silla, extiende una pierna e intenta tocar la punta de tu pie sin doblar la rodilla.",
    animacion: require("../assets/images/flexibiilidad.png"),
    unidad: "Distancia (cm del pie)",
    placeholder: "Ej: 0 si llegaste al pie",
  },
  "3": {
    nombre: "Caminata",
    instruccion:
      "Sal y camina un rato mientras observas los paisajes o si prefieres Levanta las rodillas a la altura de la cadera alternando piernas, como si caminaras sin moverte de tu lugar por 2 minutos.",
    animacion: require("../assets/images/caminata.png"),
    unidad: "Tiempo (minutos)",
    placeholder: "Ej: 2",
  },
  "4": {
    nombre: "Fuerza de Brazos",
    instruccion:
      "Sentado, toma una botella de agua pequeña y flexiona el codo subiendo y bajando el peso durante 3 minutos.",
    animacion: require("../assets/images/fuerza-de-brazos.png"),
    unidad: "Repeticiones",
    placeholder: "Ej: 15",
  },
};
