# bartô.io — Endpoints para integração Front ↔ Back

> Base URL: `/api` (`VITE_API_BASE_URL`), que o Vite repassa para `VITE_API_PROXY_TARGET` (padrão `http://localhost:8000`)
> Auth: `Authorization: Bearer <jwt>`. O front guarda os tokens em `localStorage['barto.token']` e `localStorage['barto.refreshToken']`
> Mocks: ligar com `VITE_USE_MOCKS=true`. No modo mock o login é ignorado e o menu do usuário permite simular perfis

## Rodando integrado com o backend (`barto-io-api`)

1. Suba o backend conforme o README dele: `docker compose up -d`, depois `python -m app.seed` e `uvicorn app.main:app --reload`.
2. Neste projeto, crie o `.env` a partir do `.env.example` (já vem com `VITE_USE_MOCKS=false`).
3. Rode `npm install` e `npm run dev`, abra `http://localhost:5173` e entre com um usuário do seed:

| E-mail | Perfil | Senha |
|---|---|---|
| `admin@barto.io` | Administrador | `barto@2026` |
| `analista@barto.io` | Analista de dados | `barto@2026` |
| `produtor@barto.io` | Produtor/Exportador | `barto@2026` |

Fluxo de sessão:
- Sem token, qualquer rota redireciona para `/login?next=<rota>`.
- Um `401` dispara um único `POST /auth/refresh` e a requisição é repetida. Se o refresh falhar, os tokens são apagados e o usuário volta ao login.
- **Sair** fica no menu do usuário.

**Legenda de status**
- ✅ Implementado no back e consumido pelo front (`src/services/`)
- 🟦 Implementado no back, ainda não usado por nenhuma tela
- 🚧 Faltando no back

---

## 1. Autenticação

| Status | Método | Rota | Body | Retorno | Permissão |
|---|---|---|---|---|---|
| ✅ | GET | `/auth/me` | — | `User` | autenticado |
| ✅ | POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` | público |
| ✅ | POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` | público |
| ✅ | POST | `/auth/logout` | `{ refreshToken }` | `204` | autenticado |

---

## 2. Painel

| Status | Método | Rota | Query | Retorno | Permissão |
|---|---|---|---|---|---|
| ✅ | GET | `/dashboard/summary` | — | `DashboardSummary` | `dashboard:read` |
| ✅ | GET | `/forecasts/harvest` | `cropId` | `HarvestForecast` | `forecast:read` |
| ✅ | GET | `/plots` | `status=ACTIVE` | `Plot[]` | `dashboard:read` |
| ✅ | GET | `/climate/readings` | `range=today` | `ClimateReading[]` | `climate:read` |
| ✅ | GET | `/alerts/active` | — | `ThermalAlert \| null` | autenticado |
| ✅ | GET | `/climate/readings` | `range` (`today`/`24h`/`7d`/`30d`), `maxPoints=240` | `ClimateReading[]` (gráfico) | `climate:read` |
| ✅ | GET | `/climate/aggregates` | `bucket` (`day`/`hour`), `days` (1–31) | `ClimateAggregate[]` (amplitude diária, mapa de calor, janela de irrigação) | `climate:read` |
| 🟦 | GET | `/climate/readings` | `from`, `to`, `stationId` | `ClimateReading[]` | `climate:read` |
| ✅ | POST | `/ingestion/run` | `results` (1–8000) | `{ fetched, saved, duplicates, discarded }` | `sensors:write` |

---

## 3. Sensores / Estações

| Status | Método | Rota | Body | Retorno | Permissão |
|---|---|---|---|---|---|
| ✅ | GET | `/stations` | — | `Station[]` | `sensors:read` |
| ✅ | GET | `/stations/health` | — | `NetworkHealth` | `sensors:read` |
| ✅ | POST | `/stations` | `StationInput` | `Station` | `sensors:write` |
| 🟦 | PUT | `/stations/{id}` | `StationInput` | `Station` | `sensors:write` |
| 🟦 | DELETE | `/stations/{id}` | — | `204` | `sensors:write` |

---

## 4. Usuários

| Status | Método | Rota | Body | Retorno | Permissão |
|---|---|---|---|---|---|
| ✅ | GET | `/users` | — | `User[]` | `users:read` |
| ✅ | GET | `/users/stats` | — | `UsersStats` | `users:read` |
| ✅ | POST | `/users` | `UserInput` | `User` · `409` se e-mail duplicado | `users:write` |
| ✅ | PUT | `/users/{id}` | `UserInput` | `User` | `users:write` |
| ✅ | DELETE | `/users/{id}` | — | `204` | `users:write` |

---

## 5. Catálogo e notificações

| Status | Método | Rota | Body | Retorno | Permissão |
|---|---|---|---|---|---|
| 🚧 | GET | `/crops` | — | `Crop[]` | autenticado |
| 🚧 | GET | `/notifications` | — | `Notification[]` | autenticado |
| 🚧 | PATCH | `/notifications/{id}/read` | — | `204` | autenticado |

---

## 6. DTOs

### Enums

```ts
Role          = 'ADMIN' | 'ANALISTA_DADOS' | 'PRODUTOR_EXPORTADOR'
UserStatus    = 'ATIVO' | 'INATIVO'
StationStatus = 'ATIVO' | 'ATENCAO' | 'INATIVO'
Municipality  = 'PETROLINA' | 'JUAZEIRO'
CropId        = 'UVA_SUGRAONE' | 'MANGA_PALMER' | 'UVA_ARRA' | 'GOIABA_PALUMA'
```

### User / UserInput / UsersStats

```json
// User
{
  "id": "usr_123",
  "name": "João Dantas",
  "email": "joao@frutvale.com.br",
  "role": "ADMIN",
  "status": "ATIVO",
  "lastAccessAt": "2026-10-02T09:24:00Z",
  "createdAt": "2026-08-01T12:00:00Z"
}

// UserInput (password obrigatório no POST; no PUT, só para trocar a senha)
{ "name": "...", "email": "...", "role": "ANALISTA_DADOS", "status": "ATIVO", "password": "********" }

// UsersStats
{ "total": 24, "addedThisMonth": 4, "active": 21, "admins": 3 }
```

### Station / StationInput / NetworkHealth

```json
// Station
{
  "id": "BD-01",
  "name": "Bebedouro",
  "municipality": "PETROLINA",
  "position": { "x": 23.5, "y": 55.0 },
  "status": "ATENCAO",
  "statusReason": "Checar bateria",
  "battery": 18,
  "lastReadingAt": "2026-10-02T10:30:00Z",
  "lastReading": { "temperature": 31.2, "soilMoisture": 46, "airHumidity": 52 },
  "productId": "UVA_SUGRAONE",
  "thingSpeakChannelId": "2345678"
}

// StationInput
{ "id": "BD-01", "name": "Bebedouro", "municipality": "PETROLINA", "productId": "UVA_SUGRAONE", "thingSpeakChannelId": "2345678" }

// NetworkHealth
{ "total": 5, "online": 4, "active": 3, "attention": 1, "inactive": 1, "lastSyncAt": "2026-10-02T10:38:00Z" }
```

### Painel

```json
// DashboardSummary — campos de clima são null sem leitura (ou se o sensor não mede a grandeza)
{
  "projectedProductionT": 1248,
  "productionChangePct": 8.2,
  "avgTemperatureC": 31,
  "temperatureDeltaC": 2,
  "airHumidityPct": 41,
  "soilMoisturePct": null,
  "rainfall7dMm": null,
  "lastReadingAt": "2026-10-02T10:38:00Z"
}

// HarvestForecast
{
  "cropId": "UVA_SUGRAONE",
  "points": [
    // avgTemperatureC = normal climatológica; measuredTemperatureC = média medida pela estação (null sem leituras ou em mês projetado)
    { "period": "Out", "productionT": 126, "avgTemperatureC": 31.0, "measuredTemperatureC": 30.1, "projected": false }
  ]
}

// Plot
{ "id": "plt_1", "name": "Uva Sugraone", "code": "A-12", "cropId": "UVA_SUGRAONE", "areaHa": 12.5, "daysToHarvest": 18, "progress": 82 }

// ClimateAggregate — um dia ou uma hora no horário do Vale (UTC−3); só intervalos com leitura
{
  "start": "2026-10-22T00:00:00-03:00",
  "readings": 720,
  "temperature": { "min": 23.8, "avg": 30.4, "max": 36.5 },
  "airHumidity": { "min": 32.2, "avg": 58.0, "max": 83.8 },
  "heatStressHours": 5.13
}

// ClimateReading — soilMoisture/rainfall são null quando o canal não publica field3/field4
{ "id": "rd_1", "stationId": "ESP-PTR-01", "timestamp": "2026-10-02T10:00:00Z", "temperature": 31.2, "soilMoisture": null, "airHumidity": 52, "rainfall": null }

// ThermalAlert
{ "id": "alt_1", "title": "Alerta térmico", "message": "Pico de 39°C previsto para hoje às 14h.", "severity": "atencao" }
```

---

## 7. Matriz RBAC

| Permissão | ADMIN | ANALISTA_DADOS | PRODUTOR_EXPORTADOR |
|---|:-:|:-:|:-:|
| `dashboard:read` | ✅ | ✅ | ✅ |
| `forecast:read` | ✅ | ✅ | ✅ |
| `climate:read` | ✅ | ✅ | ✅ |
| `irrigation:read` | ✅ | ✅ | ✅ |
| `reports:read` | ✅ | ✅ | ✅ |
| `sensors:read` | ✅ | ✅ | ✅ |
| `analytics:read` | ✅ | ✅ | — |
| `users:read` | ✅ | ✅ | — |
| `sensors:write` | ✅ | — | — |
| `users:write` | ✅ | — | — |

> O front só esconde ou desabilita. Quem bloqueia é o back (`exigir_permissao("users:write")` no FastAPI).

---

## 8. Convenções obrigatórias

- [x] **Erro padronizado:** exception handlers do FastAPI sempre devolvendo `{ "message": "..." }` (o front exibe esse campo).
- [x] **Datas em ISO 8601 com fuso:** colunas `DateTime(timezone=True)`, serializadas em UTC.
- [x] **Enums em maiúsculo, sem acento:** iguais aos listados na seção 6.
- [x] **`204 No Content`** em DELETE e logout.
- [x] **`409 Conflict`** em e-mail duplicado no cadastro de usuário.

## 9. Regras de negócio que ficam no back

- [x] **Health da rede:** `online = active + attention`.
- [x] **Status `ATENCAO`:** calculado no back (bateria < 20% ou sem leitura há mais de 30 min), com `statusReason` legível.
- [x] **Polling do ThingSpeak:** tarefa assíncrona (`INGEST_ENABLED=true`) lendo os *channel feeds* e persistindo leituras.
- [x] **`lastAccessAt`:** atualizado no login.
- [x] **`/climate/readings?range=today`:** retorna todas as leituras do canal ingerido desde a meia-noite do Vale (UTC−3), em ordem cronológica.
- [x] **Agregados climáticos:** dias e horas cortados no horário do Vale; `heatStressHours` soma o tempo com temperatura ≥ 35 °C (cada leitura vale até a próxima, no máximo 30 min).

## 10. Gráficos e onde cada dado aparece

| Tela | Gráfico | Fonte |
|---|---|---|
| Painel | KPIs com minigráfico de tendência (24 h) | `/dashboard/summary` + `/climate/readings?range=24h&maxPoints=240` |
| Painel | Clima nas últimas 24 h (temperatura e umidade em painéis sincronizados, com limiares de 35/38 °C e 80% de umidade) | `/climate/readings` |
| Painel | Previsão de safra: produção realizada × projetada e temperatura medida × normal climatológica | `/forecasts/harvest` |
| Clima | Série com filtro de período (Hoje, 24 h, 7 dias, 30 dias) | `/climate/readings` |
| Clima | Amplitude térmica diária e horas ≥ 35 °C (14 dias) | `/climate/aggregates?bucket=day&days=14` |
| Clima | Mapa de calor hora × dia (7 dias) | `/climate/aggregates?bucket=hour&days=7` |
| Irrigação | VPD atual, ponto de orvalho e série de VPD com faixas | `/climate/readings` (VPD calculado no front a partir de temperatura e umidade) |
| Irrigação | Melhor horário para irrigar (VPD médio por hora, 7 dias) | `/climate/aggregates?bucket=hour&days=7` |

Convenções dos gráficos: nunca dois eixos Y no mesmo gráfico (grandezas diferentes viram painéis sincronizados); limiares tracejados com a legenda fora da área de dados; cada gráfico tem resumo para leitor de tela e, nos agregados, uma tabela equivalente ("Ver dados em tabela"). As cores ficam em `src/theme/tokens.ts` (`chartColors`, `heatRamp`).
Para desenvolver sem estação, `VITE_USE_MOCKS=true` gera 31 dias sintéticos com ciclo diário do semiárido (`src/services/mocks/climateSeries.ts`).
- [ ] **`position` da estação:** hoje é coordenada do SVG (0–100). Ideal é o back guardar lat/lng e o front converter.