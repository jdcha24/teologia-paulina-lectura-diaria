Infograma Técnico: Arquitectura de la Plataforma "Teología Paulina"

1. Diagrama de Arquitectura (Flujo de Datos)

graph TD
    subgraph "Cliente (Frontend - PWA)"
        User[👤 Usuario Final / Admin]
        Browser[📱 Navegador / App Instalada]
        ReactApp[⚛️ React Application (Vercel)]
        Logic[🧠 Lógica de Negocio Local]
    end

    subgraph "Servicios en la Nube (Backend - Firebase)"
        Auth[🔐 Firebase Authentication]
        Firestore[wd🗄️ Cloud Firestore (NoSQL)]
    end

    subgraph "Integraciones Externas"
        Google[🌐 Google Identity]
        WhatsApp[💬 WhatsApp API (Link)]
    end

    %% Flujos
    User -->|Interacción| Browser
    Browser -->|Carga| ReactApp
    ReactApp -->|Autenticación| Auth
    Auth <-->|Validación Oauth| Google
    
    ReactApp -->|Lectura/Escritura en tiempo real| Firestore
    
    Logic -->|Generación Estática| BiblePlan[📅 Plan Bíblico (Algoritmo 365 días)]
    Logic -->|Cálculo| Stats[📊 Rachas y Progreso]
    
    ReactApp -->|Redirección| WhatsApp


2. Detalle de Componentes

A. Capa de Frontend (Cliente)

La aplicación es una SPA (Single Page Application) construida con tecnologías modernas para asegurar velocidad y capacidad de instalación.

Framework Principal: React.js (Manejo de estado, componentes y vistas).

Estilos: Tailwind CSS (Diseño responsivo y adaptativo móvil).

Iconografía: Lucide React.

PWA (Progressive Web App): Inyección dinámica de manifest.json para permitir la instalación en Android/iOS como una aplicación nativa.

Hosting: Vercel (Entrega de contenido estático y caché).

B. Lógica de Negocio (Client-Side)

A diferencia de aplicaciones tradicionales, gran parte de la lógica reside en el cliente para mayor velocidad:

Generador de Plan Bíblico: No descarga los 365 días de la base de datos. Utiliza un algoritmo (generateStaticPlan) que construye el calendario bíblico localmente basándose en la estructura de la Biblia.

Sistema de Habilitación:

Regla de Oro: (Fecha <= Hoy) OR (Habilitado por Admin).

Cálculo de Racha (Streak): Algoritmo que analiza el historial de fechas completadas, ordenándolas y verificando continuidad día a día hacia atrás desde la fecha actual.

C. Capa de Backend (BaaS - Firebase)

La infraestructura es Serverless, delegando la seguridad y persistencia a Google Firebase.

Autenticación (Firebase Auth):

Proveedor: Google Sign-In.

Gestión de sesiones persistentes.

Control de acceso basado en uid.

Base de Datos (Cloud Firestore):
Base de datos NoSQL documental, estructurada para escalabilidad.

Colecciones Principales:

users: Perfiles, roles (admin/user), fecha de inicio personalizada (planStartDate).

completions: Registro de cada capítulo leído (userId, readingId, timestamp).

comments: Foro social por lectura.

daily_content: Configuraciones del administrador (comentarios pastorales, links extra) que se "fusionan" con el plan estático.

D. Seguridad y Reglas

Frontend: Validaciones visuales (candados en UI).

Backend: Reglas de seguridad de Firestore (implícitas) que requieren autenticación para leer/escribir.

Dominios: Lista blanca de dominios autorizados en Firebase Console para prevenir ataques de origen cruzado (CORS).

3. Flujo de Usuario Típico

Login: El usuario se autentica con Google.

Sincronización: La app descarga el perfil del usuario y sus "completions" (lecturas hechas).

Renderizado:

El algoritmo genera el plan de 365 días.

Se cruza la información local con los datos de Firebase (daily_content).

Se calcula el progreso y la racha en tiempo real.

Acción:

El usuario marca una lectura.

Se envía una escritura a Firestore.

La UI se actualiza optimistamente.

(Opcional) Se genera enlace profundo a WhatsApp para reporte.
