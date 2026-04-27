import React, { useState } from 'react';

const US_COURIERS = [
  { name: 'UPS', url: 'https://www.ups.com/track', logo: '🟤', desc: 'Número empieza con 1Z' },
  { name: 'FedEx', url: 'https://www.fedex.com/fedextrack', logo: '🟣', desc: 'Número de 12–22 dígitos' },
  { name: 'USPS', url: 'https://tools.usps.com/go/TrackConfirmAction', logo: '🔵', desc: 'Empieza con 94, 93, 92...' },
  { name: 'DHL', url: 'https://www.dhl.com/us-en/home/tracking.html', logo: '🟡', desc: '10 dígitos numéricos' },
  { name: 'Amazon Logistics', url: 'https://www.amazon.com/progress-tracker', logo: '🟠', desc: 'Empieza con TBA' },
  { name: 'OnTrac', url: 'https://www.ontrac.com/tracking', logo: '⚫', desc: 'Empieza con C' },
  { name: 'LaserShip', url: 'https://www.lasership.com/track', logo: '🔴', desc: '1LS + número' },
  { name: 'Newgistics', url: 'https://tracking.newgistics.com', logo: '🟢', desc: 'NGT + número' },
];

const sections = [
  {
    id: 'casillero',
    title: '📬 ¿Cómo usar tu casillero?',
    icon: '📬',
    steps: [
      { title: 'Copia tu dirección', desc: 'Ve a "Mi Casillero" y copia tu dirección de Miami. Cada usuario tiene una dirección única con tu nombre y número de Suite.' },
      { title: 'Entra a cualquier tienda USA', desc: 'Abre Amazon, Nike, Adidas, Best Buy o cualquier tienda americana. En el campo de dirección de envío usa exactamente la dirección de tu casillero.' },
      { title: 'Completa la compra en la tienda', desc: 'Paga directamente en la tienda americana con tu tarjeta. El paquete llegará a nuestra bodega en Miami.' },
      { title: 'Regístralo en MANGOO', desc: 'Vuelve a MANGOO, ve a "Mi Casillero", selecciona la tienda y llena el formulario con la URL del producto, precio y descripción.' },
      { title: 'Rastreo en tiempo real', desc: 'En 2-3 días hábiles el paquete llega a nuestra bodega en Miami. Lo consolidamos y enviamos a Colombia. Puedes rastrear cada etapa.' },
    ],
    address: true,
  },
  {
    id: 'tracking',
    title: '📦 Ya compré — tengo número de tracking',
    icon: '📦',
    steps: [
      { title: 'Ve a "Mi Casillero"', desc: 'Selecciona la opción "Ya compré, tengo tracking" (el botón de la derecha).' },
      { title: 'Ingresa el número de seguimiento', desc: 'Copia el número de tracking que te dio la tienda (UPS, FedEx, USPS, DHL, Amazon, etc.).' },
      { title: 'Valor declarado', desc: 'Ingresa exactamente el precio que pagaste en USD. Esto es importante para el proceso de aduana en Colombia.' },
      { title: 'Nombre aduanero', desc: 'Selecciona la categoría del producto según la lista. Esto ayuda en el proceso de aduana con la DIAN.' },
      { title: 'Sube la factura', desc: 'Si tienes la factura o invoice de la tienda, súbela en PDF o imagen. Acelera el proceso de aduana.' },
    ],
    couriers: true,
  },
  {
    id: 'marketplace',
    title: '🛍️ Comprar en el Marketplace',
    icon: '🛍️',
    steps: [
      { title: 'Explora el catálogo', desc: 'En el Marketplace encuentras productos que ya están en Colombia. No tienes que esperar envío desde USA.' },
      { title: 'Agrega al carrito', desc: 'Selecciona la cantidad y haz clic en "Agregar al carrito". Puedes agregar productos de diferentes categorías.' },
      { title: 'Revisa el carrito', desc: 'Verifica los productos, cantidades y precios. Si tu compra supera $200 USD verás la alerta de impuestos de aduana.' },
      { title: 'Paga con tarjeta', desc: 'Ingresa los datos de tu tarjeta débito o crédito. El pago es seguro con encriptación SSL.' },
      { title: 'Recibe en 1-3 días', desc: 'Los productos del Marketplace ya están en Colombia. Los recibes en cualquier ciudad en 1-3 días hábiles.' },
    ],
  },
  {
    id: 'aduana',
    title: '🛃 ¿Qué pasa con la aduana?',
    icon: '🛃',
    content: [
      { title: 'Límite de $200 USD', desc: 'Según la DIAN (Colombia), compras de hasta $200 USD pueden ingresar sin impuestos como "tráfico postal".' },
      { title: 'Compras mayores a $200 USD', desc: 'Si el valor supera $200 USD, se aplica un arancel de importación (~19% entre IVA y arancel). MANGOO lo calcula automáticamente.' },
      { title: 'Nombre aduanero', desc: 'Cada producto tiene una categoría aduanera. Al registrar un paquete, elige la correcta para evitar problemas con la DIAN.' },
      { title: 'Factura / Invoice', desc: 'Siempre es mejor tener la factura original. La subimos cuando registras el paquete.' },
    ],
  },
];

export default function Help() {
  const [open, setOpen] = useState('casillero');
  const ADDRESS = '8751 NW 93rd Street, Warehouse D, Miami, FL 33178, United States';

  return (
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Centro de Ayuda</div><div className="page-sub">Guías paso a paso para usar MANGOO</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 0, height: 'fit-content' }}>
          {sections.map(s => (
            <div key={s.id} onClick={() => setOpen(s.id)}
              style={{ padding: '13px 16px', cursor: 'pointer', background: open===s.id?'var(--o100)':'transparent', borderLeft: `3px solid ${open===s.id?'var(--o600)':'transparent'}`, fontWeight: open===s.id?600:400, color: open===s.id?'var(--o700)':'var(--g700)', transition: 'all .15s', fontSize: 14 }}>
              {s.icon} {s.title.split('?')[0].replace(s.icon+' ','')}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          {sections.filter(s=>s.id===open).map(s=>(
            <div key={s.id} className="anim-up">
              <div className="card mb-20">
                <div className="card-body">
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>{s.title}</div>

                  {s.steps && s.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--o600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i+1}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{step.title}</div>
                        <div style={{ fontSize: 14, color: 'var(--g600)', lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}

                  {s.content && s.content.map((item, i) => (
                    <div key={i} style={{ background: 'var(--g50)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 14, color: 'var(--g600)', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  ))}

                  {/* Address block */}
                  {s.address && (
                    <div style={{ background: 'var(--g950)', borderRadius: 14, padding: 20, marginTop: 20 }}>
                      <div style={{ fontSize: 12, color: 'var(--o400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📬 Tu dirección en Miami</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: 'white', lineHeight: 1.8 }}>
                        [Tu nombre] — Suite #[Tu Suite]<br/>
                        8751 NW 93rd Street, Warehouse D<br/>
                        Miami, FL 33178<br/>
                        United States
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Ve a "Mi Casillero" para copiar tu dirección personalizada con tu nombre y Suite.</div>
                    </div>
                  )}

                  {/* Couriers */}
                  {s.couriers && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 Empresas de mensajería USA (rastrear)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                        {US_COURIERS.map(c => (
                          <a key={c.name} href={c.url} target="_blank" rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--g50)', borderRadius: 10, border: '1px solid var(--g200)', textDecoration: 'none', transition: 'all .15s', color: 'inherit' }}
                            onMouseOver={e=>e.currentTarget.style.borderColor='var(--o400)'}
                            onMouseOut={e=>e.currentTarget.style.borderColor='var(--g200)'}>
                            <span style={{ fontSize: 24 }}>{c.logo}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--g900)' }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--g500)' }}>{c.desc}</div>
                            </div>
                            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--o600)', fontWeight: 500 }}>Rastrear →</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ fontWeight: 700, marginBottom: 12 }}>❓ ¿Tienes más preguntas?</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" className="btn btn-primary">💬 WhatsApp</a>
                    <a href="mailto:soporte@mangoo.app" className="btn btn-ghost">✉️ Email</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
