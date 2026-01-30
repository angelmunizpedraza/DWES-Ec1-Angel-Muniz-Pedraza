# Sueños Valenti - Portal de Sesiones de Supra Conciencia

Portal web para gestionar sesiones grupales de conexión con la supra conciencia.

## ¿Qué es esto?

Una web hecha con Node.js y Express para la empresa Sueños Valenti donde los usuarios pueden registrarse, ver sesiones espirituales y añadirlas a un carrito.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Luego abrir http://localhost:3000 en el navegador.

## Estructura del proyecto

```
├── app.js              # Servidor principal
├── package.json        # Dependencias
├── views/              # Plantillas EJS
│   ├── inicio.ejs
│   ├── registro.ejs
│   ├── login.ejs
│   ├── perfil.ejs
│   ├── preferencias.ejs
│   ├── sesiones.ejs
│   └── carrito.ejs
├── public/             # Archivos estáticos
│   └── css/
│       └── estilos.css
└── data/               # Datos
    ├── usuarios.json   # Base de datos de usuarios
    └── accesos.txt     # Log de acciones
```

## Funcionalidades

- **Registro de usuarios**: Formulario con validación de nombre, email y edad
- **Login/Logout**: Sistema de sesiones
- **Zona privada**: Perfil del usuario (solo si hay sesión)
- **Carrito espiritual**: Añadir sesiones en sesión
- **Tema claro/oscuro**: Se guarda en cookies
- **Logs**: Se registran las acciones en accesos.txt

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Página de inicio |
| GET | /registro | Formulario de registro |
| POST | /registro | Procesar registro |
| GET | /login | Página de login |
| POST | /login | Procesar login |
| GET | /perfil | Zona privada |
| POST | /logout | Cerrar sesión |
| GET | /preferencias | Cambiar tema |
| POST | /preferencias | Guardar tema |
| GET | /sesiones | Ver sesiones disponibles |
| GET | /carrito | Ver carrito |
| POST | /carrito/agregar | Añadir al carrito |
| POST | /carrito/vaciar | Vaciar carrito |
| POST | /carrito/eliminar | Quitar item |

## Datos de prueba

Para hacer login después de registrarte, usa la contraseña: **1234**

## Tecnologías usadas

- Node.js
- Express
- EJS (plantillas)
- express-session (sesiones)
- cookie-parser (cookies)

---
Práctica de DWES - Ángel Muñiz Pedraza
