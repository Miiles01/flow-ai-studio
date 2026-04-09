

## Plan: Página de detalle de programa con postulación

### Resumen
Crear una página de detalle `/programs/:id` donde el usuario ve toda la información del programa y puede postularse. En la lista de programas, cada tarjeta será clickeable y llevará a esta página.

### Cambios

**1. Nueva página `src/pages/ProgramDetail.tsx`**
- Recibe el `id` del programa desde la URL (`useParams`)
- Carga el programa desde `brand_programs` por ID
- Muestra: marca, nombre, descripción completa, categoría, comisión, URL externa
- Botón "Postularme" que inserta en `user_applications` con status `"applied"`
- Si ya se postuló, muestra estado actual ("Postulado", "Guardado")
- Botón para volver a la lista

**2. Modificar `src/pages/Programs.tsx`**
- Hacer cada tarjeta de programa clickeable con `useNavigate` hacia `/programs/:id`
- Mantener el botón guardar pero el clic en la tarjeta navega al detalle

**3. Modificar `src/App.tsx`**
- Añadir ruta `/programs/:id` con `DashboardRoute` apuntando a `ProgramDetail`

**4. Base de datos**
- No se necesitan cambios de esquema. La tabla `user_applications` ya tiene `status` como texto libre, se usará `"applied"` para postulaciones.

### Diseño de la página de detalle
- Header con marca y nombre del programa
- Badges de categoría y comisión
- Descripción completa (sin truncar)
- Enlace externo al programa si existe
- Botón principal "Postularme" (o estado si ya aplicó)
- Botón secundario "Volver a programas"
- Animaciones de entrada consistentes con el resto de la app

