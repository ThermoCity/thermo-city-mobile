import axios from "axios";

const API_HEAT_ALERTS_URL = process.env.EXPO_PUBLIC_API_NET_HEAT_ALERTS;

// -------------------- SERVICE DA API DE CLIMA .NET  --------------------

export const getHeatAlertsService = async () => {
  try {
    const response = await axios.get(API_HEAT_ALERTS_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar alertas de calor:', error);
    throw error;
  }
}