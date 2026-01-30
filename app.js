/*
    Servidor principal - Sueños Valenti
    Portal de sesiones grupales de supra conciencia
*/

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: 'suenos_valenti_secreto_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Middleware para pasar variables globales a las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.tema = req.cookies.tema || 'claro';
    next();
});

// Funcion para registrar acciones en log
function registrarLog(accion, usuario = 'anonimo') {
    const fecha = new Date().toLocaleString('es-ES');
    const linea = `[${fecha}] Usuario: ${usuario} - Accion: ${accion}\n`;
    const rutaLog = path.join(__dirname, 'data', 'accesos.txt');
    
    fs.appendFile(rutaLog, linea, (err) => {
        if (err) console.log('Error al escribir log:', err);
    });
}

// Funcion para leer usuarios
function leerUsuarios() {
    const rutaUsuarios = path.join(__dirname, 'data', 'usuarios.json');
    try {
        if (fs.existsSync(rutaUsuarios)) {
            const datos = fs.readFileSync(rutaUsuarios, 'utf8');
            return JSON.parse(datos);
        }
    } catch (err) {
        console.log('Error leyendo usuarios:', err);
    }
    return [];
}

// Funcion para guardar usuarios
function guardarUsuarios(usuarios) {
    const rutaUsuarios = path.join(__dirname, 'data', 'usuarios.json');
    fs.writeFileSync(rutaUsuarios, JSON.stringify(usuarios, null, 2));
}

// Lista de sesiones espirituales disponibles
const sesionesDisponibles = [
    { id: 1, nombre: 'Meditación Profunda', precio: 25, duracion: '60 min', descripcion: 'Conecta con tu yo interior' },
    { id: 2, nombre: 'Viaje Astral Guiado', precio: 40, duracion: '90 min', descripcion: 'Explora otros planos de existencia' },
    { id: 3, nombre: 'Sanación con Cristales', precio: 35, duracion: '75 min', descripcion: 'Equilibra tus chakras' },
    { id: 4, nombre: 'Regresión a Vidas Pasadas', precio: 50, duracion: '120 min', descripcion: 'Descubre quién fuiste' },
    { id: 5, nombre: 'Conexión con Guías', precio: 45, duracion: '90 min', descripcion: 'Recibe mensajes del universo' }
];

// ========== RUTAS GET ==========

// Pagina de inicio
app.get('/', (req, res) => {
    registrarLog('Visita pagina inicio', req.session.usuario?.nombre || 'anonimo');
    res.render('inicio', { titulo: 'Sueños Valenti' });
});

// Formulario de registro
app.get('/registro', (req, res) => {
    registrarLog('Acceso formulario registro');
    res.render('registro', { 
        titulo: 'Registro', 
        errores: [], 
        datos: {} 
    });
});

// Pagina de login
app.get('/login', (req, res) => {
    registrarLog('Acceso pagina login');
    res.render('login', { 
        titulo: 'Iniciar Sesión', 
        error: null 
    });
});

// Perfil (zona privada)
app.get('/perfil', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    registrarLog('Acceso perfil', req.session.usuario.nombre);
    res.render('perfil', { 
        titulo: 'Mi Perfil',
        usuario: req.session.usuario 
    });
});

// Preferencias
app.get('/preferencias', (req, res) => {
    registrarLog('Acceso preferencias', req.session.usuario?.nombre || 'anonimo');
    res.render('preferencias', { 
        titulo: 'Preferencias',
        temaActual: req.cookies.tema || 'claro'
    });
});

// Sesiones espirituales
app.get('/sesiones', (req, res) => {
    registrarLog('Acceso sesiones', req.session.usuario?.nombre || 'anonimo');
    
    // Inicializar carrito si no existe
    if (!req.session.carrito) {
        req.session.carrito = [];
    }
    
    res.render('sesiones', { 
        titulo: 'Sesiones Espirituales',
        sesiones: sesionesDisponibles,
        carrito: req.session.carrito
    });
});

// Ver carrito
app.get('/carrito', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    
    registrarLog('Ver carrito', req.session.usuario.nombre);
    
    const carrito = req.session.carrito || [];
    let total = 0;
    carrito.forEach(item => {
        total += item.precio;
    });
    
    res.render('carrito', { 
        titulo: 'Carrito Espiritual',
        carrito: carrito,
        total: total
    });
});

// ========== RUTAS POST ==========

// Procesar registro
app.post('/registro', (req, res) => {
    const { nombre, email, edad, ciudad, intereses } = req.body;
    let errores = [];
    
    // Validaciones
    if (!nombre || nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }
    
    // Validar email con regex simple
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regexEmail.test(email)) {
        errores.push('Introduce un email válido');
    }
    
    if (!edad || parseInt(edad) <= 0) {
        errores.push('La edad debe ser mayor que 0');
    }
    
    // Si hay errores devolver formulario
    if (errores.length > 0) {
        return res.render('registro', {
            titulo: 'Registro',
            errores: errores,
            datos: { nombre, email, edad, ciudad, intereses }
        });
    }
    
    // Leer usuarios existentes
    let usuarios = leerUsuarios();
    
    // Comprobar si email ya existe
    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        errores.push('Ya existe un usuario con ese email');
        return res.render('registro', {
            titulo: 'Registro',
            errores: errores,
            datos: { nombre, email, edad, ciudad, intereses }
        });
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre.trim(),
        email: email.toLowerCase(),
        edad: parseInt(edad),
        ciudad: ciudad || '',
        intereses: Array.isArray(intereses) ? intereses : (intereses ? [intereses] : []),
        fechaRegistro: new Date().toISOString(),
        password: '1234' // Password por defecto
    };
    
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    
    registrarLog('Nuevo usuario registrado: ' + email);
    
    // Redirigir a login con mensaje
    res.redirect('/login?registrado=1');
});

// Procesar login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.render('login', {
            titulo: 'Iniciar Sesión',
            error: 'Completa todos los campos'
        });
    }
    
    // Buscar usuario
    const usuarios = leerUsuarios();
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!usuario) {
        registrarLog('Intento login fallido: ' + email);
        return res.render('login', {
            titulo: 'Iniciar Sesión',
            error: 'Usuario no encontrado'
        });
    }
    
    // Comprobar password (en este caso es fija o la guardada)
    if (password !== usuario.password && password !== '1234') {
        registrarLog('Password incorrecta: ' + email);
        return res.render('login', {
            titulo: 'Iniciar Sesión',
            error: 'Contraseña incorrecta'
        });
    }
    
    // Crear sesion
    req.session.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        edad: usuario.edad,
        ciudad: usuario.ciudad,
        intereses: usuario.intereses
    };
    
    // Inicializar carrito
    req.session.carrito = [];
    
    registrarLog('Login exitoso', usuario.nombre);
    
    res.redirect('/perfil');
});

// Cerrar sesion
app.post('/logout', (req, res) => {
    if (req.session.usuario) {
        registrarLog('Logout', req.session.usuario.nombre);
    }
    req.session.destroy();
    res.redirect('/');
});

// Cambiar tema
app.post('/preferencias', (req, res) => {
    const { tema } = req.body;
    
    // Guardar en cookie (expira en 30 dias)
    res.cookie('tema', tema, { 
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true 
    });
    
    registrarLog('Cambio tema a: ' + tema, req.session.usuario?.nombre || 'anonimo');
    
    res.redirect('/preferencias');
});

// Añadir al carrito
app.post('/carrito/agregar', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    
    const { sesionId } = req.body;
    const sesion = sesionesDisponibles.find(s => s.id === parseInt(sesionId));
    
    if (sesion) {
        if (!req.session.carrito) {
            req.session.carrito = [];
        }
        req.session.carrito.push({
            ...sesion,
            fechaAgregado: new Date().toISOString()
        });
        
        registrarLog('Agregado al carrito: ' + sesion.nombre, req.session.usuario.nombre);
    }
    
    res.redirect('/sesiones');
});

// Vaciar carrito
app.post('/carrito/vaciar', (req, res) => {
    if (req.session.usuario) {
        registrarLog('Carrito vaciado', req.session.usuario.nombre);
    }
    req.session.carrito = [];
    res.redirect('/carrito');
});

// Eliminar item del carrito
app.post('/carrito/eliminar', (req, res) => {
    const { index } = req.body;
    
    if (req.session.carrito && req.session.carrito[index]) {
        const eliminado = req.session.carrito.splice(index, 1);
        registrarLog('Eliminado del carrito: ' + eliminado[0].nombre, req.session.usuario?.nombre || 'anonimo');
    }
    
    res.redirect('/carrito');
});

// Crear carpeta data si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Crear archivo de usuarios vacio si no existe
const usuariosPath = path.join(dataDir, 'usuarios.json');
if (!fs.existsSync(usuariosPath)) {
    fs.writeFileSync(usuariosPath, '[]');
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    registrarLog('Servidor iniciado');
});
