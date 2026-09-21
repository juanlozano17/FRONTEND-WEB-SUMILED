import React, { useState } from 'react';

const Contact = ({ cambiarVista }) => {
  // Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    correo: '',
    telefono: '',
    asunto: ''
  });

  // Estado para controlar el indicador de carga del botón
  const [cargando, setCargando] = useState(false);

  // Función para actualizar los valores conforme el usuario escribe
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función que se ejecuta al presionar "Enviar mensaje"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3001/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
        // Limpiamos el formulario después de enviar
        setFormData({ nombres: '', correo: '', telefono: '', asunto: '' });
      } else {
        alert(data.message || 'Hubo un error al enviar el mensaje.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor. Revisa si el backend está encendido.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="container my-5">
        <h1 className="text-center fw-bold mb-5">Contáctenos</h1>
        
        <div className="row g-5">
          {/* Columna Izquierda: Formulario */}
          <div className="col-md-6">
            <h4 className="fw-bold mb-4">Con gusto atenderemos tu solicitud</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombres:</label>
                <input 
                  type="text" 
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="form-control bg-light" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Correo electrónico:</label>
                <input 
                  type="email" 
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="form-control bg-light" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono de contacto:</label>
                <input 
                  type="tel" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="form-control bg-light" 
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Asunto:</label>
                <textarea 
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  className="form-control bg-light" 
                  rows="3" 
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-dark px-4 py-2 fw-bold"
                disabled={cargando}
              >
                {cargando ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Mapa e Información */}
          <div className="col-md-6">
            {/* Mapa corregido para React */}
            <div className="rounded mb-4" style={{ height: '250px', overflow: 'hidden' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!4v1788214033024!6m8!1m7!1sumNbayzWJWOqKvyOHaWpyA!2m2!1d4.593603034903758!2d-74.19143919708016!3f116.65961736633227!4f1.7400361654661793!5f1.5362075765591219" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
                title="Mapa de ubicación"
              ></iframe>
            </div>

            <div className="d-flex flex-column gap-3">
              <p><i className="bi bi-shop me-2"></i> Carrera: 7 # 54 25 Soacha</p>
              <p><i className="bi bi-whatsapp me-2"></i>3219065380</p>
              <p><i className="bi bi-envelope-fill me-2"></i> contacto@sumiledsas.com</p>
              <hr />
              <div className="mt-2">
                <p className="fw-bold mb-1">Horario de atención</p>
                <p className="text-muted"><i className="bi bi-clock me-2"></i> Lunes a Sabado de 8:30 a.m. a 7:00 p.m.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;