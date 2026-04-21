// ==========================================
// 1. FÁBRICAS DE NÚMEROS (Lógica de Negocio)
// ==========================================

// Genera: 12345 67890 (10 dígitos en bloques de 5)
const generarCuentaUnica = () => {
    const n1 = Math.floor(10000 + Math.random() * 90000);
    const n2 = Math.floor(10000 + Math.random() * 90000);
    return `${n1} ${n2}`;
};

// Genera: 1234 5678 9012 (12 dígitos en bloques de 4)
const generarTarjetaUnica = () => {
    const b1 = Math.floor(1000 + Math.random() * 9000);
    const b2 = Math.floor(1000 + Math.random() * 9000);
    const b3 = Math.floor(1000 + Math.random() * 9000);
    return `${b1} ${b2} ${b3}`;
};

// Genera fecha de vencimiento (Mes/Año) exactamente 5 años después
const generarVencimiento = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = (hoy.getFullYear() + 5).toString().slice(-2);
    return `${mes}/${anio}`;
};

// ==========================================
// 2. EVENTO PRINCIPAL DE REGISTRO
// ==========================================

document.getElementById('form-registro').addEventListener('submit', function(event) {
    event.preventDefault(); // Detenemos el envío para procesar con JS

    // A. Captura de datos de los inputs
    const identificacion = document.getElementById('reg-id').value;
    const nombre = document.getElementById('reg-nombre').value;
    const usuario = document.getElementById('reg-username').value;
    const contrasena = document.getElementById('reg-pass').value;
    const confirmacion = document.getElementById('reg-pass-confirm').value;
    
    // Captura del celular e indicativo
    const indicativo = document.getElementById('reg-indicativo').value;
    const numeroCelular = document.getElementById('reg-celular').value;
    const celularCompleto = `${indicativo} ${numeroCelular}`;

    // B. VALIDACIÓN: Contraseñas iguales
    if (contrasena !== confirmacion) {
        alert("Las contraseñas no coinciden. Por favor, verifica.");
        return;
    }

    // C. VALIDACIÓN: Selección de productos
    const checkboxes = document.querySelectorAll('input[name="producto"]:checked');
    let productosSeleccionados = [];
    checkboxes.forEach(cb => productosSeleccionados.push(cb.value));

    if (productosSeleccionados.length === 0) {
        alert("Debes seleccionar al menos un producto para abrir tu cuenta.");
        return;
    }

    // D. ASIGNACIÓN DE DETALLES POR PRODUCTO
    // Creamos una estructura para guardar los números generados
    let detallesProductos = {
        ahorros: productosSeleccionados.includes("Cuenta de Ahorros") ? generarCuentaUnica() : null,
        corriente: productosSeleccionados.includes("Cuenta Corriente") ? generarCuentaUnica() : null,
        tarjeta: productosSeleccionados.includes("Tarjeta de Crédito") ? {
            numero: generarTarjetaUnica(),
            cvv: Math.floor(100 + Math.random() * 900),
            vencimiento: generarVencimiento()
        } : null
    };

    // E. PERSISTENCIA (Guardar en LocalStorage)
    let listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Validar que el username no se repita
    if (listaUsuarios.find(u => u.username === usuario)) {
        alert("El nombre de usuario ya existe. Elige otro.");
        return;
    }

    // Crear el objeto final del usuario
    const nuevoUsuario = {
        id: identificacion,
        nombre: nombre,
        username: usuario,
        password: contrasena,
        celular: celularCompleto,
        productos: productosSeleccionados,
        detalles: detallesProductos,
        saldo: 1000000, // Saldo inicial de prueba
        movimientos: []
    };

    // Guardar y Redirigir
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

    alert(`¡Bienvenido a NexoBank, ${nombre}! Tu registro ha sido exitoso.`);
    window.location.href = "../login/login.html";
});