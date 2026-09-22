import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const MisCompras = () => {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [productosDetalle, setProductosDetalle] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargarMisCompras();
  }, []);

  const cargarMisCompras = async () => {
    setCargando(true);
    try {
      const usuario = JSON.parse(localStorage.getItem('usuariologueado') || localStorage.getItem('usuarioLogueado') || '{}');
      const correoUsuario = usuario.correo || usuario.email || '';
      const nombreUsuario = usuario.nombre || '';

      if (!correoUsuario && !nombreUsuario) {
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from('venta')
        .select('*')
        .or(`correo.eq.${correoUsuario},cliente.ilike.%${nombreUsuario}%`)
        .order('idventa', { ascending: false });

      if (error) throw error;
      setCompras(data || []);
    } catch (err) {
      console.error("Error al cargar el historial de compras:", err);
    } finally {
      setCargando(false);
    }
  };

  const verDetallePedido = async (pedido) => {
    setPedidoDetalle(pedido);
    setCargandoDetalle(true);
    try {
      const { data: itemsData, error } = await supabase
        .from('detalle_venta')
        .select('*')
        .eq('idventa', pedido.idventa);

      if (error) throw error;

      const itemsEnriquecidos = await Promise.all(
        (itemsData || []).map(async (item) => {
          let imagenFinal = item.imagen || item.foto || '';
          
          if (!imagenFinal && item.idproducto) {
            const { data: prodData } = await supabase
              .from('producto')
              .select('imagenes, imagen')
              .eq('idproducto', item.idproducto)
              .single();
            
            if (prodData) {
              imagenFinal = prodData.imagenes || prodData.imagen || '';
            }
          }

          return {
            ...item,
            imagenResuelta: imagenFinal
          };
        })
      );

      setProductosDetalle(itemsEnriquecidos);
    } catch (err) {
      console.error("Error al cargar productos del pedido:", err);
      setProductosDetalle([]);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const obtenerEstiloEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': case 'entregado': 
        return { bg: 'bg-success bg-opacity-10', text: 'text-success', icono: 'bi-check-circle-fill' };
      case 'enviado': 
        return { bg: 'bg-info bg-opacity-10', text: 'text-info', icono: 'bi-truck' };
      case 'pendiente': 
        return { bg: 'bg-warning bg-opacity-10', text: 'text-warning text-dark', icono: 'bi-clock-history' };
      case 'cancelado': 
        return { bg: 'bg-danger bg-opacity-10', text: 'text-danger', icono: 'bi-x-circle-fill' };
      default: 
        return { bg: 'bg-secondary bg-opacity-10', text: 'text-secondary', icono: 'bi-info-circle' };
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '950px' }}>
        
        {/* Cabecera */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
          <div>
            <h2 className="fw-extrabold text-dark display-6 mb-1">Mis Compras</h2>
            <p className="text-muted mb-0">Historial completo, estado en tiempo real y detalles de tus pedidos.</p>
          </div>
          <Link to="/" className="btn btn-outline-dark rounded-pill px-4 fw-semibold shadow-sm bg-white">
            <i className="bi bi-arrow-left me-2"></i> Volver a la Tienda
          </Link>
        </div>

        {cargando ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
            <div className="spinner-border text-dark mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <h5 className="fw-bold text-dark">Cargando tus compras...</h5>
            <p className="text-muted small m-0">Sincronizando información segura.</p>
          </div>
        ) : compras.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {compras.map((compra) => {
              const estilo = obtenerEstiloEstado(compra.estado);
              const fechaLimpia = compra.fecha_pedido ? compra.fecha_pedido.split('T')[0] : 'Reciente';

              return (
                <div key={compra.idventa} className="card border-0 shadow-sm rounded-4 p-4 bg-white transition-all">
                  <div className="row align-items-center g-3">
                    
                    <div className="col-12 col-md-3">
                      <span className="badge bg-light text-muted fw-bold mb-1 px-2 py-1">REF: #{compra.idventa}</span>
                      <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-event text-muted"></i> {fechaLimpia}
                      </h6>
                    </div>

                    <div className="col-6 col-md-3">
                      <small className="text-muted d-block mb-1">Estado actual</small>
                      <span className={`badge ${estilo.bg} ${estilo.text} px-3 py-2 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1`}>
                        <i className={`bi ${estilo.icono}`}></i> {compra.estado || 'pendiente'}
                      </span>
                    </div>

                    <div className="col-6 col-md-3">
                      <small className="text-muted d-block mb-1">Total Pagado</small>
                      <span className="fw-extrabold text-success fs-5">${Number(compra.total || 0).toLocaleString()}</span>
                    </div>

                    <div className="col-12 col-md-3 text-md-end">
                      <button 
                        className="btn btn-dark btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm w-100"
                        onClick={() => verDetallePedido(compra)}
                      >
                        <i className="bi bi-eye me-1"></i> Ver Detalles
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5 border my-4">
            <div className="avatar-lg bg-light text-dark rounded-circle mx-auto p-4 mb-3 d-inline-flex align-items-center justify-content-center shadow-inner" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-bag-x fs-1"></i>
            </div>
            <h3 className="fw-bold text-dark mb-2">No tienes compras registradas</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>Explora nuestro catálogo para realizar tu primer pedido.</p>
            <Link to="/catalogo/8" className="btn btn-dark px-5 py-3 rounded-pill fw-bold shadow-sm">
              Explorar Catálogo
            </Link>
          </div>
        )}

        {/* Modal Ultra Moderno con Todos los Datos */}
        {pedidoDetalle && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
            <div className="bg-white rounded-4 shadow-lg w-100 p-4" style={{ maxWidth: '750px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
              
              {/* Cabecera Modal */}
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <span className="badge bg-dark text-white px-2 py-1 rounded-pill fw-bold mb-1" style={{ fontSize: '0.75rem' }}>FACTURA DIGITAL</span>
                  <h4 className="fw-bold m-0 text-dark">Pedido #{pedidoDetalle.idventa}</h4>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={() => setPedidoDetalle(null)}></button>
              </div>

              {/* Contenido scrolleable */}
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                
                {/* Panel de Datos Completos del Cliente y Envío */}
                <div className="bg-light p-4 rounded-4 mb-4 border">
                  <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom"><i className="bi bi-person-lines-fill me-2 text-primary"></i> Información del Destinatario y Pago</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">Cliente:</small>
                      <span className="fw-semibold text-dark">{pedidoDetalle.cliente || 'No especificado'}</span>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">Correo Electrónico:</small>
                      <span className="fw-semibold text-dark">{pedidoDetalle.correo || 'No especificado'}</span>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">Teléfono de Contacto:</small>
                      <span className="fw-semibold text-dark">{pedidoDetalle.telefono || 'No especificado'}</span>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">Método de Pago:</small>
                      <span className="badge bg-dark text-white px-3 py-1 rounded-pill fw-bold text-uppercase">
                        {pedidoDetalle.metodo_pago || 'Contraentrega'}
                      </span>
                    </div>
                    <div className="col-12">
                      <small className="text-muted d-block mb-1">Dirección de Entrega:</small>
                      <span className="fw-semibold text-dark"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {pedidoDetalle.direccion}</span>
                    </div>
                    <div className="col-12">
                      <small className="text-muted d-block mb-1">Fecha del Pedido:</small>
                      <span className="fw-semibold text-dark">{pedidoDetalle.fecha_pedido ? new Date(pedidoDetalle.fecha_pedido).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-box-seam me-2 text-primary"></i> Productos Ordenados:</h6>

                {cargandoDetalle ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-dark me-2" role="status"></div>
                    <small className="text-muted">Cargando productos del pedido...</small>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-3">
                    {productosDetalle.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded-4 border bg-white shadow-xs">
                        <div className="d-flex align-items-center gap-3">
                          {item.imagenResuelta ? (
                            <img 
                              src={item.imagenResuelta} 
                              alt={item.nombre_producto} 
                              className="rounded-3 border object-fit-cover shadow-xs" 
                              style={{ width: '65px', height: '65px', minWidth: '65px' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-muted small fw-bold" style={{ width: '65px', height: '65px', minWidth: '65px', fontSize: '11px' }}>
                              Sin Foto
                            </div>
                          )}
                          <div>
                            <span className="fw-bold text-dark d-block mb-1" style={{ fontSize: '1rem' }}>{item.nombre_producto}</span>
                            <span className="badge bg-light text-muted border px-2 py-1 me-2">Cant: {item.cantidad}</span>
                            <small className="text-muted">Unitario: ${Number(item.precio_unitario).toLocaleString()}</small>
                          </div>
                        </div>
                        <span className="fw-extrabold text-success fs-5">${Number(item.subtotal || (item.precio_unitario * item.cantidad)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Pie de Modal con Total y Cierre */}
              <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2 bg-white">
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Total General Pagado</small>
                  <h3 className="fw-extrabold text-primary m-0">${Number(pedidoDetalle.total).toLocaleString()}</h3>
                </div>
                <button className="btn btn-dark rounded-pill px-5 py-3 shadow-sm fw-bold" onClick={() => setPedidoDetalle(null)}>
                  Cerrar Ventana
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MisCompras;