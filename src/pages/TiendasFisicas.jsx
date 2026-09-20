import React from 'react';

const TiendasFisicas = () => {
  const tiendas = [
    {
      id: 1,
      nombre: 'Punto Principal - Soacha',
      direccion: 'Cra. 7 #53 20',
      ciudad: 'Soacha, Cundinamarca',
      telefono: '3203978655',
      horario: 'Lunes a Sábado: 8:30 a.m. - 7:00 p.m. / Domingos y festivos: 9:00 a.m. - 3:00 p.m.',
      imagen: '/local-soacha.png',
      linkMaps: 'https://maps.app.goo.gl/Gx9At7RnnvbTyQa26' // 👈 Enlace directo añadido aquí
    },
    {
      id: 2,
      nombre: 'Punto Soacha',
      direccion: 'Cra. 7 # 54 25 Soacha',
      ciudad: 'Soacha, Cundinamarca',
      telefono: '3219065380',
      horario: 'Lunes a Sábado: 8:30 a.m. - 7:00 p.m. / Domingos y festivos: 9:00 a.m. - 3:00 p.m.',
      imagen: '/local-soacha2.png',
      linkMaps: `https://www.google.com/maps/place/Cra.+7+%2354-25,+Bogot%C3%A1,+Soacha,+Cundinamarca/@4.5941283,-74.1905864,19z/data=!4m6!3m5!1s0x8e3f9e4bdc0150bd:0x413fa506743c6258!8m2!3d4.594194!4d-74.1903958!16s%2Fg%2F11t74h10bh?entry=ttu&g_ep=EgoyMDI2MDkwMS4wIKXMDSoASAFQAw%3D%3D')}`
    }
  ];

  return (
    <div className="container-fluid p-0">
      
      {/* Encabezado Principal */}
      <div className="bg-light py-5 border-bottom mb-5">
        <div className="container text-center">
          <h1 className="fw-bold mb-3">Nuestras Tiendas Físicas</h1>
          <p className="text-secondary lead mx-auto" style={{ maxWidth: '700px' }}>
            Visítanos en nuestros puntos de venta autorizados de <span className="fw-semibold text-dark">Sumiled SAS</span>. Encuentra asesoría experta y todo nuestro catálogo en exposición.
          </p>
        </div>
      </div>

      {/* Contenedor de las Tarjetas de Tiendas */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
          {tiendas.map((tienda) => (
            <div key={tienda.id} className="col-12 col-md-6 col-lg-5">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <div style={{ height: '240px', overflow: 'hidden' }}>
                  <img 
                    src={tienda.imagen} 
                    alt={tienda.nombre} 
                    className="w-100 h-100 object-fit-cover" 
                  />
                </div>
                <div className="card-body d-flex flex-column justify-content-between p-4 bg-white">
                  <div>
                    <h4 className="fw-bold text-dark mb-3">{tienda.nombre}</h4>
                    
                    <p className="mb-2 text-secondary small d-flex align-items-center gap-2">
                      <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                      <span><strong>Dirección:</strong> {tienda.direccion} ({tienda.ciudad})</span>
                    </p>

                    <p className="mb-2 text-secondary small d-flex align-items-center gap-2">
                      <i className="bi bi-telephone-fill text-primary fs-5"></i>
                      <span><strong>Teléfono:</strong> {tienda.telefono}</span>
                    </p>

                    <p className="mb-3 text-secondary small d-flex align-items-start gap-2">
                      <i className="bi bi-clock-fill text-primary fs-5 mt-1"></i>
                      <span><strong>Horario:</strong> {tienda.horario}</span>
                    </p>
                  </div>

                  <a 
                    href={tienda.linkMaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-dark w-100 mt-3 fw-semibold py-2 rounded-pill shadow-sm"
                  >
                    <i className="bi bi-map me-2"></i> Ver cómo llegar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TiendasFisicas;