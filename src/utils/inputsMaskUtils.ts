
/* ───────── Máscaras (funções puras, reutilizadas na RegisterForms) ───────── */
export const formatDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length > 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  if (cleaned.length > 4) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}`;
  return cleaned;
};

export const formatPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length > 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length > 2) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length > 0) return `(${cleaned}`;
  return cleaned;
};

export const formatCep = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  return cleaned;
};


