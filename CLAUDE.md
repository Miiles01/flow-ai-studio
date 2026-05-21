# Miiles — Reglas del Sistema de Diseño

Este proyecto es una plataforma SaaS (Miiles) construida con React + Vite + TypeScript + Supabase + Tailwind + shadcn/ui.

## Scope de trabajo
- **Dashboard pages** (Inicio, Tableros, Programas, Perfil, SearchAI): se tocan libremente
- **Landing pages** (`/`, `/acerca-de`, `/precios`, `/funciones`): NO se tocan salvo instrucción explícita
- **Auth pages** (`/login`, `/register`): NO tienen dark mode

---

## Colores

### Marca
```
miiles-blue:       #4059F1
miiles-blue-light: #E8ECFE
miiles-pink:       #FCB5B9
miiles-pink-light: #FEEDED
```

### Escala de grises Miiles
```
miiles-gray-50:  #F7F7F8  (fondos sutiles)
miiles-gray-100: #EEEFF2
miiles-gray-200: #D9DBE3  (bordes)
miiles-gray-400: #9499AE  (texto secundario)
miiles-gray-600: #4B4F63
miiles-gray-800: #1C1E2A
```

### Semánticos (CSS vars — adaptan con .dark)
- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-popover` / `text-popover-foreground`
- `bg-accent` / `text-accent-foreground`

---

## Dark mode

### Cómo funciona
- El `ThemeContext` guarda `"light"/"dark"` en localStorage
- `DashboardLayout` aplica la clase `.dark` en el wrapper + `bg-[hsl(222,20%,8%)]`
- Cada página obtiene `const { isDark } = useTheme()` desde `@/contexts/ThemeContext`
- Las landing/auth NO tienen ThemeProvider → siempre light

### Fondos oscuros
```
Page bg:    bg-[hsl(222,20%,8%)]   (#111219)
Sidebar:    hsl(222 20% 11%) → hsl(222 20% 9%)  (gradient)
Card dark:  bg-white/5
Subtle:     bg-white/10
Input dark: bg-[hsl(222,20%,14%)]  (via CSS var --input)
```

### Patrón de clases condicionales
```tsx
// Texto
className={`text-lg font-normal text-foreground`}              // usa CSS var, funciona en dark
className={isDark ? 'text-white' : 'text-black'}               // cuando necesitas control explícito

// Fondo de card
className={isDark ? 'bg-white/5' : 'bg-white'}

// Borde
className={isDark ? 'border-white/10' : 'border-[#F3F4F6]'}

// Ring sutil (board cards en dark)
className={isDark ? 'ring-1 ring-white/10' : ''}
```

### REGLA CRÍTICA: text-foreground vs herencia
Los elementos con SOLO clases tipográficas (`text-lg font-normal`) heredan el negro del `body` que está fuera del wrapper `.dark`.
- ✅ Siempre agregar `text-foreground` a headings y textos principales: `<h2 className="text-lg font-normal text-foreground">`
- ✅ Las clases CSS-var (`text-muted-foreground`, `bg-card`, etc.) SÍ adaptan automáticamente dentro de `.dark`
- ❌ No confiar en herencia de color para elementos dentro del dashboard

---

## Botones

### Primario (acción principal)
```tsx
// Light
"bg-black text-white rounded-full hover:bg-miiles-pink"

// Dark
"bg-black text-white border border-white/10 rounded-full hover:bg-zinc-900"

// Condicional
className={`rounded-full ${isDark ? 'bg-black text-white border border-white/10 hover:bg-zinc-900' : 'bg-black text-white hover:bg-miiles-pink'}`}
```

### Secundario / ghost en dark
```tsx
"bg-white/10 text-white border border-white/10 hover:bg-white/15"
```

### Destructivo
```tsx
// Light
"bg-red-50 text-red-500 hover:bg-red-100"
// Dark
"bg-red-950/40 text-red-400 hover:bg-red-950/60"
```

### Pills de filtro
```tsx
// Activo
"bg-foreground text-background"
// Inactivo light
"bg-background text-miiles-gray-400 shadow-sm"
// Inactivo dark
"bg-white/10 text-white/60"
```

---

## Cards

### Card estándar (contenido)
```tsx
// Usa shadcn <Card> — adapta automáticamente via CSS vars
<Card>
  <CardHeader><CardTitle className="text-base">Título</CardTitle></CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Card de tablero (negra)
```tsx
className={`aspect-[4/3] bg-black rounded-[24px] overflow-hidden cursor-pointer transition-colors ${isDark ? 'ring-1 ring-white/10' : ''}`}
```

### Card de stats
```tsx
className={`p-5 rounded-lg shadow-md cursor-pointer ${isDark ? 'bg-white/5' : 'bg-white'}`}
```

### Card de programa/item
```tsx
className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'}`}
```

---

## Tipografía

- **Font principal**: Poppins (300 light, 400 normal, 600 semibold)
- **Font editorial**: `'Welth Catritz'` italic — solo para headings hero en landing
- **Base weight**: 300 (light) en body
- **Headings**: `font-normal` (400) — NO usar font-bold en este proyecto

### Escala de texto en dashboard
```
Page title:     text-2xl md:text-3xl font-normal text-foreground
Section title:  text-lg font-normal text-foreground
Card title:     text-base font-normal
Body:           text-sm font-light
Secondary:      text-xs text-muted-foreground font-light
Micro:          text-[10px] text-miiles-gray-400 font-light
```

---

## Layout de páginas del dashboard

### Estructura estándar
```tsx
<div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-8">
```
- `md:pt-48` es el offset para el header fijo del sidebar
- `max-w-5xl` para páginas estándar, `max-w-2xl` para Perfil

### Carrusel horizontal (mobile bleed)
```tsx
<div className="flex gap-4 overflow-x-auto pt-2 pb-6 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
```
- `pt-2` es obligatorio para que el hover `y: -6` no se corte

---

## Animaciones

### Variantes de sección (estándar)
```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};
```

### Hover de cards
```tsx
whileHover={{ y: -4, transition: { duration: 0.2 } }}  // stats cards
whileHover={{ y: -6, transition: { duration: 0.2 } }}  // board cards
```

### Entrada de lista (stagger)
```tsx
initial={{ y: 8, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: i * 0.03 }}
```

---

## Border radius

```
Botones/pills:  rounded-full
Cards:          rounded-[24px] o rounded-lg
Sections:       rounded-xl o rounded-2xl
Inputs:         rounded-md
Sidebar:        rounded-[50px]
```

---

## Sidebar — mobile
- Al navegar desde el sidebar en mobile, SIEMPRE llamar `closeMobile()` antes de `navigate()`
- `closeMobile` viene de `const { setOpenMobile } = useSidebar()` + `const closeMobile = () => setOpenMobile(false)`

---

## Supabase
- Tablas clave: `profiles`, `flows`, `brand_programs`, `user_applications`, `notifications`, `user_roles`, `ai_conversations`, `ai_messages`
- Auth via `useAuth()` de `@/contexts/AuthContext`
- Cliente: `@/integrations/supabase/client`
