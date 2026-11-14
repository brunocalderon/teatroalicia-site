---
title: "Murano: One more night"
path: /i/murano
token: fk_qyWV9hdtePd2wPQHA5fmi2wC
lang: es
image: /images/murano-one-more-night-20-11-2026.jpg
imageAlt: "MURANO — One More Night, 20 de noviembre de 2026"
livestackFooter: false
submitLabel: Enviar
messages:
  submit: Enviar
  sending: Enviando…
  turnstileRequired: Completa la verificación de seguridad antes de enviar.
  connectionFailed: No pudimos enviar tu solicitud. Intenta de nuevo.
  thankYouBody: |
    Hemos recibido correctamente tu solicitud de tickets de cortesía.

    Si tu solicitud es aprobada, recibirás un correo electrónico con los tickets en un plazo máximo de 24 horas.

    ¡Esperamos verte en el evento!
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
  - name: id
    label: RUT / Pasaporte
    type: text
    required: true
    placeholder: "12.345.678-9 o pasaporte"
  - name: email
    label: Correo Electrónico
    type: email
    required: true
    placeholder: nombre@ejemplo.com
  - name: phone
    label: Teléfono
    type: tel
    required: true
  - name: instagram
    label: Usuario de Instagram
    type: instagram
    required: true
    placeholder: "@usuario"
  - name: birthday
    label: Fecha de Nacimiento
    type: date
    required: true
  - name: referral_id
    label: Invitado por
    type: referral
---