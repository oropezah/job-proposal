# Guiones para grabar (en inglés, con tu cara)

Reglas: mira a la cámara, buena luz de frente, sin ruido, ritmo natural. Si te equivocas, repite la toma;
un video imperfecto y humano funciona mejor que uno perfecto y leído.

## 1) Intro genérico (6-8 segundos) — sirve para TODOS los clientes

> "Hey! I read your job post, it's right here on screen. I'm a real person writing to you, not a bot.
> Here's a quick look at work close to what you need."

Es el mismo video para todos, así que no digas "grabé esto para ti" ni nombres a nadie.
Esto sí es verdad cada vez: tú lees el job y la propuesta antes de aprobar el envío.

## 2) Video principal (60-90 segundos)

**0:00 - 0:10 — Quién eres**
> "I'm Henry. I run Synco Agency, where I build AI agents and automations, mostly on n8n,
> for clinics and service businesses. Let me show you three things I've built."

**0:10 - 0:30 — Demo 1: WhatsApp booking agent** (grabación de pantalla, datos difuminados)
> "This is a WhatsApp agent for a medical clinic. A patient asks for an appointment, the agent checks real
> availability, and the event lands in Google Calendar. It can also cancel and reschedule."

**0:30 - 0:50 — Demo 2: Instagram DM agent + CRM**
> "This one answers Instagram DMs from ads, qualifies the lead and logs it. Here's the CRM I built so the team
> can see the whole pipeline in one place."

**0:50 - 1:10 — Demo 3: RAG chatbot**
> "And this chatbot answers from the business's own documents instead of guessing, using a vector database."

**1:10 - 1:20 — Cierre**
> "If this looks close to what you need, reply to my proposal on Upwork. I'm happy to start with a small first
> task so you can judge the work. Thanks for watching."

## Qué grabar de pantalla (con datos difuminados)
1. Chat de WhatsApp agendando una cita + el evento apareciendo en Google Calendar.
2. El workflow de n8n (zoom a los nodos principales, sin credenciales ni teléfonos).
3. El CRM de Instagram (inbox, pipeline).
4. El chatbot RAG respondiendo una pregunta del documento.

## Cómo grabar
- OBS Studio (gratis): una escena con la pantalla y tu cámara en una esquina, o grabas la cámara aparte para el intro.
- Exporta en `.mp4` o `.mov`; después `tools/compress_video.py` lo deja a 720p y menos de 50 MB.
