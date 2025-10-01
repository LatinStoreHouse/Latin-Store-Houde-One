
# Descripción General de la Aplicación "InvenTrack" para Gemini

## 1. Propósito General de la Aplicación

**InvenTrack** es una plataforma de gestión de inventario y ventas (ERP/CRM híbrido) diseñada específicamente para "Latin Store House", una empresa de materiales de construcción y decoración. La aplicación integra la gestión de inventario, clientes, ventas, logística y marketing en un único sistema cohesivo, potenciado con herramientas de inteligencia artificial para optimizar las operaciones.

**Objetivos Clave:**
-   **Centralizar la Información**: Unificar datos de inventario, clientes y ventas que antes estaban dispersos.
-   **Optimizar el Flujo de Ventas**: Facilitar el ciclo completo, desde la captación del cliente hasta el despacho del producto.
-   **Segregar y Controlar el Inventario**: Gestionar de forma clara el stock disponible en la bodega principal, en la zona franca y los productos en tránsito (contenedores).
-   **Empoderar al Equipo Comercial**: Proveer herramientas como calculadoras de cotizaciones y un CRM simple para la gestión de clientes.
-   **Automatizar y Asistir con IA**: Utilizar IA para sugerir asesores, pronosticar ventas y generar contenido de marketing.

---

## 2. Sistema de Diseño y Estilo Visual

La aplicación sigue una estética moderna, limpia y profesional, priorizando la claridad y la facilidad de uso.

-   **Frameworks y Librerías**: Next.js (App Router), React, Tailwind CSS, ShadCN UI (para componentes base) y Lucide React (para iconos).
-   **Paleta de Colores (definida en `src/app/globals.css`):**
    -   **Primario (Azul Oscuro)**: `hsl(207 45% 34%)` - Usado para botones principales, enlaces, íconos activos y elementos de enfoque. Transmite confianza y eficiencia.
    -   **Fondo (Gris Claro)**: `hsl(0 0% 98%)` - Color base para el cuerpo de la aplicación.
    -   **Tarjetas/Popovers (Blanco)**: `hsl(0 0% 100%)` - Usado para `Card`, `Dialog`, `Popover`, etc.
    -   **Acento (Azul Claro)**: `hsl(207 45% 55%)` - Para estados `hover`, selecciones y acentos visuales.
    -   **Texto Principal (Casi Negro)**: `hsl(0 0% 3.9%)` - Para garantizar alta legibilidad.
    -   **Destructivo (Rojo)**: `hsl(0 84.2% 60.2%)` - Para botones de eliminar, alertas de error y estados peligrosos.
    -   **Éxito (Verde)**: Se usa `bg-green-600` o similar para `Badges` de estado "Validada" o "Completado".
-   **Tipografía**: `Inter` (sans-serif), cargada a través de Google Fonts en `src/app/layout.tsx`.
-   **Componentes**: Se prefieren los componentes de ShadCN UI (`Button`, `Card`, `Table`, `Dialog`, `Select`, etc.) para mantener la consistencia. Los componentes personalizados se construyen sobre esta base.
-   **Iconografía**: Se utiliza `lucide-react` para la mayoría de los íconos, garantizando un estilo visual coherente, limpio y profesional.

---

## 3. Roles de Usuario y Permisos

El acceso a las funcionalidades está estrictamente controlado por un sistema de roles definido en `src/lib/roles.ts`.

-   **`Administrador`**: Acceso total. Puede ver y hacer todo. Es el único que puede gestionar usuarios y roles.
-   **`Asesor de Ventas`**: Rol comercial. Gestiona clientes, crea cotizaciones, reservas y solicitudes de despacho. No puede validar operaciones ni editar precios. Ve reportes de sus propias ventas.
-   **`Contador`**: Rol financiero. Valida reservas y despachos (asigna facturas), gestiona la lista de precios y ve reportes financieros.
-   **`Logística`**: Rol de almacén. Gestiona el inventario físico, actualiza el estado de los despachos (rutero, guía) y puede recibir contenedores.
-   **`Partners` / `Distribuidor`**: Roles externos. Tienen vista de "solo lectura" del inventario, pueden usar las calculadoras y gestionar los clientes que les son asignados. No ven información sensible de la empresa.
-   **`Diseño`**: Gestiona las solicitudes de diseño (renders). Puede ver inventario y precios para sus propuestas.
-   **`Tráfico`**: Gestiona la creación y actualización del estado de los contenedores en tránsito.
-   **`Marketing`**: Crea y envía campañas, ve reportes de clientes y ventas.

---

## 4. Desglose de Páginas y Funcionalidad de Botones

#### **Autenticación (`/login`)**
-   **`src/app/(auth)/login/page.tsx`**: Página de inicio de sesión.
    -   **Formulario**: Campos para email y contraseña.
    -   **Botón "Iniciar Sesión"**: Simula un login y redirige al `/dashboard`.

#### **Panel Principal (`/dashboard`)**
-   **`src/app/(main)/dashboard/page.tsx`**: La página principal después del login.
    -   **Vista General**: Muestra tarjetas con métricas clave. Para **Admins/Logística/Contador**, muestra stats de inventario. Para **Asesores**, muestra stats de ventas (nuevos clientes, cotizaciones, etc.).
    -   **Alertas**: Muestra notificaciones importantes, como reservas a punto de expirar.
    -   **Accesos Rápidos**: Una cuadrícula de botones que enlazan a las páginas más importantes a las que el rol actual tiene permiso.
    -   **Botón "Mis Estadísticas" (Solo Asesores)**: Abre un modal (`Dialog`) con un análisis de ventas y clientes del asesor para un mes seleccionado.
    -   **Tablas de Movimiento (No para Asesores/Partners)**: Muestra los productos con mayor y menor movimiento del último mes.

#### **Gestión de Inventario (`/inventory`)**
-   **`src/app/(main)/inventory/page.tsx`**: El corazón de la gestión de stock.
    -   **Pestañas por Marca**: Navegación principal para filtrar por marcas (`StoneFlex`, `Starwood`, etc.).
    -   **Pestañas por Línea**: Sub-navegación para ver productos de una línea específica.
    -   **Tabla de Productos**: Muestra el stock.
        -   **Vista de Edición (Logística/Admin)**: Campos de `Input` para modificar directamente las cantidades en "Bodega", "Zona Franca" y "Muestras".
        -   **Vista de Lectura (Asesores/Partners)**: Muestra "Disponible Bodega", "Disponible ZF" y "Separado".
    -   **Botón "Guardar Cambios" (Admin/Logística)**: Guarda todas las modificaciones de stock en el contexto.
    -   **Botón "Trasladar de ZF a Bodega"**: Abre un modal para mover stock de Zona Franca a la bodega principal, permitiendo asociar reservas existentes a este traslado.
    -   **Botón "Añadir Producto"**: Abre un modal (`AddProductDialog`) para agregar un nuevo producto al inventario y a la lista de precios.
    -   **Botón "Exportar Datos"**: Abre un modal para configurar y descargar un reporte de inventario en PDF o Excel.

#### **Contenedores en Tránsito (`/transit`)**
-   **`src/app/(main)/transit/page.tsx`**: Para seguimiento de importaciones.
    -   **Pestañas "En Tránsito" e "Historial"**: Separa los contenedores activos de los ya recibidos.
    -   **Tarjeta de Contenedor**: Cada tarjeta muestra el ID del contenedor, fecha de llegada (ETA), y una tabla con los productos y cantidades que contiene.
        -   **Selector de Estado (Admin/Tráfico)**: Permite cambiar el estado del contenedor (`En producción`, `En tránsito`, etc.).
        -   **Botón "Marcar como Recibido" (Admin/Logística)**: Marca el contenedor como "Ya llego", mueve su contenido al inventario de "Zona Franca" y notifica a los usuarios suscritos.
        -   **Botón "Crear Reserva" (Asesores/Admin)**: Redirige a la página de reservas con el contenedor preseleccionado como origen.
        -   **Botón "Editar"**: Permite modificar los detalles del contenedor.

#### **Reservas (`/reservations`)**
-   **`src/app/(main)/reservations/page.tsx`**: Para separar producto para un cliente.
    -   **Botón "Crear Reserva"**: Abre un modal (`ReservationForm`) que permite construir una cotización multi-producto y generar las reservas correspondientes. Se define el cliente, # de cotización y los productos con su origen (Bodega, ZF, Contenedor).
    -   **Pestañas de Estado**: Filtran las reservas por `Pendiente Validación`, `Separadas (Validadas)`, `Pendiente Llegada` (si son de contenedor) e `Historial`.
    -   **Tabla de Reservas**: Muestra los detalles de cada reserva.
    -   **Acciones por Reserva (Menú desplegable)**:
        -   **"Crear Despacho"**: Redirige a la página de órdenes con los datos de la reserva para facilitar la creación del despacho.
        -   **"Eliminar Reserva"**: Cancela la reserva. Si estaba validada, libera el stock que estaba separado.

#### **Página de Validación (`/validation`)**
-   **`src/app/(main)/validation/page.tsx`**: Módulo exclusivo para **Contador** y **Admin**.
    -   **Pestañas "Reservas Pendientes" y "Despachos Pendientes"**: Separa los dos tipos de solicitudes que requieren aprobación financiera.
    -   **Tabla de Solicitudes**: Cada fila representa una solicitud.
        -   **Campo "Factura #"**: El contador debe ingresar el número de factura aquí.
        -   **Botones "Validar" (Check) y "Rechazar" (X)**:
            -   **Validar**: Si es una reserva, el stock se marca como "separado". Si es un despacho, el stock se descuenta del inventario. El estado de la reserva/despacho se actualiza.
            -   **Rechazar**: Cambia el estado a "Rechazada". No afecta el stock.
    -   **Historial de Validaciones**: Una tabla con todas las validaciones pasadas, con filtros de búsqueda y fecha.

#### **Gestión de Clientes (`/customers`)**
-   **`src/app/(main)/customers/page.tsx`**: CRM principal.
    -   **Tabla de Clientes**: Lista todos los clientes con su información de contacto, asesor asignado, estado y fuente.
    -   **Filtros**: Permite buscar por texto, rango de fechas, fuente, asesor y estado.
    -   **Botón "Agregar Cliente"**: Abre un modal (`CustomerForm`) para crear un nuevo cliente.
    -   **Acciones por Cliente (Menú desplegable)**:
        -   **"Editar"**: Abre el modal `CustomerForm` para actualizar la información.
        -   **"Transferir Cliente"**: Reasigna el cliente a otro asesor.
        -   **"Redireccionar a Socio" (Admin)**: Asigna el cliente a un `Partner` o `Distribuidor` y actualiza su estado.
        -   **"Crear Despacho" / "Crear Reserva" / "Crear Cotización"**: Accesos directos que pre-llenan las páginas correspondientes con la información del cliente.
-   **`src/app/(main)/customers/[id]/page.tsx`**: Vista 360 de un cliente específico.
    -   Muestra toda la información de contacto y, en pestañas, su historial de cotizaciones, reservas y despachos.

#### **Calculadoras**
-   **`src/app/(main)/stoneflex-clay-calculator/page.tsx`**: Para cotizar productos StoneFlex.
    -   Permite añadir productos por M² o por láminas, calcula el desperdicio y automáticamente añade los insumos necesarios (adhesivo, sellante).
    -   Calcula el costo total incluyendo IVA, mano de obra y transporte.
    -   **Botones "Descargar PDF" y "Compartir"**: Generan un resumen de la cotización para el cliente.
    -   **Botón "Guardar Cotización"**: Almacena un registro de la cotización en el historial.
-   **`src/app/(main)/starwood-calculator/page.tsx`**: Similar a la anterior, pero para productos Starwood (Decks, Listones).

#### **Gestión de Usuarios y Roles (`/users`, `/roles`)**
-   **`src/app/(main)/users/page.tsx`**: Solo para **Admins**.
    -   Permite crear, editar y ver todos los usuarios del sistema.
    -   Se pueden asignar roles y permisos individuales.
    -   Incluye una pestaña para aprobar/rechazar solicitudes de nuevos usuarios (Partners/Distribuidores).
-   **`src/app/(main)/roles/page.tsx`**: Solo para **Admins**.
    -   Permite modificar qué permisos tiene cada `Rol`.

---

## 5. Integración de Inteligencia Artificial (Genkit)**

La aplicación utiliza Genkit para sus funcionalidades de IA.

-   **`src/ai/flows/suggest-advisor.ts`**:
    -   **Página `/advisor`**: Un asesor de ventas puede pegar el mensaje de un cliente. El flujo de IA analiza el contenido y sugiere qué asesor del equipo es el más adecuado para atender esa consulta.
-   **`src/ai/flows/forecast-sales.ts`**:
    -   **Página `/reports`**: Para meses futuros, este flujo analiza datos históricos de movimiento de productos (`src/lib/inventory-movement.ts`) y genera un pronóstico de ventas, prediciendo qué productos se venderán más.
-   **`src/ai/flows/generate-campaign-flow.ts`**:
    -   **Página `/marketing/campaigns/create`**: Basado en un nombre de campaña (ej. "Promo Verano"), este flujo genera un texto de marketing atractivo y profesional, listo para ser enviado por email o WhatsApp.

---

## 6. Flujos de Trabajo Principales (Core Workflows)

1.  **Ciclo de Venta Típico**:
    1.  Un **Asesor de Ventas** crea un nuevo cliente en la página de **Clientes**.
    2.  Usa una de las **Calculadoras** para generar una cotización detallada.
    3.  Guarda la cotización, que aparece en el historial.
    4.  Crea una **Reserva** desde la página de inventario o contenedores para separar el producto para el cliente.
    5.  La reserva va a la página de **Validación**.
    6.  Un **Contador** la aprueba e ingresa el número de factura.
    7.  Una vez validada, el asesor crea una solicitud de **Despacho** desde la página de reservas.
    8.  El equipo de **Logística** gestiona los detalles del envío en la página de **Despachos**.

2.  **Recepción de Mercancía**:
    1.  Un usuario de **Tráfico** o **Admin** crea un nuevo **Contenedor** con los productos que vienen en camino.
    2.  Actualiza su estado a medida que avanza.
    3.  Cuando llega, **Logística** o **Admin** lo marca como "Recibido".
    4.  El stock del contenedor se suma automáticamente al inventario de **Zona Franca**. Las reservas asociadas ahora apuntan a Zona Franca.
    5.  **Logística** puede usar la herramienta "Trasladar de ZF a Bodega" para mover stock al almacén principal.

