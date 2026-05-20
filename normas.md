# Landing Page Futurista Gaming — Especificación Completa

## Tecnologías

La aplicación debe desarrollarse utilizando:

- Preact
- TypeScript
- Vite
- TailwindCSS
- Motion One (animaciones)
- Lucide Icons

---

# Objetivo

La aplicación NO es pública ni comercial.

Es una aplicación privada utilizada por un pequeño grupo de amigos para herramientas relacionadas con videojuegos como:

- League of Legends
- Dead By Daylight
- Escape From Tarkov
- Rust

La intención visual NO es parecer una web corporativa ni una tienda.

Debe parecer:

- un launcher premium
- una interfaz HUD futurista
- una herramienta privada avanzada

Inspiración visual:

- Riot Client
- Tarkov UI
- OBS Studio
- dashboards cyberpunk minimalistas
- paneles sci-fi militares

---

# Estilo Visual

## Tema

- Oscuro
- Futurista
- Minimalista
- Técnico
- Premium

## Paleta de colores

### Principales

- Cyan
- Violeta
- Azul eléctrico

### Accent

- Naranja suave / óxido

## Fondo

- Negro azulado profundo
- Glow neon moderado
- Grid tecnológico tenue
- Scanlines suaves
- Partículas mínimas
- Noise/grain sutil

## Evitar

- RGB exagerado
- estética gamer infantil
- exceso de efectos
- glow extremo
- colores saturados

---

# Tipografía

## Títulos

- Orbitron
- Exo 2

## Texto normal

- Inter
- Manrope

---

# Estructura General

La página debe ocupar toda la pantalla y sentirse como una aplicación desktop moderna.

## Layout

- Navbar superior minimalista
- Hero section futurista
- Grid de herramientas por juego
- Estado del sistema
- Actualizaciones recientes
- Accesos rápidos

## NO incluir

- redes sociales
- pricing
- testimonios
- newsletter
- footer corporativo
- marketing empresarial

La sensación debe ser:

> “herramienta privada técnica avanzada”

---

# Arquitectura y Organización

## Stack

- Preact + TypeScript
- Arquitectura modular
- Componentes reutilizables
- TailwindCSS
- Motion One
- CSS variables
- Responsive

---

# Estructura de carpetas

```txt
src/
├── assets/
├── components/
│   ├── ui/
│   ├── cards/
│   ├── layout/
│   ├── effects/
│   └── animations/
├── sections/
│   ├── hero/
│   ├── games/
│   ├── updates/
│   ├── status/
│   └── shortcuts/
├── hooks/
├── styles/
├── utils/
├── types/
├── pages/
└── main.tsx
```

---

# Navbar

## Diseño

Navbar transparente con blur:

- logo geométrico minimalista
- Inicio
- Herramientas
- Estado
- Actualizaciones
- botón “Abrir App”

## Comportamiento

- blur dinámico al hacer scroll
- borde inferior glow suave
- hover neon minimalista
- transición smooth

## Animaciones

- fade-down inicial
- underline animado
- hover glow

---

# Hero Section

## IMPORTANTE

NO utilizar:

- cajas 3D
- loot boxes
- cubos sci-fi
- objetos flotantes genéricos

---

## Concepto visual

La parte derecha debe contener:

- núcleo tecnológico circular
- HUD holográfico
- anillos concéntricos
- líneas orbitales
- partículas pequeñas
- paneles flotantes futuristas

Sensación:

- radar sci-fi
- sistema operativo militar
- interfaz holográfica

---

## Elementos flotantes

Pequeños paneles mostrando:

- “Sistema operativo”
- “Rendimiento óptimo”
- “v2.1.0”
- “Todo en orden”

---

## Animaciones

- rotación ultra lenta
- glow pulse
- scanlines
- partículas flotando
- parallax leve
- opacity pulsing

---

## Texto principal

### Título

```txt
Mejora tu juego.
Domina cada partida.
```

### Subtexto

```txt
Herramientas avanzadas, estadísticas en tiempo real y sistemas diseñados para maximizar rendimiento y control.
```

---

## Botones

- Abrir App
- Ver novedades

---

## Badges

- Ligero
- Seguro
- Siempre actualizado

---

# Grid de Juegos

## IMPORTANTE

Es la sección MÁS importante visualmente.

Debe contener 4 cards:

- League of Legends
- Dead By Daylight
- Escape From Tarkov
- Rust

---

# Diseño de Cards

Cada card debe tener:

- imagen del juego
- overlay oscuro
- borde neon único
- glow dinámico
- estadísticas
- CTA

---

## Colores por juego

### League of Legends

- violeta
- azul

### Dead By Daylight

- naranja
- rojo oscuro

### Escape From Tarkov

- verde militar

### Rust

- naranja óxido

---

# Hover de Cards

## Comportamiento

- elevación suave
- glow incrementado
- borde animado
- ligera rotación 3D
- zoom leve de imagen

## Timing

```txt
300ms ease
```

---

# Animaciones de entrada

- stagger reveal
- fade-up
- opacity transitions
- transform GPU accelerated

---

# Información de cada card

Cada card debe incluir:

- icono
- nombre
- descripción
- estadísticas
- botón “Ver herramientas”

---

# Estado del Sistema

## Diseño

Panel técnico estilo dashboard.

## Información

- Servidores
- Actualizaciones
- Anti-ban
- Base de datos

## Estados

- Operativo
- Al día
- Activo
- Sincronizada

## Estilo

- iconos minimalistas
- glow suave
- grid limpio
- terminal sci-fi

---

# Actualizaciones

## Diseño

Timeline futurista:

- versiones
- fechas
- cambios

## Animaciones

- línea vertical glow
- dots pulsando
- hover interactivo

---

# Atajos Rápidos

## Lista

- Funciones principales
- Configuración
- Guías
- Solución de problemas

## Hover

- desplazamiento horizontal leve
- glow
- arrow animation

---

# Fondo Global

Agregar:

- grid tecnológico tenue
- grain/noise
- estrellas mínimas
- scanlines suaves
- partículas pequeñas

## IMPORTANTE

Debe sentirse elegante y premium.

NO exagerar efectos.

---

# Animaciones

## Librería

Utilizar:

- Motion One

---

# Implementar

- fade-up
- fade-down
- stagger animations
- hover scaling
- parallax
- glow pulse
- animated borders
- floating particles
- radial animations

---

# Reglas de performance

Todas las animaciones deben usar:

- transform
- opacity
- GPU acceleration

Evitar:

- lag
- scroll jank
- animaciones pesadas
- reflows innecesarios

---

# Sensación de las animaciones

Deben sentirse:

- fluidas
- premium
- silenciosas
- sofisticadas
- tecnológicas

---

# Responsive

## Desktop-first

Breakpoints:

- 1920
- 1440
- 1280
- 1024
- 768

---

## Mobile

En móvil:

- stack vertical
- hero simplificado
- cards adaptadas
- navegación compacta

---

# TailwindCSS

## Utilizar

- backdrop-blur
- gradients
- border opacity
- shadow glow
- custom utilities
- CSS variables

---

# Crear utilidades reutilizables

- glow utilities
- panel styles
- neon borders
- HUD decorations
- animated gradients

---

# Componentes Reutilizables

Crear componentes reales y reutilizables:

```tsx
<Navbar />
<HeroSection />
<GameCard />
<StatusPanel />
<UpdateTimeline />
<ShortcutPanel />
<GlowButton />
<GlassPanel />
<AnimatedBorder />
<HUDBackground />
<FloatingParticles />
```

---

# Calidad Final

La página debe parecer:

- una app premium real
- un launcher técnico
- una herramienta privada avanzada
- una interfaz sci-fi moderna

---

# NO debe parecer

- template barato
- web corporativa
- landing comercial
- web gamer infantil
- portfolio genérico

---

# Prioridades Visuales

Priorizar:

- spacing perfecto
- jerarquía visual
- composición limpia
- microinteracciones
- motion design elegante
- sensación tecnológica seria

---

# Resultado esperado

Generar:

- código limpio
- estructura profesional
- componentes reutilizables
- responsive completo
- animaciones implementadas
- estética premium futurista
- experiencia fluida y moderna
- dashboard gaming sci-fi de alta calidad

# Responsive Design (MUY IMPORTANTE)

La página DEBE verse perfecta tanto en:

- monitores 1080p
- monitores 1440p (2K)
- pantallas ultrawide
- laptops
- tablets

---

# Problema a evitar

NO diseñar únicamente pensando en una resolución fija.

La interfaz debe adaptarse correctamente a:

- diferentes densidades de píxeles
- distintos DPI scaling de Windows
- zoom del navegador
- tamaños físicos distintos

---

# IMPORTANTE

La UI debe mantener:

- misma sensación visual
- mismas proporciones
- spacing consistente
- jerarquía visual correcta

independientemente de:

- 1080p
- 2K
- escalado 100%
- escalado 125%
- escalado 150%

---

# Requisitos Responsive

## Desktop First

Diseñar inicialmente para:

- 1920x1080
- 2560x1440

y luego adaptar hacia abajo.

---

# Breakpoints requeridos

```ts
1920px
1440px
1280px
1024px
768px
480px
```

---

# Layout Responsive

## Hero Section

El hero debe:

- escalar correctamente
- NO romper el layout
- NO desalinearse
- NO generar espacios vacíos raros

### En 2K

- mantener proporciones visuales
- aprovechar espacio adicional
- aumentar ligeramente spacing
- mantener equilibrio visual

### En 1080p

- mantener densidad correcta
- evitar gigantismo
- evitar que el texto ocupe demasiado

---

# Grid de Juegos

La sección de juegos debe usar:

- CSS Grid
- auto-fit
- minmax()

Ejemplo:

```css
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
```

---

# Escalado Correcto

NO usar:

```css
width: 1400px;
height: 900px;
```

Usar:

```css
width: 100%;
max-width: 1600px;
```

---

# Unidades Responsivas

Priorizar:

- rem
- %
- vw
- vh
- clamp()

Evitar abuso de:

- px fijos

---

# Tipografía Fluida

Usar:

```css
font-size: clamp(2rem, 4vw, 5rem);
```

para títulos principales.

---

# Spacing Fluido

Usar:

- clamp()
- spacing escalable
- paddings adaptativos

Ejemplo:

```css
padding: clamp(1rem, 3vw, 4rem);
```

---

# Responsive Visual Premium

La UI debe sentirse:

- igual de premium en 1080p
- igual de premium en 2K

NO debe ocurrir:

- elementos gigantes
- texto microscópico
- exceso de espacio vacío
- cards deformadas
- glow desproporcionado

---

# Compatibilidad DPI

La página debe comportarse correctamente con:

- Windows scaling 100%
- Windows scaling 125%
- Windows scaling 150%

---

# Testing Obligatorio

Probar manualmente en:

- 1920x1080
- 2560x1440
- 3440x1440
- 1366x768

Además probar:

- zoom 90%
- zoom 100%
- zoom 125%

---

# Performance Responsive

Mantener:

- 60fps
- animaciones fluidas
- transforms GPU accelerated
- mínimo layout shift

---

# Recomendaciones Técnicas

## Usar:

- CSS Grid
- Flexbox
- clamp()
- minmax()
- container utilities
- max-width dinámicos

---

# Evitar

- tamaños hardcodeados
- offsets manuales excesivos
- absolute positioning innecesario
- layouts rígidos

---

# Objetivo Final

La aplicación debe verse como una herramienta premium nativa moderna tanto en:

- pantallas 1080p
- pantallas 2K
- monitores ultrawide

sin perder:

- calidad visual
- proporciones
- elegancia
- legibilidad
- coherencia del diseño