# Gym Trainer App

## Descripción

Gym Trainer App es una aplicación web desarrollada con React que permite a los entrenadores de gimnasio gestionar sus alumnos, ejercicios y rutinas de manera eficiente. La aplicación utiliza Firebase para la autenticación, almacenamiento de datos, y almacenamiento de archivos.

## Características

- **Autenticación**: Registro e inicio de sesión con cuentas de Google utilizando Firebase Authentication.
- **Gestión de Alumnos**: Agrega, edita, y elimina información de alumnos.
- **Gestión de Ejercicios**: Define y administra ejercicios con diferentes parámetros como nombre, grupo muscular, nivel, peso, etc.
- **Gestión de Rutinas**: Crea, edita y asigna rutinas a los alumnos por días de la semana.
- **Firebase Integration**: Almacena de forma segura los datos utilizando Firestore y archivos en Firebase Storage.

## Tecnologías Utilizadas

- **Frontend**: React.js, Material-UI (MUI)
- **Backend/Database**: Firebase (Firestore, Authentication, Storage)
- **Deployment**: Netlify

## Instalación

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:

1. **Clonar el repositorio:**

   \`\`\`bash
   git clone https://github.com/tu-usuario/gym-trainer-app.git
   cd gym-trainer-app
   \`\`\`

2. **Instalar las dependencias:**

   Asegúrate de tener Node.js y npm instalados, luego ejecuta:

   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   \`\`\`bash
   REACT_APP_FIREBASE_API_KEY=tu_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=tu_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=tu_firebase_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=tu_firebase_measurement_id
   \`\`\`

4. **Ejecutar la aplicación:**

   \`\`\`bash
   npm start
   \`\`\`

   La aplicación se abrirá en `http://localhost:3000`.

## Despliegue

