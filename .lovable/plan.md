# Precios en dólares + texto visible en la tarjeta Pro

## Qué verá el usuario
- **En /es:** precios en pesos como hoy (Pro $386 MXN/mes, $3,712 MXN/año).
- **En /en:** precios en dólares: Pro **$24 USD/month** y **$230 USD/year**.
- En la tarjeta negra de Pro, el texto «MXN /mes» (o «USD /month») se verá en blanco, ya no gris.
- Quien pague desde la versión en inglés paga de verdad en dólares; desde la versión en español, en pesos.
- El perfil muestra el precio y la moneda del plan que la persona contrató.

## Pasos
1. Crear dos precios nuevos en dólares para el producto Pro: `pro_monthly_usd` ($24/mes) y `pro_yearly_usd` ($230/año), uno por compra.
2. Tarjetas de precios: añadir precios en USD y moneda en los textos en inglés; el texto en la tarjeta Pro pasa a blanco.
3. Ventana «Mejora a Pro»: elegir el precio en pesos o en dólares según el idioma actual.
4. Perfil: mostrar el monto y moneda correctos según el plan contratado (MXN o USD, mensual o anual).
5. Revisar que el plan Pro se active igual después de pagar en dólares (los planes nuevos empiezan con `pro_`).
6. Probar en la vista previa: /es y /en en Precios, abrir el pago de prueba en ambas monedas con tarjeta de prueba 4242.

## Notas
- La comisión de Stripe por cobro internacional queda cubierta con el precio de $24.
- Los impuestos siguen calculándose automáticamente al pagar, como ahora.

## Detalles técnicos
- `src/locales/en/pricing.json`: `monthlyPrice "24"`, `annualPrice "230"`, nuevo `currency: "USD"`; `es` con `currency: "MXN"`. Test de locales sigue cuadrando claves.
- `PricingTable.tsx`: usar `t("pricing.currency")`; clase `text-white` en el span cuando `plan.highlighted`.
- `UpgradeProDialog.tsx`: `priceId = (lang === "en" ? "pro_*_usd" : "pro_*")` vía `i18n.language`.
- `Profile.tsx` líneas ~340: mapa price_id → monto/moneda.
- Verificar `payments-webhook` y `useSubscription`/`usePlan` aceptan cualquier `price_id` Pro.
