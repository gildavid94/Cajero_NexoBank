// Seleccionamos el botón por su ID
const boton = document.getElementById('btn-ingresar');

// Cuando el usuario haga clic en el botón...
boton.addEventListener('click', () => {
    
    // A. Cambiamos el texto para que parezca que el banco está "pensando"
    boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
    
    // B. Esperamos 2 segundos y saltamos al Panel de NexoBank
    setTimeout(() => {
        window.location.assign("../panel/panel.html");
    }, 2000); 

});