# TechInventoryService

Sistema de administración de activos tecnológicos institucionales. Permite registrar, categorizar, consultar y generar reportes del inventario de activos tecnológicos, con autenticación JWT y autorización por roles.

## Funcionalidades

- **Autenticación JWT y autorización por roles** (`ADMIN` / `USER`).
- **Dashboard** con métricas reales: total de activos, activos disponibles, activos asignados y total de categorías.
- **Gestión de categorías**: consulta y creación.
- **Gestión de activos**: creación, edición, búsqueda, filtros (categoría, estado, rango de costos), paginación, ordenamiento y cambio de estado.
- **Indicadores visuales de estado** por activo en la lista.
- **Reports**: vista previa, generación, Excel, auditoría, ZIP, Base64 y descarga desde el navegador.

## Roles

| Rol    | Permisos                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN` | Gestión de activos y categorías, consulta, cambio de estado, dashboard y reportes. |
| `USER`  | Solo lectura: consultar activos y categorías, ver dashboard y generar reportes. No puede crear, editar ni cambiar el estado de los activos. |

Las restricciones se aplican tanto en el backend (Spring Security) como en el frontend (guards de ruta).

## Arquitectura

- **Backend**: arquitectura **Hexagonal / Ports and Adapters** con separación estricta entre:
  - `domain`: modelos, enums y excepciones de dominio.
  - `application`: casos de uso, puertos de entrada/salida y DTO de aplicación.
  - `infrastructure`: adaptadores JPA, generación de reportes (Excel/auditoría/ZIP), folios, seguridad JWT y controladores web.
- **Frontend**: organización por **features** (`auth`, `dashboard`, `categories`, `assets`, `reports`), con `core` para guards, interceptors, layout, modelos y servicios, y componentes **standalone**.

## Tecnologías

| Capa     | Tecnologías                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| Backend  | Java 21, Spring Boot 4.1.0, Maven (wrapper `mvnw`), Spring Data JPA / Hibernate, Spring Security, JWT (jjwt 0.12.6), Apache POI 5.4.0, Lombok, MariaDB |
| Frontend | Angular 22, Angular Material 22.1, TypeScript ~6.0.2, RxJS ~7.8, pnpm 11.18, Vitest                                     |

## Estructura

```
tech-inventory/
├── backend/
│   └── techinventory-service/
│       └── src/
│           ├── main/java/org/isaac/techinventoryservice/
│           │   ├── domain/            # modelo de dominio, enums, excepciones
│           │   ├── application/       # casos de uso y puertos
│           │   └── infrastructure/    # persistencia, seguridad, reportes, web
│           └── test/
└── frontend/
    └── tech-inventory-front/
        └── src/app/
            ├── core/                  # guards, interceptors, layout, modelos, servicios
            └── features/              # auth, dashboard, categories, assets, reports
```

## Requisitos e instalación

### Requisitos

- **Java 21**
- **MariaDB** (el proyecto asume una base local en `localhost:3307`, esquema `tech_inventory`)
- **Node.js** con **pnpm** (versión gestionada por `packageManager` en `package.json`)

### Backend

1. Configurar la conexión a la base de datos. Puede tomarse como referencia `src/main/resources/application.example.properties`, copiarlo a `application.properties` y ajustar credenciales:

   ```properties
   spring.datasource.url=jdbc:mariadb://localhost:3307/tech_inventory
   spring.datasource.username=TU_USERNAME_BD
   spring.datasource.password=TU_PASSWORD_BD
   ```

2. Ejecutar desde `backend/techinventory-service`:

   ```bash
   ./mvnw spring-boot:run
   ```

   El servicio queda disponible en `http://localhost:8080`.

### Frontend

1. Ejecutar desde `frontend/tech-inventory-front`:

   ```bash
   pnpm install
   pnpm start
   ```

   La aplicación queda disponible en `http://localhost:4200` (origen permitido por CORS). El `apiUrl` apunta a `http://localhost:8080/api/v1` y se configura en `src/environments/`.

### Credenciales de prueba

| Usuario | Contraseña | Rol    |
| ------- | ---------- | ------ |
| `admin` | `admin123` | `ADMIN` |
| `user`  | `user123`  | `USER`  |

## API

Todos los endpoints están bajo `/api/v1`. Las rutas protegidas requieren el header `Authorization: Bearer <token>`.

### Authentication

| Método | Ruta                | Propósito                 | Acceso   |
| ------ | ------------------- | ------------------------- | -------- |
| POST   | `/auth/login`       | Autenticación y obtención del JWT | Público |

### Categories

| Método | Ruta              | Propósito                  | Acceso       |
| ------ | ----------------- | -------------------------- | ------------ |
| GET    | `/categories`     | Listar categorías          | ADMIN, USER  |
| GET    | `/categories/{id}`| Obtener categoría por id   | ADMIN, USER  |
| POST   | `/categories`     | Crear categoría            | ADMIN        |

### Assets

| Método | Ruta                              | Propósito                                        | Acceso       |
| ------ | --------------------------------- | ------------------------------------------------ | ------------ |
| GET    | `/assets`                         | Listar activos (búsqueda, filtros, paginación, orden) | ADMIN, USER |
| GET    | `/assets/{technicalId}`           | Obtener activo por id                            | ADMIN, USER  |
| POST   | `/assets`                         | Crear activo                                     | ADMIN        |
| PUT    | `/assets/{technicalId}`           | Editar activo                                    | ADMIN        |
| PATCH  | `/assets/{technicalId}/status`    | Cambiar estado del activo                        | ADMIN        |

Parámetros de consulta de `GET /assets`: `search`, `categoryId`, `status`, `minCost`, `maxCost`, `page`, `size`, `sortBy`, `sortDirection` (`asc`/`desc`).

Estados de activo: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `RETIRED`. Un activo en estado `RETIRED` no puede cambiar de estado.

### Reports

| Método | Ruta                    | Propósito                                        | Acceso       |
| ------ | ----------------------- | ------------------------------------------------ | ------------ |
| GET    | `/assets/report/preview`| Vista previa de los datos del reporte            | ADMIN, USER  |
| GET    | `/assets/report`        | Generar reporte completo (ZIP en Base64)         | ADMIN, USER  |

## Reports

Flujo actual de generación y descarga:

1. **Preview**: el frontend consulta `GET /assets/report/preview` y muestra una tabla con los activos que se incluirán.
2. **Generación**: al solicitar el reporte, el backend genera un **Excel** (`assets.xlsx`) con los activos y un **audit** (`audit.txt`) con fecha de generación, usuario solicitante y registros exportados.
3. **ZIP**: ambos archivos se empaquetan en `assets.zip`.
4. **Base64**: el ZIP se devuelve codificado en Base64 dentro del response.
5. **Frontend**: decodifica el contenido, construye un `Blob` con el `contentType` recibido y dispara la descarga desde el navegador.

## Testing y build

### Backend (desde `backend/techinventory-service`)

```bash
./mvnw test         # ejecutar tests
./mvnw clean package # compilar y empaquetar
```

### Frontend (desde `frontend/tech-inventory-front`)

```bash
pnpm test           # ejecutar tests (Vitest)
pnpm build          # build de producción
```

## Estado actual

El proyecto cuenta con autenticación JWT, dashboard con métricas reales, gestión de categorías, gestión completa de activos (con búsqueda, filtros, paginación, ordenamiento y cambio de estado) y generación/descarga de reportes. Está fuera de alcance la **eliminación física de activos** (no existen endpoints `DELETE`).