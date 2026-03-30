# PULSO — Setup del proyecto

## 1. Crear el proyecto

```bash
npx create-next-app@latest pulso --typescript --tailwind --eslint --app --src-dir
cd pulso
```

## 2. Instalar dependencias

```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken cloudinary zod
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## 3. Inicializar Prisma

```bash
npx prisma init
```

Pega el contenido de `prisma/schema.prisma` en el archivo generado.

## 4. Variables de entorno

Copia `.env.example` a `.env.local` y llena los valores:

```bash
cp .env.example .env.local
```

### Cloudinary (gratis)
1. Ve a https://cloudinary.com y crea una cuenta
2. En el Dashboard copia: Cloud Name, API Key, API Secret
3. Pégalos en `.env.local`

### Base de datos
Usa tu PostgreSQL local o crea una en Railway/Supabase (gratis):
- Railway: https://railway.app
- Supabase: https://supabase.com

## 5. Migrar la base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 6. Fuente Syne (opcional pero recomendada)

En `src/app/layout.tsx` agrega:

```tsx
import { Syne } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'] })
```

## 7. Correr el proyecto

```bash
npm run dev
```

Abre http://localhost:3000/register

---

## Estructura de archivos entregados

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← Página de login
│   │   └── register/page.tsx       ← Registro multi-paso (datos + fotos + vibe)
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts   ← POST registro
│       │   ├── login/route.ts      ← POST login
│       │   └── logout/route.ts     ← POST logout
│       └── fotos/route.ts          ← GET/POST/DELETE fotos (Cloudinary)
├── lib/
│   ├── prisma.ts                   ← Cliente Prisma singleton
│   ├── jwt.ts                      ← sign/verify token + límites de likes
│   ├── cloudinary.ts               ← Upload/delete fotos
│   └── validations.ts              ← Zod schemas + validación de edad
└── middleware.ts                   ← Protección de rutas con JWT
```

---

## Próxima fase: Sistema de likes y explorar perfiles

- `GET /api/explorar` — perfiles filtrados por vibe + distancia
- `POST /api/likes` — dar like con validación de límite diario
- `GET /api/matches` — ver matches mutuos
- Página `/explorar` con tarjetas de perfiles
- Cron job para reset de likes a medianoche

## Fase 3: Chat en tiempo real

Opciones recomendadas:
- **Pusher** (más fácil, plan gratis disponible)
- **Ably** (más barato a escala)
- **Supabase Realtime** (si usas Supabase como BD)
