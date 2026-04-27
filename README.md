# 🥭 MANGOO v5 — Setup Completo

## ▶️ Ejecutar ahora (30 segundos)

```bash
cd ~/Downloads/mangoo-v5
npm install
npm start
```

---

## 👤 Cuentas de prueba incluidas

| Rol | Email | Contraseña | Acceso |
|-----|-------|------------|--------|
| **Admin** | gomezdaniele14@gmail.com | Loollool144+ | Todo |
| **Trabajador** | gomezdaniele144@gmail.com | Loollool144+ | Órdenes, rastreo, marketplace |
| **Comprador** | Crea tu cuenta | — | Solo comprar |

---

## 🗄️ Supabase — Base de datos real (GRATIS)

### Paso 1: Crear cuenta
1. Ve a **https://supabase.com** → "Start for free"
2. Crea un proyecto → elige región "South America (São Paulo)" o "US East"
3. Guarda tu **Project URL** y **anon key** (los necesitas después)

### Paso 2: Crear tablas
En el SQL Editor de Supabase, ejecuta:

```sql
-- Usuarios
create table users (
  id text primary key,
  name text, email text unique, password text,
  phone text, country text, address text,
  suite text, avatar text, role text default 'buyer',
  created_at timestamptz default now()
);

-- Productos
create table products (
  id bigint primary key generated always as identity,
  name text, brand text, price_usd float, orig_usd float,
  category text, subcategory text, size_type text,
  sizes jsonb, images text[], emoji text, bg_light text,
  description text, featured boolean default false,
  created_at timestamptz default now()
);

-- Órdenes
create table orders (
  id text primary key,
  type text, user_id text, user_name text, user_email text,
  items jsonb, total_usd float, status text default 'pending_arrival',
  tracking_usa text, notes jsonb default '[]', photos text[],
  created_at timestamptz default now()
);

-- Paquetes
create table packages (
  id text primary key,
  item text, store text, price float, status int,
  icon text, user_id text, user_name text, user_email text,
  tracking text, notes jsonb default '[]', photos text[],
  created_at timestamptz default now()
);
```

### Paso 3: Instalar cliente
```bash
npm install @supabase/supabase-js
```

### Paso 4: Crear archivo .env
```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxxx
```

### Paso 5: Crear src/supabase.js
```js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
```

### Paso 6: Reemplazar localStorage por Supabase
En AuthContext.jsx, reemplaza las llamadas a localStorage por:
```js
// Guardar usuario
await supabase.from('users').insert(newUser);

// Buscar usuario al login
const { data } = await supabase.from('users').select().eq('email', email).single();
```

---

## 💳 Stripe — Pagos reales

1. Cuenta en **https://stripe.com** → gratis
2. Copia `pk_test_...` del dashboard
3. ```bash npm install @stripe/stripe-js @stripe/react-stripe-js```
4. Reemplaza el formulario de tarjeta manual con `<CardElement>` de Stripe React
5. Para cobrar necesitas un backend — usa FastAPI (Python):

```python
# backend/main.py
import stripe
stripe.api_key = "sk_test_TU_KEY"

@app.post("/create-payment-intent")
async def pay(data: dict):
    intent = stripe.PaymentIntent.create(
        amount=int(data["amount"]*100), currency="usd"
    )
    return {"client_secret": intent.client_secret}
```

---

## 📱 Notificaciones WhatsApp reales

1. Cuenta en **https://twilio.com** → gratis $15 crédito
2. Instala: `pip install twilio` en tu backend
3. En el backend, cuando se crea una orden:
```python
from twilio.rest import Client
client = Client(account_sid, auth_token)
client.messages.create(
    from_='whatsapp:+14155238886',
    to=f'whatsapp:{admin_phone}',
    body=f'🛍️ Nueva orden #{order_id} de {user_name}'
)
```

---

## 🚀 Deploy

```bash
npm run build
# Sube /build a Vercel.com (arrastra y suelta, es gratis)
```

---

## 📁 Estructura

```
mangoo-v5/src/
├── context/
│   ├── AuthContext.jsx   ← Roles: admin/worker/buyer
│   └── AppContext.jsx    ← Productos con tallas, órdenes, stock
├── pages/
│   ├── Market.jsx        ← Marketplace premium con zoom, tallas
│   ├── Admin.jsx         ← Panel vendedor con gestión de tallas
│   ├── Orders.jsx        ← Gestión de órdenes (admin + worker)
│   ├── Casillero.jsx     ← Casillero + tracking existente
│   ├── DevPanel.jsx      ← Analytics, usuarios, gráficas
│   ├── Help.jsx          ← Centro de ayuda
│   └── Other.jsx         ← Cart, Profile, Rates
└── components/
    ├── Layout.jsx         ← Nav dinámico por rol
    └── Toasts.jsx
```
