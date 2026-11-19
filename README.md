# 🌡️ ThermoCity Mobile

Aplicativo móvel e web desenvolvido em **React Native + Expo (TypeScript)** para monitoramento térmico urbano, alertas de ondas de calor e localização de pontos de apoio climatizados e unidades de saúde em **Presidente Prudente – SP**.

---

## 📋 Visão Geral

O **ThermoCity** conecta cidadãos a dados meteorológicos oficiais e serviços territoriais de prevenção contra o calor extremo. A aplicação apresenta o Índice de Calor (IC) atualizado, classificação de risco térmico em 5 níveis (**NC1** a **NC5**), previsão para os próximos dias e um mapa interativo multiplataforma para localizar **Refúgios Climatizados** e **Unidades Básicas de Saúde (UBS)**.

---

## ✨ Principais Funcionalidades

- **Boletim Térmico em Tempo Real:**
  - Exibição da temperatura máxima de índice de calor, critério meteorológico ativo e fonte oficial (**INMET**).
  - Escala visual de níveis de calor (**NC1 – Muito baixo** até **NC5 – Muito alto**) com recomendações preventivas dinâmicas.
  - Previsão estendida para os próximos dias com indicadores de risco térmico.
- **Mapa Interativo Multiplataforma (Mobile & Web):**
  - **Android / iOS (`SupportPointsMapMobile.tsx`):** Renderização nativa via `react-native-maps` com raio de alcance de $2\text{ km}$, marcadores customizados por categoria e interação direta.
  - **Web (`SupportPointsMapWeb.tsx`):** Fallback dedicado com `iframe` interativo do Google Maps e barra de seleção rápida para evitar incompatibilidades de módulos nativos no navegador.
- **Filtros e Listagem Territorial:**
  - Filtragem rápida entre **Todos**, **Refúgios** e **UBS Próximas**, ordenados automaticamente por distância em quilômetros.
  - Modal de detalhes da unidade (`SupportPointDetailsBtModal`) e simulação de rota com verificação de permissão de localização (`expo-location`).
- **Experiência do Usuário & Navegação:**
  - Alternância dinâmica entre **Tema Claro** e **Tema Escuro** (`ThemeToggleButton`).
  - Navegação por abas inferiores (`MainTabs`): **Início**, **Meu Guia**, **Familiares** e **Meu Perfil**, com contexto de autenticação (`AuthProvider`).

---

## 🏗️ Arquitetura e Estrutura de Pastas

```text
thermo-city-mobile/
├── app.config.js                         # Configuração dinâmica do Expo (injeta variáveis de ambiente no build)
├── app.json                              # Configurações base do projeto Expo
├── App.tsx                               # Ponto de entrada e provedores globais
└── src/
    ├── components/
    │   ├── MainTabs.tsx                  
    │   ├── SupportPointCard.tsx          
    │   ├── SupportPointDetailsBtModal.tsx
    │   ├── SupportPointsMapMobile.tsx    
    │   ├── SupportPointsMapWeb.tsx       
    │   ├── ThemeToggleButton.tsx       
    │   └── ThermoLogo.tsx                
    │   └── FamiliarCard.tsx                
    │   └── HeatLevelCard.tsx                
    │   └── HeatTipCard.tsx                
    │   └── VulnerablePersonCard.tsx                
    ├── context/
    │   └── AuthProvider.tsx              # Contexto de autenticação e dados do usuário
    ├── interfaces/
    │   └── interfaces.ts                 # Tipagens TypeScript (SupportPoint, HeatAlertResponse, etc.)
    ├── screens/
    │   └── CitizenHomeScreen.tsx          
    │   └── AgentCitizenGuidanceScreen.tsx   
    │   └── AgentHealthChatScreen.tsx           
    │   └── AgentHomeScreen.tsx           
    │   └── CitizenFamiliarListScreen.tsx           
    │   └── CitizenGuideScreen.tsx          
    │   └── CitizenProfileScreen.tsx          
    │   └── Login.tsx          
    │   └── RegisterForms.tsx          
    ├── services/
    │   ├── .netThermoCityService.ts      
    │   └── javaThermoCityService.js     
    │   └── chatbotAIService.js          
    │   └── firebaseConfig.js      
    ├── theme/
    │   ├── shadowTheme.ts                # Sombras adaptativas por tema
    │   └── thermoTheme.ts                # Paleta de cores e tokens visuais
    └── utils/
        ├── placeUtils.ts                 
        └── thermoCityUtils.ts            
        └── inputsMaskUtils.ts           
        └── jwtUtils.ts            
        └── placeUtils.ts            
```

---

## 🛠️ Tecnologias Utilizadas

- **Core:** React Native, Expo SDK, TypeScript
- **Mapas & Geolocalização:** `react-native-maps`, `expo-location`
- **Ícones & UI:** `@expo/vector-icons` (Ionicons), StyleSheet dinâmico com suporte a Dark Mode
- **Build & Deploy:** EAS Build (`eas-cli`) & EAS Secrets

---

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos
- Node.js (LTS)
- Expo CLI / EAS CLI (`npm install -g eas-cli`)
- Conta no **Google Cloud Console** com a **Maps SDK for Android** habilitada

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (não versionado) com a chave da API do Google Maps:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
```

O arquivo `app.config.js` injeta essa variável automaticamente em `expo.android.config.googleMaps.apiKey` durante a compilação:

```javascript
module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
  };
};
```

---

## 🚀 Executando o Projeto

### Ambiente Web
O carregamento condicional em `CitizenHomeScreen.tsx` isola `react-native-maps` para evitar erros de módulos nativos no navegador:

```bash
npx expo start --web --clear
```

### Ambiente Mobile (Desenvolvimento)
```bash
npx expo start
```

---

## 📦 Build Android (APK) via EAS

1. **Cadastre a chave nos Secrets do EAS** (necessário para builds na nuvem):
   ```bash
   npx eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "SUA_CHAVE_AQUI" --type string
   ```

2. **Valide a configuração compilada:**
   ```bash
   npx expo config --json
   ```

3. **Gere o APK de preview:**
   ```bash
   npx eas build --platform android --profile preview
   ```

---

### 👥 Equipe / Autoria

*   Arthur Graciani — RM561728
*   Gustavo Oliveira — RM566358
*   João Pedro Scarpin — RM565421
*   Lucas Hideki — RM565355
*   Wesley Andrade — RM563593


### ⚠️ Notas sobre o Google Maps no Android
- Certifique-se de que a **Maps SDK for Android** esteja ativada e vinculada a uma conta de faturamento ativa no Google Cloud Console (chaves demonstrativas ou sem faturamento exibem o mapa com tiles escuros/vazios).
- Caso utilize restrição de aplicativo na chave do Google Cloud, adicione o **Package Name** do projeto e o **SHA-1** do keystore obtido via `eas credentials`.
