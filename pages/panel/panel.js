document.addEventListener('DOMContentLoaded', () => {
    // 1. RECUPERAR DATOS DEL USUARIO EN SESIÓN
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioSesion'));

    // 2. SEGURIDAD: SI NO HAY SESIÓN, REDIRIGIR AL LOGIN
    if (!usuarioActivo) {
        window.location.href = "../login/login.html";
        return;
    }

    // 3. ACTIVAR FUNCIONES INICIALES
    cargarDatosUsuario(usuarioActivo);
    configurarEventosBasicos();
    renderizarMovimientos(usuarioActivo); // <--- Esto limpia los datos genéricos al entrar

    // 4. ESCUCHAR EL BOTÓN DE TRANSFERENCIA
    const btnTransferir = document.querySelector('#view-transferir .btn-confirm-spa');
    if (btnTransferir) {
        btnTransferir.addEventListener('click', ejecutarTransferencia);
    }
});

// --- VINCULACIÓN DE DATOS ---
function cargarDatosUsuario(usuario) {
    const nombreHeader = document.getElementById('user-name-header'); 
    if (nombreHeader) nombreHeader.textContent = usuario.nombre;

    const inputNombre = document.getElementById('user-name-profile');
    if (inputNombre) inputNombre.value = usuario.nombre;

    const saldoDisplay = document.getElementById('user-balance');
    if (saldoDisplay) {
        saldoDisplay.textContent = `$ ${usuario.saldo.toLocaleString('es-CO')}`;
    }

    const idDisplay = document.getElementById('user-id-display');
    if (idDisplay) idDisplay.textContent = usuario.id;

    renderizarProductos(usuario);
}

// --- LÓGICA DE TRANSFERENCIAS (LAS 3 REGLAS) ---
function ejecutarTransferencia() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioSesion'));
    const listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Capturar datos del formulario
    const cuentaDestino = document.querySelector('#view-transferir input[placeholder="Ej: 987654321"]').value;
    const montoInput = document.querySelector('#view-transferir input[placeholder="$ 0"]').value;
    const monto = parseFloat(montoInput.replace(/[^0-9.-]+/g,""));

    if (!cuentaDestino || isNaN(monto) || monto <= 0) {
        alert("Por favor, ingrese datos válidos.");
        return;
    }

    if (monto > usuarioActivo.saldo) {
        alert("Saldo insuficiente.");
        return;
    }

    // REGLA 3: MISMO PRODUCTO
    if (cuentaDestino === usuarioActivo.detalles.ahorros || cuentaDestino === usuarioActivo.detalles.corriente) {
        alert("No se permiten transferencias al mismo producto de origen.");
        return;
    }

    // REGLA 2: TRANSFERENCIA A OTROS USUARIOS
    const receptor = listaUsuarios.find(u => u.detalles.ahorros === cuentaDestino || u.detalles.corriente === cuentaDestino);

    if (receptor) {
        // Actualizar saldos
        usuarioActivo.saldo -= monto;
        receptor.saldo += monto;

        // --- REGISTRO DE MOVIMIENTOS ---
        if (!usuarioActivo.movimientos) usuarioActivo.movimientos = [];
        if (!receptor.movimientos) receptor.movimientos = [];

        const ahora = new Date();
        const timestamp = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Movimiento para el que envía (Rojo)
        usuarioActivo.movimientos.unshift({
            fecha: timestamp,
            tipo: "Transferencia Enviada",
            detalle: `Para: ${receptor.nombre}`,
            monto: -monto
        });

        // Movimiento para el que recibe (Verde)
        receptor.movimientos.unshift({
            fecha: timestamp,
            tipo: "Transferencia Recibida",
            detalle: `De: ${usuarioActivo.nombre}`,
            monto: monto
        });

        // Actualizar base de datos global
        const indexActivo = listaUsuarios.findIndex(u => u.id === usuarioActivo.id);
        const indexReceptor = listaUsuarios.findIndex(u => u.id === receptor.id);
        
        listaUsuarios[indexActivo] = usuarioActivo;
        listaUsuarios[indexReceptor] = receptor;

        localStorage.setItem('usuarioSesion', JSON.stringify(usuarioActivo));
        localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

        alert(`Transferencia a ${receptor.nombre} exitosa.`);
        location.reload(); 
    } else {
        alert("La cuenta destino no existe.");
    }
}

// --- LÓGICA DE LA TABLA DE MOVIMIENTOS ---
function renderizarMovimientos(usuario) {
    const tablaBody = document.getElementById('movimientos-body');
    if (!tablaBody) return;

    // LIMPIEZA: Borra los datos genéricos (12, 14, 15 de abril) del HTML
    tablaBody.innerHTML = '';

    if (!usuario.movimientos || usuario.movimientos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay movimientos registrados</td></tr>';
        return;
    }

    usuario.movimientos.forEach(mov => {
        const [fecha, hora] = mov.fecha.split(' ');
        const row = `
            <tr>
                <td>${fecha}</td>
                <td>${hora || '--:--'}</td>
                <td>${mov.tipo}</td>
                <td>${mov.detalle}</td>
                <td class="${mov.monto < 0 ? 'amount-minus' : 'amount-plus'}">
                    ${mov.monto < 0 ? '-' : '+'} $ ${Math.abs(mov.monto).toLocaleString('es-CO')}
                </td>
                <td><span class="status-done">Exitoso</span></td>
            </tr>`;
        tablaBody.innerHTML += row;
    });
}

// --- PRODUCTOS Y EVENTOS ---
function renderizarProductos(usuario) {
    const contenedor = document.getElementById('products-container');
    if (!contenedor) return;
    contenedor.innerHTML = ''; 
    if (usuario.detalles.ahorros) {
        contenedor.innerHTML += crearHTMLProducto("Cuenta de Ahorros", usuario.detalles.ahorros, "fa-piggy-bank");
    }
    if (usuario.detalles.corriente) {
        contenedor.innerHTML += crearHTMLProducto("Cuenta Corriente", usuario.detalles.corriente, "fa-building-columns");
    }
}

function crearHTMLProducto(tipo, numero, icono) {
    return `<div class="product-card">
                <div class="product-icon"><i class="fa-solid ${icono}"></i></div>
                <div class="product-info"><h4>${tipo}</h4><p>${numero}</p></div>
            </div>`;
}

function configurarEventosBasicos() {
    const btnToggle = document.getElementById('toggle-visibility');
    if (btnToggle) {
        btnToggle.addEventListener('click', function() {
            const balanceText = document.getElementById('user-balance');
            const eyeIcon = document.getElementById('eye-icon');
            balanceText.classList.toggle('hidden-balance');
            if (balanceText.classList.contains('hidden-balance')) {
                eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioSesion');
            window.location.href = "../index/index.html";
        });
    }
}

function cambiarInterfaz(vista) {
    const dashboard = document.getElementById('view-dashboard');
    const consignar = document.getElementById('view-consignar');
    const retirar = document.getElementById('view-retirar');
    const transferir = document.getElementById('view-transferir');
    const movimientos = document.getElementById('view-movimientos');
    const perfil = document.getElementById('view-perfil');
    const btnVolver = document.getElementById('btn-volver-superior');

    const vistas = [dashboard, consignar, retirar, transferir, movimientos, perfil];
    vistas.forEach(el => { if(el) el.style.display = 'none'; });

    if (vista === 'dashboard') {
        if (dashboard) dashboard.style.display = 'grid';
        if (btnVolver) btnVolver.style.display = 'none';
        return;
    }

    const vistaActiva = document.getElementById(`view-${vista}`);
    if (vistaActiva) {
        vistaActiva.style.display = 'block';
        if (btnVolver) btnVolver.style.display = 'flex';
    }
}

function seleccionarTipo(elemento) {
    const chips = document.querySelectorAll('.type-chip');
    chips.forEach(chip => chip.classList.remove('active'));
    elemento.classList.add('active');
}