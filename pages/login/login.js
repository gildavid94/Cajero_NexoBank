// --- ESTADO GLOBAL DEL LOGIN ---
let intentosFallidos = 0;

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('btn-ingresar');
    // Buscamos el banner de estado por su clase principal
    const banner = document.querySelector('.status-banner');
    
    if (!boton) {
        console.error("No se encontró el botón con ID 'btn-ingresar'");
        return;
    }

    boton.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. SEGURIDAD: Bloqueo si ya se superaron los intentos
        if (intentosFallidos >= 3) {
            alert("Acceso bloqueado por seguridad.");
            return;
        }

        const userInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();
        const listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // 2. BUSCAR USUARIO
        const usuarioEncontrado = listaUsuarios.find(u => 
            (u.username === userInput || u.email === userInput) && u.password === passwordInput
        );

        if (usuarioEncontrado) {
            // LOGIN EXITOSO
            intentosFallidos = 0;
            
            // Animación del botón según tus estilos CSS
            boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
            boton.style.pointerEvents = 'none';

            localStorage.setItem('usuarioSesion', JSON.stringify(usuarioEncontrado));

            setTimeout(() => {
                window.location.assign("../panel/panel.html");
            }, 2000);

        } else {
            // LOGIN FALLIDO
            intentosFallidos++;
            const intentosRestantes = 3 - intentosFallidos;

            if (banner) {
                const textoBanner = banner.querySelector('p') || banner.querySelector('span');
                const iconoBanner = banner.querySelector('i');

                // Limpiar estados anteriores
                banner.classList.remove('info', 'warning', 'danger');

                if (intentosFallidos < 3) {
                    // APLICAR ESTADO WARNING (Amarillo/Naranja)
                    banner.classList.add('warning');
                    if (textoBanner) textoBanner.textContent = `Credenciales incorrectas. Te quedan ${intentosRestantes} intentos.`;
                    if (iconoBanner) iconoBanner.className = 'fa-solid fa-circle-exclamation';
                } else {
                    // APLICAR ESTADO DANGER (Rojo)
                    banner.classList.add('danger');
                    if (textoBanner) textoBanner.textContent = "Acceso bloqueado. Demasiados intentos fallidos.";
                    if (iconoBanner) iconoBanner.className = 'fa-solid fa-ban';
                    
                    // Bloqueo del botón
                    boton.disabled = true;
                    boton.style.background = "#555";
                    boton.textContent = "BLOQUEADO";
                }
            }
        }
    });
});