import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PagoSeguro = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    documento: '',
    telefono: '',
    direccion: '',
    ciudad: 'Bogotá D.C.',
    metodoPago: 'contraentrega'
  });

  const [pasarelaActiva, setPasarelaActiva] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [datosCompraFinal, setDatosCompraFinal] = useState(null);

  // Función robusta para extraer el precio sin importar cómo venga en el objeto
  const parsePrecio = (item) => {
    const valorBruto = item.precio !== undefined ? item.precio : (item.precio_unitario !== undefined ? item.precio_unitario : 0);
    if (typeof valorBruto === 'number') return valorBruto;
    if (!valorBruto) return 0;
    const limpio = valorBruto.toString().replace(/[^0-9]/g, '');
    return Number(limpio) || 0;
  };

  useEffect(() => {
    const productosGuardados = JSON.parse(localStorage.getItem('carrito_pyp')) || [];
    setCarrito(productosGuardados);

    // Precargar datos del usuario logueado si existe en el localStorage
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || localStorage.getItem('usuariologueado'));
    if (usuarioLogueado) {
      setFormData(prev => ({
        ...prev,
        nombre: `${usuarioLogueado.nombre || ''} ${usuarioLogueado.apellidos || ''}`.trim(),
        email: usuarioLogueado.correo || '',
        telefono: usuarioLogueado.telefono || '',
        direccion: usuarioLogueado.direccion || ''
      }));
    }
  }, []);

  const totalPagar = carrito.reduce((acc, item) => {
    const precioNum = parsePrecio(item);
    const cantidadNum = Number(item.cantidad) || 1;
    return acc + (precioNum * cantidadNum);
  }, 0);

  // 🚚 LÓGICA DE ENVÍO: Si la compra es mayor a $100.000 es GRATIS, de lo contrario cuesta $10.000
  const costoEnvio = totalPagar === 0 ? 0 : (totalPagar > 100000 ? 0 : 10000);
  const totalGeneral = totalPagar + costoEnvio;

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const seleccionarMetodo = (metodo) => {
    setFormData(prev => ({ ...prev, metodoPago: metodo }));
  };

  const descargarFacturaPDF = (compra) => {
    const ventanaFactura = window.open('', '_blank');
    ventanaFactura.document.write(`
      <html>
        <head>
          <title>Factura de Venta - SUMILED SAS</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; position: relative; }
            .check-circle {
              width: 50px; height: 50px; background-color: #ffc107; color: #000;
              border-radius: 50%; display: flex; align-items: center; justify-content: center;
              font-size: 28px; margin: 0 auto 10px auto; line-height: 50px; text-align: center;
            }
            .sello-pendiente {
              position: absolute; top: 0; right: 0; border: 3px solid #ffc107; color: #b78103;
              padding: 5px 15px; font-weight: bold; font-size: 16px; transform: rotate(10deg);
              border-radius: 5px; text-transform: uppercase; letter-spacing: 2px; background-color: #fff3cd;
            }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="sello-pendiente">PENDIENTE</div>
            <div class="check-circle">&#8987;</div>
            <h2>SUMILED SAS</h2>
            <p>NIT: 900.123.456-1 | Bogotá D.C., Colombia</p>
            <h3>Pedido / Venta #${compra.idVenta}</h3>
          </div>
          <div class="info">
            <p><strong>Cliente:</strong> ${compra.nombre}</p>
            <p><strong>Correo:</strong> ${compra.email || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> ${compra.telefono}</p>
            <p><strong>Dirección de Entrega:</strong> ${compra.direccion} (${compra.ciudad})</p>
            <p><strong>Método de Pago:</strong> ${compra.metodoPago.toUpperCase()}</p>
            <p><strong>Estado del Pedido:</strong> Pendiente de Verificación / Despacho</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${compra.productos.map(item => `
                <tr>
                  <td>${item.nombre || item.titulo || 'Producto'}</td>
                  <td>${item.cantidad}</td>
                  <td>$${parsePrecio(item).toLocaleString()}</td>                   <td>$${(parsePrecio(item) * (item.cantidad || 1)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: $${compra.totalParcial.toLocaleString()}</p>
            <p>Envío: ${compra.costoEnvio === 0 ? 'Gratis' : '$' + compra.costoEnvio.toLocaleString()}</p>
            <p>Total General: $${compra.totalGeneral.toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>¡Gracias por tu compra en SUMILED SAS! Tu pedido está siendo procesado.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    ventanaFactura.document.close();
  };

  const procesarGuardadoVenta = async (metodo) => {
    try {
      // Guardado directo mapeado con las columnas reales de tu tabla 'venta'
      const datosVentaInsert = {
        cliente: formData.nombre,
        correo: formData.email,
        telefono: formData.telefono,
        direccion: `${formData.direccion} (${formData.ciudad})`,
        total: totalGeneral,
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString()
      };

      const { data: ventaData, error: ventaError } = await supabase
        .from('venta')
        .insert([datosVentaInsert])
        .select()
        .single();

      if (ventaError) {
        console.error("Error al registrar la venta:", ventaError);
        alert("Hubo un error al registrar la venta: " + ventaError.message);
        return null;
      }

      const ventaId = ventaData?.idventa;

      // Insertar los detalles de los productos comprados en la tabla 'detalle_venta'
      const detallesInserts = carrito.map(item => ({
        idventa: ventaId,
        idproducto: item.idproducto || item.id || null,
        nombre_producto: item.nombre || item.titulo || 'Producto',
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: parsePrecio(item),
        subtotal: parsePrecio(item) * (Number(item.cantidad) || 1)
      }));

      const { error: detalleError } = await supabase
        .from('detalle_venta')
        .insert(detallesInserts);

      if (detalleError) {
        console.error("Error al registrar el detalle de venta:", detalleError);
      }

      const resumenCompra = {
        idVenta: ventaId,
        ...formData,
        metodoPago: metodo,
        productos: [...carrito],
        totalParcial: totalPagar,
        costoEnvio,
        totalGeneral
      };

      localStorage.removeItem('carrito_pyp');
      return resumenCompra;

    } catch (err) {
      console.error("Error inesperado en la transacción de compra:", err);
      return null;
    }
  };

  const iniciarPago = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!formData.nombre || !formData.telefono || !formData.direccion) {
      alert("Por favor completa los campos obligatorios de envío.");
      return;
    }

    if (formData.metodoPago === 'contraentrega') {
      setProcesandoPago(true);
      const resultado = await procesarGuardadoVenta('contraentrega');
      setProcesandoPago(false);
      
      if (resultado) {
        setDatosCompraFinal(resultado);
        setPedidoExitoso(true);
      }
    } else {
      setPasarelaActiva(true);
    }
  };

  const confirmarPagoSimulado = async () => {
    setProcesandoPago(true);
    
    setTimeout(async () => {
      const resultado = await procesarGuardadoVenta(formData.metodoPago);
      setProcesandoPago(false);
      
      if (resultado) {
        setPasarelaActiva(false);
        setDatosCompraFinal(resultado);
        setPedidoExitoso(true);
      }
    }, 1500);
  };

  if (pedidoExitoso && datosCompraFinal) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white" style={{ maxWidth: '600px', width: '100%' }}>
          
          <div className="mb-3">
            <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px', fontSize: '35px' }}>
              &#8987;
            </div>
          </div>

          <span className="badge bg-warning-subtle text-warning fw-bold px-3 py-1 rounded-pill mb-2 align-self-center">¡Pedido Registrado con Éxito!</span>
          <h2 className="fw-bold text-dark mb-1">¡Gracias por tu compra, {datosCompraFinal.nombre}!</h2>
          <p className="text-muted small mb-4">Tu pedido ha sido registrado correctamente y se encuentra en estado <strong>pendiente</strong> para revisión y despacho.</p>

          <div className="bg-light p-4 rounded-4 mb-4 text-start border">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Número de Pedido:</span>
              <span className="fw-bold text-dark">#{datosCompraFinal.idVenta}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Estado Actual:</span>
              <span className="badge bg-warning text-dark fw-bold">Pendiente</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Método de Pago:</span>
              <span className="fw-semibold text-uppercase text-dark">{datosCompraFinal.metodoPago}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Teléfono de Contacto:</span>
              <span className="fw-semibold text-dark">{datosCompraFinal.telefono}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Dirección de Entrega:</span>
              <span className="fw-semibold text-dark text-end" style={{ maxWidth: '250px' }}>{datosCompraFinal.direccion} ({datosCompraFinal.ciudad})</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2">
              <span className="fw-bold text-dark">Total del Pedido:</span>
              <span className="fw-bold text-success fs-5">${datosCompraFinal.totalGeneral.toLocaleString()}</span>
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <button 
              onClick={() => descargarFacturaPDF(datosCompraFinal)}
              className="btn btn-outline-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
            >
              <i className="bi bi-file-earmark-pdf me-2"></i> Descargar / Imprimir Factura Oficial
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
            >
              Volver al Inicio de la Tienda
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (pasarelaActiva) {
    const estilosPasarela = {
      nequi: { bg: '#ff1493', nombre: 'Nequi', icono: 'bi-phone', texto: 'Transfiere a la línea Nequi autorizada' },
      daviplata: { bg: '#da291c', nombre: 'DaviPlata', icono: 'bi-wallet2', texto: 'Aprueba el pago en tu aplicación DaviPlata' },
      bancolombia: { bg: '#fdc500', colorTexto: '#000', nombre: 'Bancolombia', icono: 'bi-bank', texto: 'Portal de Pagos PSE / Botón Bancolombia' },
      pse: { bg: '#495057', nombre: 'PSE / Pasarela Segura', icono: 'bi-shield-lock', texto: 'Conectando con la red interbancaria PSE' }
    };

    const config = estilosPasarela[formData.metodoPago] || estilosPasarela.pse;

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white" style={{ maxWidth: '480px', width: '100%' }}>
          
          <div className="mb-4">
            <span className="badge px-4 py-2 rounded-pill fw-bold fs-6 shadow-sm" style={{ backgroundColor: config.bg, color: config.colorTexto || '#fff' }}>
              <i className={`bi ${config.icono} me-2`}></i> {config.nombre}
            </span>
          </div>

          <h4 className="fw-bold text-dark mb-2">Simulación de Pasarela</h4>
          <p className="text-muted small mb-4">{config.texto}</p>

          <div className="bg-light p-4 rounded-4 mb-4 text-start border">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Titular:</span>
              <span className="fw-semibold text-dark small">{formData.nombre}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Celular / Cuenta:</span>
              <span className="fw-semibold text-dark small">{formData.telefono}</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2">
              <span className="fw-bold text-dark">Total a Pagar:</span>
              <span className="fw-bold text-primary fs-5">${totalGeneral.toLocaleString()}</span>
            </div>
          </div>

          {procesandoPago ? (
            <div className="py-4">
              <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
              <h6 className="fw-bold text-dark">Procesando pago simulado...</h6>
              <p className="text-muted small m-0">Registrando pedido pendiente en Supabase...</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <button 
                type="button"
                onClick={confirmarPagoSimulado} 
                className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
              >
                Simular Autorización Exitosa
              </button>
              <button 
                type="button"
                onClick={() => setPasarelaActiva(false)} 
                className="btn btn-link text-muted text-decoration-none small"
              >
                Cancelar y volver
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
          <div>
            <span className="text-muted small text-uppercase tracking-wider fw-bold">SUMILED SAS</span>
            <h2 className="fw-bold text-dark m-0">Finalizar Compra</h2>
          </div>
          <Link to="/carrito" className="btn btn-sm btn-outline-dark rounded-pill px-3 py-2 fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Volver al Carrito
          </Link>
        </div>

        <form onSubmit={iniciarPago}>
          <div className="row g-5">
            
            <div className="col-lg-7">
              
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-truck fs-5"></i>
                  </div>
                  <h5 className="fw-bold text-dark m-0">1. Datos del Cliente y Envío</h5>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Nombre Completo *</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    className="form-control form-control-lg bg-light border-0 fs-6" 
                    placeholder="Ej. Juan Lozano" 
                    value={formData.nombre} 
                    onChange={manejarCambio} 
                    required 
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small fw-bold">Teléfono de Contacto *</label>
                    <input 
                      type="tel" 
                      name="telefono" 
                      className="form-control form-control-lg bg-light border-0 fs-6" 
                      placeholder="Ej. 3021471144" 
                      value={formData.telefono} 
                      onChange={manejarCambio} 
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small fw-bold">Ciudad *</label>
                    <input 
                      type="text" 
                      name="ciudad" 
                      className="form-control form-control-lg bg-light border-0 fs-6" 
                      value={formData.ciudad} 
                      onChange={manejarCambio} 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label text-muted small fw-bold">Dirección de Residencia *</label>
                  <input 
                    type="text" 
                    name="direccion" 
                    className="form-control form-control-lg bg-light border-0 fs-6" 
                    placeholder="Ej. Calle 50 # 15-20" 
                    value={formData.direccion} 
                    onChange={manejarCambio} 
                    required 
                  />
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-credit-card-2-front fs-5"></i>
                  </div>
                  <h5 className="fw-bold text-dark m-0">2. Método de Pago</h5>
                </div>

                <div className="row g-3">
                  
                  {/* Nequi */}
                  <div className="col-12">
                    <div 
                      onClick={() => seleccionarMetodo('nequi')}
                      className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${formData.metodoPago === 'nequi' ? 'border-dark bg-white shadow-sm' : 'border-light bg-light opacity-75'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input type="radio" name="metodoPago" checked={formData.metodoPago === 'nequi'} onChange={() => seleccionarMetodo('nequi')} className="form-check-input fs-5 m-0" />
                        <div>
                          <span className="fw-bold text-dark d-block">Nequi</span>
                          <small className="text-muted">Transfiere directo desde tu aplicación.</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: '#ff1493', color: '#fff' }}>NEQUI</span>
                    </div>
                  </div>

                  {/* DaviPlata */}
                  <div className="col-12">
                    <div 
                      onClick={() => seleccionarMetodo('daviplata')}
                      className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${formData.metodoPago === 'daviplata' ? 'border-dark bg-white shadow-sm' : 'border-light bg-light opacity-75'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input type="radio" name="metodoPago" checked={formData.metodoPago === 'daviplata'} onChange={() => seleccionarMetodo('daviplata')} className="form-check-input fs-5 m-0" />
                        <div>
                          <span className="fw-bold text-dark d-block">DaviPlata</span>
                          <small className="text-muted">Paga rápido con tu número celular.</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: '#da291c', color: '#fff' }}>DAVIPLATA</span>
                    </div>
                  </div>

                  {/* Bancolombia */}
                  <div className="col-12">
                    <div 
                      onClick={() => seleccionarMetodo('bancolombia')}
                      className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${formData.metodoPago === 'bancolombia' ? 'border-dark bg-white shadow-sm' : 'border-light bg-light opacity-75'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input type="radio" name="metodoPago" checked={formData.metodoPago === 'bancolombia'} onChange={() => seleccionarMetodo('bancolombia')} className="form-check-input fs-5 m-0" />
                        <div>
                          <span className="fw-bold text-dark d-block">Transferencia Bancolombia</span>
                          <small className="text-muted">Cuenta de ahorros o corriente.</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: '#fdc500', color: '#000' }}>BANCOLOMBIA</span>
                    </div>
                  </div>

                  {/* PSE */}
                  <div className="col-12">
                    <div 
                      onClick={() => seleccionarMetodo('pse')}
                      className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${formData.metodoPago === 'pse' ? 'border-dark bg-white shadow-sm' : 'border-light bg-light opacity-75'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input type="radio" name="metodoPago" checked={formData.metodoPago === 'pse'} onChange={() => seleccionarMetodo('pse')} className="form-check-input fs-5 m-0" />
                        <div>
                          <span className="fw-bold text-dark d-block">PSE / Tarjeta Débito o Crédito</span>
                          <small className="text-muted">Pasarela de pagos en línea segura.</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold bg-secondary text-white">PSE</span>
                    </div>
                  </div>

                  {/* Contraentrega */}
                  <div className="col-12">
                    <div 
                      onClick={() => seleccionarMetodo('contraentrega')}
                      className={`p-3 rounded-4 border transition-all d-flex align-items-center justify-content-between ${formData.metodoPago === 'contraentrega' ? 'border-dark bg-white shadow-sm' : 'border-light bg-light opacity-75'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input type="radio" name="metodoPago" checked={formData.metodoPago === 'contraentrega'} onChange={() => seleccionarMetodo('contraentrega')} className="form-check-input fs-5 m-0" />
                        <div>
                          <span className="fw-bold text-dark d-block">Pago Contra Entrega</span>
                          <small className="text-muted">Efectivo o datáfono al recibir en la puerta.</small>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold bg-dark text-white">CONTRAENTREGA</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '30px' }}>
                <h5 className="fw-bold text-dark mb-4">Resumen del Pedido</h5>

                <div className="d-flex flex-column gap-3 mb-4 pb-3 border-bottom" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {carrito.map((item, index) => {
                    const precioItemNum = parsePrecio(item);
                    const cantidadItem = Number(item.cantidad) || 1;
                    return (
                      <div key={item.id || index} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <img src={item.imagen} alt={item.nombre} className="rounded-3 object-fit-cover" style={{ width: '45px', height: '45px' }} />
                          <div>
                            <h6 className="mb-0 fw-semibold text-dark fs-7" style={{ maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</h6>
                            <small className="text-muted">Cant: {item.cantidad}</small>
                          </div>
                        </div>
                        <span className="fw-bold text-dark fs-7">${(precioItemNum * cantidadItem).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-between mb-2 text-muted">
                  <span>Total parcial</span>
                  <span className="fw-semibold text-dark">${totalPagar.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-muted border-bottom pb-3">
                  <span>Envío {totalPagar > 100000 && <span className="badge bg-success-subtle text-success ms-1">¡Gratis por compras &gt; $100k!</span>}</span>
                  {costoEnvio === 0 ? <span className="text-success fw-bold">Gratis</span> : <span className="fw-semibold text-dark">${costoEnvio.toLocaleString()}</span>}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold text-dark fs-5">Total a Pagar</span>
                  <span className="fw-bold text-primary fs-4">${totalGeneral.toLocaleString()}</span>
                </div>

                {procesandoPago ? (
                  <button type="button" className="btn btn-warning w-100 py-3 rounded-pill fw-bold shadow-sm text-dark" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrando pedido pendiente...
                  </button>
                ) : (
                  <button type="submit" className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm">
                    <i className="bi bi-lock-fill me-2"></i> Confirmar Pedido Ahora
                  </button>
                )}

                <div className="text-center mt-3">
                  <small className="text-muted fs-8"><i className="bi bi-shield-lock me-1"></i> Transacción 100% segura y cifrada</small>
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default PagoSeguro;