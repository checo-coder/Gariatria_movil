// Archivo: utils/notificaciones.ts
import * as Notifications from "expo-notifications";

export const programarNotificacionesGlobal = async (listaDeTomas: any[]) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const ahora = new Date();

    for (const toma of listaDeTomas) {
      const fechaToma = new Date(toma.fecha_hora_programada);

      if (fechaToma > ahora && toma.estado_toma === "pendiente") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ ¡Hora de tu medicina!`,
            body: `Te toca tomar: ${toma.nombre_medicamento} (${toma.dosis})`,
            data: { id_toma: toma.id_toma },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fechaToma,
            channelId: "medicamentos",
          },
        });
        console.log(`✅ Alarma global lista para: ${toma.nombre_medicamento}`);
      }
    }
  } catch (error) {
    console.error("Error al programar alarmas:", error);
  }
};
