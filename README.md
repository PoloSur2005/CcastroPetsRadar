# PetRadar API

API REST para registrar mascotas perdidas y encontradas. Al registrar una mascota encontrada, el sistema busca coincidencias dentro de un radio de 500 metros usando `ST_DWithin` y envía correo al dueño de la mascota perdida.

## 1) Requisitos

- Docker y Docker Compose
- Node.js 20+ (opcional, si quieres correr sin contenedor)

## 2) Estructura de servicios con Docker Compose

Este repo ya incluye `docker-compose.yml` con **2 servicios**:

- `api`: NestJS
- `db`: PostgreSQL + PostGIS (`postgis/postgis:15-3.4`)

## 3) Configurar variables de entorno

1. Copia el ejemplo:

```bash
cp .env.example .env
```

2. Edita `.env`.

Para correos con Gmail, usa una **clave de aplicación** (no tu contraseña normal). Debes ponerla aquí:

```env
MAILER_EMAIL=tu_correo@gmail.com
MAILER_PASSWORD=tu_clave_de_aplicacion_de_16_caracteres
```

> Si quieres usar la clave que compartiste para pruebas, colócala en `MAILER_PASSWORD` del archivo `.env`.

También agrega tu token:

```env
MAPBOX_TOKEN=tu_token_de_mapbox
```

## 4) Levantar proyecto completo

```bash
docker compose up --build
```

API disponible en:

- `http://localhost:3000`

## 5) Crear proyecto desde cero con Nest (paso a paso)

Si te piden documentar cómo se haría desde cero:

```bash
npm i -g @nestjs/cli
nest new petradar-api
cd petradar-api
npm i @nestjs/typeorm typeorm pg nodemailer
```

### Crear módulos y recursos

```bash
nest g module lost-pets
nest g controller lost-pets
nest g service lost-pets

nest g module found-pets
nest g controller found-pets
nest g service found-pets

nest g module mailer
nest g service mailer
```

### Configurar TypeORM

En `AppModule`, usar `TypeOrmModule.forRoot` con `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, y `synchronize: true` para desarrollo.

### Entidades

- `lost_pets` con `location geometry(Point,4326)` + datos del dueño.
- `found_pets` con `location geometry(Point,4326)` + datos de quien encontró.

### Lógica central de búsqueda por radio

Al crear `found-pets`, ejecutar consulta con:

- `ST_DWithin(..., 500)`
- `location::geography`
- `ST_SetSRID(ST_MakePoint(lng,lat),4326)::geography`

### Correos

Cuando hay coincidencias:

- enviar correo al `owner_email`
- incluir datos de mascota encontrada
- incluir contacto de quien la encontró
- incluir URL de mapa estático de Mapbox con ambos puntos

## 6) Endpoints

### POST `/lost-pets`
Registra mascota perdida.

Body ejemplo:

```json
{
  "name": "Luna",
  "species": "gato",
  "breed": "siamés",
  "color": "blanco",
  "size": "pequeño",
  "description": "Collar rosa",
  "photo_url": "https://...",
  "owner_name": "Carlos",
  "owner_email": "carlos@mail.com",
  "owner_phone": "5551234567",
  "address": "Av. Central 123",
  "lost_date": "2026-03-16T18:00:00.000Z",
  "latitude": 21.123,
  "longitude": -101.68
}
```

### POST `/found-pets`
Registra mascota encontrada, busca coincidencias en 500m y notifica por correo.

Body ejemplo:

```json
{
  "species": "gato",
  "breed": "siamés",
  "color": "blanco",
  "size": "pequeño",
  "description": "Muy dócil",
  "photo_url": "https://...",
  "finder_name": "Ana",
  "finder_email": "ana@mail.com",
  "finder_phone": "5559876543",
  "address": "Parque Centro",
  "found_date": "2026-03-16T19:00:00.000Z",
  "latitude": 21.124,
  "longitude": -101.679
}
```

## 7) Prueba rápida con curl

```bash
curl -X POST http://localhost:3000/lost-pets \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Luna",
    "species":"gato",
    "breed":"siamés",
    "color":"blanco",
    "size":"pequeño",
    "description":"Collar rosa",
    "owner_name":"Carlos",
    "owner_email":"carlos@mail.com",
    "owner_phone":"5551234567",
    "address":"Av. Central 123",
    "lost_date":"2026-03-16T18:00:00.000Z",
    "latitude":21.123,
    "longitude":-101.68
  }'
```







## 8) Notas importantes

- No guardes credenciales reales en Git.
- Usa `.env` local y deja solo `.env.example` en el repo.
- `synchronize: true` es solo para desarrollo/examen.
