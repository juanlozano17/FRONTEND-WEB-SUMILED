import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../supabaseClient';

const PedidosTab = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Estados para Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [pedidosPorPagina, setPedidosPorPagina] = useState(5);

  const obtenerClaseBadgeEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return 'bg-success';
      case 'enviado': return 'bg-info text-dark';
      case 'entregado': return 'bg-success';
      case 'pendiente': return 'bg-warning text-dark';
      case 'cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const cargarPedidosReales = async () => {
    setCargando(true);
    try {
      const { data: ventasData, error } = await supabase
        .from('venta')
        .select('*')
        .order('idventa', { ascending: false });

      if (error) throw error;

      const ventasProcesadas = (ventasData || []).map((ped) => ({
        ...ped,
        clienteResuelto: {
          nombre: ped.cliente || ped.nombre_cliente || `Cliente ID: ${ped.idusuario || 'General'}`,
          correo: ped.correo || ped.email || 'No especificado',
          telefono: ped.telefono || ped.celular || 'No especificado',
          direccion: ped.direccion || ped.direccion_envio || 'No especificada',
          metodoPago: ped.metodo_pago || ped.metodopago || 'Contraentrega / Pasarela'
        }
      }));

      setPedidos(ventasProcesadas);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidosReales();
  }, []);

  const pedidosFiltrados = pedidos.filter(ped => {
    if (filtroEstadoPedido === 'todos') return true;
    const estado = ped.estado || 'pendiente';
    return estado.toLowerCase() === filtroEstadoPedido.toLowerCase();
  });

  // Lógica de Paginación
  const indiceUltimoPedido = paginaActual * pedidosPorPagina;
  const indicePrimerPedido = indiceUltimoPedido - pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indicePrimerPedido, indiceUltimoPedido);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina) || 1;

  const abrirDetallePedido = async (ped) => {
    setPedidoSeleccionado(ped);
    setCargandoDetalle(true);

    try {
      const { data: detalleData, error } = await supabase
        .from('detalle_venta')
        .select('*')
        .eq('idventa', ped.idventa);

      if (error) throw error;

      const itemsFormateados = (detalleData || []).map(item => ({
        nombre_producto: item.nombre_producto || `Producto ID: ${item.idproducto}`,
        imagen: item.imagen || item.foto || '',
        cantidad: item.cantidad || 1,
        precio_unitario: item.precio_unitario || 0,
        valor: item.subtotal || (item.precio_unitario * item.cantidad) || 0
      }));

      setPedidoSeleccionado(prev => ({
        ...prev,
        itemsResueltos: itemsFormateados
      }));
    } catch (err) {
      console.error("Error al cargar el detalle de los productos:", err);
      setPedidoSeleccionado(prev => ({ ...prev, itemsResueltos: [] }));
    } finally {
      setCargandoDetalle(false);
    }
  };

  const actualizarEstado = async (e, idventa, nuevoEstado) => {
    e.preventDefault();
    try {
      await supabase.from('venta').update({ estado: nuevoEstado }).eq('idventa', idventa);
      setPedidos(pedidos.map(p => p.idventa === idventa ? { ...p, estado: nuevoEstado } : p));
      setPedidoSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-dark mb-0">Control de Pedidos</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={cargarPedidosReales}>
            <i className="bi bi-arrow-clockwise"></i> Actualizar
          </button>
          <select className="form-select form-select-sm rounded-pill shadow-none" value={filtroEstadoPedido} onChange={(e) => { setFiltroEstadoPedido(e.target.value); setPaginaActual(1); }}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Cargando pedidos...</td></tr>
            ) : pedidosPaginados.length > 0 ? (
              pedidosPaginados.map((ped, index) => {
                const idPed = ped.idventa;
                const totalPedido = ped.total || 0;
                const fechaPedido = ped.fecha_pedido ? ped.fecha_pedido.split('T')[0] : 'Reciente';
                const estadoPedido = ped.estado || 'pendiente';

                return (
                  <tr key={index}>
                    <td className="fw-bold">#{idPed}</td>
                    <td>{ped.clienteResuelto.nombre}</td>
                    <td className="text-success fw-bold">${parseFloat(totalPedido).toLocaleString()}</td>
                    <td>{fechaPedido}</td>
                    <td><span className={`badge ${obtenerClaseBadgeEstado(estadoPedido)} text-uppercase`}>{estadoPedido}</span></td>
                    <td className="text-end">
                      <button className="btn btn-outline-info btn-sm rounded-pill px-2 me-1" onClick={() => abrirDetallePedido(ped)}>
                        <i className="bi bi-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No hay pedidos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Mostrar:</small>
          <select className="form-select form-select-sm w-auto rounded-pill" value={pedidosPorPagina} onChange={(e) => { setPedidosPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <small className="text-muted">pedidos por página</small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-outline-secondary btn-sm rounded-pill px-3" 
            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} 
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <small className="fw-semibold text-dark px-2">Página {paginaActual} de {totalPaginas}</small>
          <button 
            className="btn btn-outline-secondary btn-sm rounded-pill px-3" 
            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))} 
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>

      {pedidoSeleccionado && ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div className="bg-white rounded-4 shadow-lg w-100 p-4" style={{ maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Detalle Pedido #{pedidoSeleccionado.idventa}</h5>
              <button type="button" className="btn-close shadow-none" onClick={() => setPedidoSeleccionado(null)}></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
              <div className="row mb-3 bg-light p-3 rounded-4 g-2">
                <div className="col-md-6">
                  <p className="mb-1"><strong>Cliente:</strong> {pedidoSeleccionado.clienteResuelto.nombre}</p>
                  <p className="mb-1"><strong>Correo:</strong> <span className="text-primary">{pedidoSeleccionado.clienteResuelto.correo}</span></p>
                  <p className="mb-1"><strong>Teléfono:</strong> {pedidoSeleccionado.clienteResuelto.telefono}</p>
                  <p className="mb-0"><strong>Dirección:</strong> {pedidoSeleccionado.clienteResuelto.direccion}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1"><strong>Fecha:</strong> {pedidoSeleccionado.fecha_pedido ? pedidoSeleccionado.fecha_pedido.split('T')[0] : 'Reciente'}</p>
                  <p className="mb-1"><strong>Método de Pago:</strong> <span className="text-uppercase fw-bold text-dark">{pedidoSeleccionado.clienteResuelto.metodoPago}</span></p>
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <strong>Estado:</strong>
                    <select 
                      className="form-select form-select-sm w-auto rounded-pill"
                      value={pedidoSeleccionado.estado || 'pendiente'}
                      onChange={(e) => actualizarEstado(e, pedidoSeleccionado.idventa, e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-2 text-dark"><i className="bi bi-box-seam me-1"></i> Productos Ordenados:</h6>
              {cargandoDetalle ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-dark me-2" role="status"></div>
                  <small className="text-muted">Cargando productos del pedido...</small>
                </div>
              ) : (
                <ul className="list-group mb-3 shadow-sm rounded-3">
                  {pedidoSeleccionado.itemsResueltos && pedidoSeleccionado.itemsResueltos.length > 0 ? (
                    pedidoSeleccionado.itemsResueltos.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center gap-3">
                          {item.imagen ? (
                            <img 
                              src={item.imagen} 
                              alt={item.nombre_producto} 
                              className="rounded-3 border object-fit-cover" 
                              style={{ width: '55px', height: '55px', minWidth: '55px' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '55px', height: '55px', minWidth: '55px', fontSize: '10px' }}>
                              Sin Foto
                            </div>
                          )}
                          <div>
                            <span className="fw-semibold text-dark d-block">{item.nombre_producto}</span>
                            <small className="text-muted">Cantidad: {item.cantidad} | Unitario: ${Number(item.precio_unitario).toLocaleString()}</small>
                          </div>
                        </div>
                        <span className="fw-bold text-success fs-6">${Number(item.valor).toLocaleString()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted text-center py-3">
                      No se encontraron productos detallados para este pedido.
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2">
              <h5 className="fw-bold text-dark mb-0">Total: ${parseFloat(pedidoSeleccionado.total || 0).toLocaleString()}</h5>
              <button className="btn btn-dark rounded-pill px-4 shadow-sm" onClick={() => setPedidoSeleccionado(null)}>Cerrar</button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PedidosTab;