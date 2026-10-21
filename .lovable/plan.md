# Publicar páginas de usuarios en wearemiiles.com/<nombre>

## Qué va a pasar para el usuario
1. En Estudio elige una plantilla y pulsa «Usar esta plantilla».
2. Su agente (Claude, Cursor…) la adapta con preguntas, igual que ya lo hace.
3. Al final le dice: «Publica mi página en Miiles». El agente sube los archivos y regresa el enlace `wearemiiles.com/<su nombre de usuario>`.
4. En Estudio aparece una sección nueva, **«Mis páginas»**, con la plantilla que eligió, el enlace público, la fecha de publicación y opciones para despublicar o borrar.
5. Free: 1 página. Pro: páginas ilimitadas (la primera usa `/<usuario>`, las demás `/<usuario>/<nombre-página>`).

## Piezas
- **Almacén de páginas en Miiles**: cada página guarda su dueño, la plantilla de origen, su dirección, su estado (borrador/publicada) y sus archivos (HTML, CSS, imágenes). Cada persona solo ve y cambia las suyas.
- **Herramientas nuevas en el conector** (siempre a nombre de quien autorizó):
  - `list_my_pages`: ver mis páginas.
  - `save_page_files`: guardar o actualizar los archivos de mi página (con límites de tamaño y tipos permitidos).
  - `publish_page` / `unpublish_page`: publicar o despublicar.
  - Respetan el límite Free/Pro y el nombre de usuario del perfil (si no tiene, se le pide definirlo).
- **Servidor público de páginas**: una función que entrega los archivos de las páginas publicadas según la dirección, sin dejar ver borradores.
- **Estudio → «Mis páginas»**: lista, enlace, despublicar, borrar.
- **Guía y prompt** de «Usar esta plantilla» y `/conecta-tu-ia` actualizados con la orden «Publica mi página en Miiles».

## Lo que tienes que hacer tú en Hostinger (una sola vez)
wearemiiles.com vive en Hostinger, así que hay que indicarle que las direcciones de usuario se muestren desde Miiles. Te dejo listo un archivo de reglas (`.htaccess`) para pegarlo en Hostinger: envía `wearemiiles.com/<nombre>` al servidor de páginas de Miiles y deja intactas las páginas que ya existen en Miiles Briefs. Si tu plan de Hostinger no permite reenviar así, la alternativa es mover wearemiiles.com a un subdominio o a este proyecto; te aviso si pasa.

Mientras eso no esté, las páginas se podrán ver en una dirección provisional de Miiles para probar.

## Detalles técnicos
- Tabla `user_sites` (owner_id, template_id, slug, path, status, published_at) y `user_site_files` en un bucket privado `user-sites`; RLS por `auth.uid()`; slug único; trigger valida límite por plan con `has_active_subscription`.
- Herramientas MCP con `supabaseForUser(ctx)` (token OAuth del usuario, sin service role); se quita la mención «solo lectura» del servidor y las tools nuevas llevan anotaciones correctas (`destructiveHint` en unpublish/delete).
- Edge Function pública `site-serve`: resuelve `/<usuario>[/<pagina>]/<archivo>`, solo sirve `status = published`, cabeceras CSP estrictas y tipos MIME por extensión.
- Reglas `.htaccess` con `RewriteRule` + proxy (`[P]`) hacia `site-serve`, excluyendo rutas y archivos reales de Miiles Briefs.
- Tests: límite Free = 1 / Pro ilimitado, slugs reservados y validación de archivos.
- Se actualiza `AGENTS.md` (ya no catálogo solo lectura), se extrae el manifest y hay que publicar la app.
