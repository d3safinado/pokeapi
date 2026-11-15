// ========================================================
// CONTROLADOR POKÉDEX RETRO
// ========================================================

const pokemon = document.getElementById("pokemon");
const boton = document.getElementById("buscar");
const nombre = document.getElementById("nombre");
const Numero = document.getElementById("Nº");
const altura = document.getElementById("Altura");
const peso = document.getElementById("Peso");
const sonido = document.getElementById("Sonido");
const imagen = document.getElementById("imagen");
const placeholder = document.getElementById("image-placeholder");
const errorMsg = document.getElementById("mensaje-error");
const tiposContenedor = document.getElementById("tipos");
const blueLight = document.getElementById("blue-light");

// Botones interactivos adicionales
const btnSound = document.getElementById("btn-sound");
const btnSoundPill = document.getElementById("btn-sound-pill");
const btnRandom = document.getElementById("btn-random");
const btnClear = document.getElementById("btn-clear");
const dpadUp = document.getElementById("dpad-up");
const dpadDown = document.getElementById("dpad-down");
const dpadLeft = document.getElementById("dpad-left");
const dpadRight = document.getElementById("dpad-right");

// Traducciones en español para los tipos de Pokémon
const TIPOS_ES = {
    normal: "NORMAL",
    fire: "FUEGO",
    water: "AGUA",
    electric: "ELÉCTRICO",
    grass: "PLANTA",
    ice: "HIELO",
    fighting: "LUCHA",
    poison: "VENENO",
    ground: "TIERRA",
    flying: "VOLADOR",
    psychic: "PSÍQUICO",
    bug: "BICHO",
    rock: "ROCA",
    ghost: "FANTASMA",
    dragon: "DRAGÓN",
    steel: "ACERO",
    dark: "SINIESTRO",
    fairy: "HADA"
};

let currentId = 0;
let isLoading = false;

// Función para reproducir el grito del Pokémon actual
function reproducirGrito() {
    if (sonido.src) {
        sonido.currentTime = 0;
        sonido.volume = 0.25;
        sonido.play().catch(e => console.log("Reproducción de audio bloqueada o no disponible:", e));
        
        // Efecto visual de pulso en el sensor azul
        if (blueLight) {
            blueLight.classList.add("loading");
            setTimeout(() => blueLight.classList.remove("loading"), 600);
        }
    }
}

// Función principal de búsqueda
function buscarPokemon(terminoBusqueda) {
    if (isLoading) return;

    let consulta = terminoBusqueda !== undefined ? String(terminoBusqueda) : pokemon.value;
    consulta = consulta.toLowerCase().trim();

    if (!consulta) return;

    isLoading = true;
    if (blueLight) blueLight.classList.add("loading");
    if (errorMsg) errorMsg.style.display = "none";

    fetch("https://pokeapi.co/api/v2/pokemon/" + consulta)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("Pokémon no encontrado");
            }
            return respuesta.json();
        })
        .then(datos => {
            currentId = datos.id;
            pokemon.value = datos.name;

            // Reproducir sonido / grito
            if (datos.cries && datos.cries.latest) {
                sonido.src = datos.cries.latest;
                sonido.volume = 0.25;
                sonido.play().catch(e => console.log("Reproducción de audio bloqueada:", e));
            } else {
                sonido.src = "";
            }

            // Datos textuales
            Numero.textContent = "Nº: " + String(datos.id).padStart(3, '0');
            altura.textContent = "Altura: " + (datos.height / 10) + " m";
            peso.textContent = "Peso: " + (datos.weight / 10) + " kg";
            nombre.textContent = datos.name.toUpperCase();

            // Renderizar tipos
            if (tiposContenedor && datos.types) {
                tiposContenedor.innerHTML = datos.types.map(item => {
                    const tipoName = item.type.name;
                    const nombreTraducido = TIPOS_ES[tipoName] || tipoName.toUpperCase();
                    return `<span class="type-badge type-${tipoName}">${nombreTraducido}</span>`;
                }).join("");
            }

            // Imagen / Artwork oficial de alta calidad
            const spriteUrl = datos.sprites.other?.['official-artwork']?.front_default 
                           || datos.sprites.front_default 
                           || "";

            if (spriteUrl) {
                imagen.src = spriteUrl;
                imagen.alt = datos.name;
                imagen.style.display = "block";
                if (placeholder) placeholder.style.display = "none";
            } else {
                imagen.style.display = "none";
                if (placeholder) placeholder.style.display = "flex";
            }
        })
        .catch(error => {
            console.warn(error);
            if (errorMsg) errorMsg.style.display = "block";
            nombre.textContent = "NO ENCONTRADO";
            Numero.textContent = "Nº: ???";
            altura.textContent = "Altura: ---";
            peso.textContent = "Peso: ---";
            if (tiposContenedor) tiposContenedor.innerHTML = "";
            imagen.style.display = "none";
            if (placeholder) placeholder.style.display = "flex";
        })
        .finally(() => {
            isLoading = false;
            if (blueLight) blueLight.classList.remove("loading");
        });
}

// Botón de búsqueda
boton.addEventListener("click", () => buscarPokemon());

// Búsqueda al presionar Enter en el input
pokemon.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        buscarPokemon();
    }
});

// Navegación con la cruceta (D-Pad)
function irAlSiguiente() {
    const siguienteId = currentId > 0 ? currentId + 1 : 1;
    buscarPokemon(siguienteId);
}

function irAlAnterior() {
    if (currentId <= 1) {
        buscarPokemon(1025); // Ciclar al último Pokémon conocido
    } else {
        buscarPokemon(currentId - 1);
    }
}

if (dpadUp) dpadUp.addEventListener("click", irAlSiguiente);
if (dpadRight) dpadRight.addEventListener("click", irAlSiguiente);
if (dpadDown) dpadDown.addEventListener("click", irAlAnterior);
if (dpadLeft) dpadLeft.addEventListener("click", irAlAnterior);

// Botón Pokémon aleatorio (botón redondo verde)
if (btnRandom) {
    btnRandom.addEventListener("click", () => {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        buscarPokemon(randomId);
    });
}

// Botones de reproducción de sonido
if (btnSound) btnSound.addEventListener("click", reproducirGrito);
if (btnSoundPill) btnSoundPill.addEventListener("click", reproducirGrito);
if (blueLight) blueLight.addEventListener("click", reproducirGrito);

// Botón limpiar búsqueda (píldora naranja)
if (btnClear) {
    btnClear.addEventListener("click", () => {
        pokemon.value = "";
        pokemon.focus();
    });
}

// Navegación con teclas de flecha del teclado físico (si el foco no está en el input)
window.addEventListener("keydown", (event) => {
    if (document.activeElement === pokemon) return;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        irAlSiguiente();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        irAlAnterior();
    }
});
