---
title: "Murano: One more night"
description: "Solicita tickets de cortesía para Murano — One More Night en Teatro Alicia. Completa el formulario de invitación."
path: /i/murano
eventId: teatro-alicia-murano-one-more-night-2026-11-20
eventKind: social-music
eventStart: "2026-11-20T21:00:00-03:00"
eventEnd: "2026-11-21T02:00:00-03:00"
invitationOnly: true
token: fk_qyWV9hdtePd2wPQHA5fmi2wC
lang: es
image: /images/murano-one-more-night-20-11-2026.jpg
imageAlt: "MURANO — One More Night, 20 de noviembre de 2026"
submitLabel: Solicitar mi acceso
messages:
  submit: Enviar
  sending: Enviando…
  turnstileRequired: Completa la verificación de seguridad antes de enviar.
  connectionFailed: No pudimos enviar tu solicitud. Intenta de nuevo.
  formBody: |
    _**Alicia Privé**_

    Completa tus datos para solicitar tu acceso de cortesía y ser parte de una noche especial.

    Los accesos son limitados.
  thankYouBody: |
    Bienvenido a _**Alicia Privé**_, estás un paso más cerca de vivir una noche inolvidable!

    Recibirás tus accesos de cortesía por correo electrónico dentro de las próximas horas.
fields:
  - name: firstName
    label: Nombre(s)
    type: text
    required: true
    placeholder: Tu nombre
  - name: lastName
    label: Apellido(s)
    type: text
    required: true
    placeholder: Tu apellido
  # - name: id
  #   label: RUT / Pasaporte
  #   type: text
  #   required: true
  #   placeholder: "12.345.678-9 o pasaporte"
  - name: email
    label: Correo Electrónico
    type: email
    required: true
    placeholder: nombre@ejemplo.com
  - name: phone
    label: Teléfono
    type: tel
    required: true
  # - name: instagram
  #   label: Usuario de Instagram
  #   type: instagram
  #   required: true
  #   placeholder: "@usuario"
  - name: birthday
    label: Fecha de Nacimiento
    type: date
    required: true
  - name: referral_id
    label: Invitado por
    type: referral
---