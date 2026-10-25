# pitch-pages (beta)

Página personalizada por propuesta: muestra el job del cliente, tu intro en picture-in-picture,
tu video principal y 3 proyectos de tu portfolio elegidos según lo que pide el job.

```
Cliente abre /{slug}
  ├─ Tarjeta con el texto real de su job post   (se guarda en Supabase)
  ├─ ▶ Play  → intro (6-8 s) en círculo abajo a la izquierda
  ├─ al terminar el intro → video principal (60-90 s) a pantalla completa
  └─ debajo: 3 proyectos relevantes + "reply on Upwork"
```

## Probar en tu Mac (5 min, sin base de datos)

```bash
npm install
npm run dev
```

Abre http://localhost:3000/demo : verás la página con un job de ejemplo. Sin videos todavía
muestra "Video coming soon"; es normal.

## Despliegue paso a paso

### 1. Supabase (base de datos + videos)
1. supabase.com → New project (guarda la contraseña).
2. SQL Editor → pega todo `supabase/schema.sql` → Run.
3. Project Settings → API: copia **Project URL**, **anon key** y **service_role key**.

### 2. GitHub + Vercel
1. Crea un repo nuevo (`pitch-pages`) y sube esta carpeta. `.gitignore` ya excluye claves y videos.
2. Vercel → Add New Project → importa el repo (framework: Next.js, sin tocar nada).
3. Environment Variables:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon key (la pública, **nunca** la service_role aquí)
4. Deploy. Prueba `https://TU-PROYECTO.vercel.app/demo` (ya no funciona el demo cuando hay Supabase: usa un slug real).

### 3. Subdominio (GoDaddy, gratis)
1. Vercel → proyecto → Settings → Domains → agrega el subdominio que elijas.
2. Vercel te da un valor para un registro **CNAME**.
3. GoDaddy → tu dominio → DNS → Add → CNAME → nombre = el subdominio, valor = el de Vercel.
4. Espera unos minutos al HTTPS.

### 4. Scripts de Python (en tu Mac)
```bash
cd tools
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # completa SUPABASE_URL, SUPABASE_SERVICE_KEY, SITE_BASE_URL
brew install ffmpeg           # solo si no lo tienes
```

### 5. Cuando tengas tus videos
```bash
python compress_video.py intro_raw.mov intro.mp4 --max-mb 15
python compress_video.py main_raw.mov  main.mp4  --max-mb 45
python upload_videos.py --intro intro.mp4 --main main.mp4
```
El último comando imprime `INTRO_VIDEO_URL=...` y `MAIN_VIDEO_URL=...`. Pégalas en Vercel
(Settings → Environment Variables) y haz **Redeploy**. Desde ese momento todas las páginas usan tus videos.

## Uso diario

| Paso | Quién | Cómo |
|---|---|---|
| Buscar un job (filtros: ≤15 propuestas, <24 h, pago verificado) | Claude | Se lo pides en el chat |
| Crear el pitch y el link | Claude o tú | Claude te pasa el `job.json`; tú corres `python new_pitch.py --json job.json` (si Claude tiene Supabase conectado, lo inserta él) |
| Escribir la propuesta con el link | Claude | |
| Leer el job y la propuesta | **Tú** | Tu intro dice "leí tu job": tiene que ser verdad |
| Enviar | Claude, con tu OK | Solo después de que apruebes el preview final |
| Ver quién abrió el video | Tú | `python list_pitches.py` |

## Notas
- Todas las páginas llevan `noindex`: el texto del job no aparece en Google.
- Los links usan un slug aleatorio de 8 caracteres; la base de datos no se puede listar con la clave pública.
- No pongas email ni teléfono en la página: Upwork penaliza sacar el contacto de la plataforma.
- Si algún día subes una captura auténtica de un job, pásala con `--card-image-url` y la página la usa en vez de la tarjeta.
- Edita `data/portfolio.ts` para cambiar o agregar proyectos y sus palabras clave.
