export interface DecodedToken {
  iss?: string;
  sub?: string;       // e-mail do usuário
  papel?: string;     // "GESTOR" ou "CIDADAO" (conforme seu payload)
  idUsuario?: number; // ID numérico do usuário
  iat?: number;
  exp?: number;
}

export function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

export function extractRoleFromToken(token: string): 'agente' | 'cidadao' {
  const decoded = decodeJWT(token);
  if (!decoded?.papel) return 'cidadao';

  const papel = decoded.papel.toUpperCase();

  if (papel === 'GESTOR' || papel === 'AGENTE') {
    return 'agente';
  }

  return 'cidadao';
}