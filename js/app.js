function openLink(url) {
    window.open(url, '_blank');
}

// Crear partículas de fondo
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posición aleatoria
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Tamaño aleatorio entre 2px y 5px
        const size = Math.random() * 3 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Duración de animación aleatoria
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        body.appendChild(particle);
    }
});