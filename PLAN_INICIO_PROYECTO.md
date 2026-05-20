# Plan de Inicio del Proyecto (Checklist Ejecutable)

Este documento define los pasos que vamos a seguir para iniciar y construir la primera pagina de la app, alineada con `normas.md`.

## 1. Preparacion del entorno

- [ ] Crear proyecto base con `Preact + TypeScript + Vite`.
- [ ] Instalar y configurar `TailwindCSS`.
- [ ] Instalar `Motion One`.
- [ ] Instalar `Lucide Icons`.
- [ ] Verificar que `npm run dev` arranca sin errores.

## 2. Estructura de carpetas

- [ ] Crear estructura base:

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

- [ ] Crear archivos iniciales por seccion y componente principal.

## 3. Sistema visual (tokens + utilidades)

- [ ] Definir variables CSS globales (`src/styles/tokens.css`):
- [ ] Colores base: fondo oscuro, cyan, violeta, azul electrico, accent oxido.
- [ ] Sombras/glow y bordes neon.
- [ ] Escalas de spacing y radios.
- [ ] Tipografias: titulos (`Orbitron` o `Exo 2`) y texto (`Inter` o `Manrope`).

- [ ] Crear utilidades reutilizables:
- [ ] `glow` suave.
- [ ] panel tipo glass.
- [ ] borde neon animado.
- [ ] fondo HUD (grid + scanlines + noise sutil).

## 4. Componentes reutilizables base

- [ ] `GlowButton`
- [ ] `GlassPanel`
- [ ] `AnimatedBorder`
- [ ] `HUDBackground`
- [ ] `FloatingParticles` (ligero, no invasivo)

## 5. Construccion de la primera pagina (Landing)

### 5.1 Navbar
- [ ] Logo geometrico minimal.
- [ ] Links: `Inicio`, `Herramientas`, `Estado`, `Actualizaciones`.
- [ ] CTA: `Abrir App`.
- [ ] Blur dinamico en scroll + borde glow sutil.

### 5.2 Hero Section (ajustada a norma)
- [ ] Titulo principal.
- [ ] Subtexto tecnico.
- [ ] Botones: `Abrir App` y `Ver novedades`.
- [ ] Badges: `Ligero`, `Seguro`, `Siempre actualizado`.
- [ ] Visual derecho con **nucleo circular HUD**, anillos y lineas orbitales.
- [ ] NO usar loot box/caja 3D.

### 5.3 Grid de juegos (prioridad visual maxima)
- [ ] 4 cards: LoL, DBD, Tarkov, Rust.
- [ ] Imagen + overlay + glow + estadisticas + CTA.
- [ ] Color tematico por juego.
- [ ] Hover: elevacion, glow, borde animado, leve zoom.

### 5.4 Secciones inferiores
- [ ] `StatusPanel`: servidores, updates, anti-ban, base de datos.
- [ ] `UpdateTimeline`: versiones, fechas, cambios.
- [ ] `ShortcutPanel`: funciones, configuracion, guias, troubleshooting.

## 6. Reglas de contenido (importante)

- [ ] No incluir: redes sociales, pricing, testimonios, newsletter, footer corporativo.
- [ ] Mantener tono de herramienta privada premium (no marketing publico).

## 7. Animaciones y performance

- [ ] Implementar con `Motion One`:
- [ ] fade-up/fade-down
- [ ] stagger reveal
- [ ] hover transitions (300ms ease)
- [ ] glow pulse y parallax leve

- [ ] Garantizar performance:
- [ ] animar solo `transform` y `opacity`
- [ ] evitar layout shifts y reflows innecesarios
- [ ] objetivo visual: fluido y sofisticado

## 8. Responsive (desktop-first real)

- [ ] Breakpoints objetivo: `1920`, `1440`, `1280`, `1024`, `768`, `480`.
- [ ] Usar `clamp()`, `%`, `vw/vh`, `minmax()`, `auto-fit`.
- [ ] Evitar dimensiones fijas rigidas.
- [ ] Verificar consistencia visual en 1080p, 2K y ultrawide.

## 9. QA manual obligatorio

- [ ] Probar resoluciones:
- [ ] `1920x1080`
- [ ] `2560x1440`
- [ ] `3440x1440`
- [ ] `1366x768`

- [ ] Probar zoom:
- [ ] `90%`
- [ ] `100%`
- [ ] `125%`

- [ ] Revisar: jerarquia, spacing, legibilidad, glow proporcionado y estabilidad visual.

## 10. Definicion de terminado (DoD)

La primera pagina se considera terminada cuando:

- [ ] Respeta `normas.md` en estructura y estilo.
- [ ] Tiene componentes reutilizables reales.
- [ ] Es responsive y estable en pruebas clave.
- [ ] Mantiene estetica premium futurista sin sobrecargar efectos.
- [ ] No incluye elementos prohibidos de landing comercial.

## 11. Orden de ejecucion recomendado

1. Setup tecnico.
2. Estructura + tokens visuales.
3. Componentes base reutilizables.
4. Navbar + Hero.
5. Grid de juegos.
6. Panels inferiores.
7. Motion + optimizacion.
8. Responsive + QA final.
