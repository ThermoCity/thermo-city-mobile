import * as Notifications from 'expo-notifications';
import { getHeatAlertsService } from './.netThermoCityService';

// Configuração padrão de comportamento das notificações em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Valida o nível de calor atual ou dos próximos dias e dispara a notificação após 5 segundos.
 * @param {string} minLevel 
 */
export const scheduleHeatAlertNotification = async (minLevel: string) => {
  try {
    const numericTarget = parseInt(minLevel.replace('NC', ''), 10) || 3;
    const alertData = await getHeatAlertsService();

    let title = 'Alerta de Calor ThermoCity';
    let body = '';
    let triggered = false;

    const hojeNivel = alertData?.hoje?.nivel || 1;
    const hojeNome = alertData?.hoje?.nome || 'Alerta';

    if (hojeNivel >= numericTarget) {
      title = `Alerta Ativo: ${minLevel} (${hojeNome})`;
      body = `Atenção! Hoje o nível de calor atingiu o ${minLevel}. Hidrate-se e evite exposição solar prolongada.`;
      triggered = true;
    } else {
      // Verifica nos próximos dias
      const proximoDiaMatch = (alertData?.proximosDias || []).find(
        (d : any) => (d.nivel || 1) >= numericTarget
      );

      if (proximoDiaMatch) {
        title = `Previsão de Calor: ${minLevel}`;
        body = `Atenção: o ${minLevel} (${proximoDiaMatch.nome || 'Alerta'}) ocorrerá na data (${proximoDiaMatch.data}). Prepare-se!`;
        triggered = true;
      }
    }

    if (triggered) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });
    }
  } catch (error) {
    console.error('Erro ao verificar boletim para notificação de calor:', error);
  }
};

