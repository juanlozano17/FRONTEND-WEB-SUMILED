import React, { useState } from 'react';

const PedidosTab = ({ pedidos, setPedidos, cargando }) => {
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidoCambiandoEstado, setPedidoCambiandoEstado] = useState(null);
  const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('Pendiente');

  const obtenerClaseBadgeEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return 'bg-success';
      case 'enviado': return 'bg-info text-dark';
      case 'pendiente': return 'bg-warning text-dark';
      case 'cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const pedidosFiltrados = pedidos.filter(ped => {
    if (filtroEstadoPedido === 'todos') return true;
    return ped.estado?.toLowerCase() === filtroEstadoPedido.toLowerCase();
  });

  const actualizarEstadoPedido = async (e) => {
    e.preventDefault();
    if (!pedidoCambiandoEstado) return;
    const idPed = pedidoCambiandoEstado.idpedido || pedidoCambiandoEstado.id;
    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${idPed}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstadoPedido })
      });
      if (response.ok) {
        setPedidos(pedidos.map(p => {
          const currentId = p.idpedido || p.id;
          if (currentId === idPed) {
            return { ...p, estado: nuevoEstadoPedido };
          }
          return p;
        }));
        setPedidoCambiandoEstado(null);
      } else {
        alert("No se pudo actualizar el estado del pedido.");
      }
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-dark mb-0">Control de Pedidos</h4>
        <select className="form-select form-select-sm rounded-pill shadow-none w-25" value={filtroEstadoPedido} onChange={(e) => setFiltroEstadoPedido(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="enviado">Enviado</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>ID Pedido</th><th>Cliente</th><th>Total</th><th>Fecha</th><th>Estado</th><th className="text-end">Acciones</th></tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Cargando pedidos...</td></tr>
            ) : pedidosFiltrados.length > 0 ? (
              pedidosFiltrados.map((ped) => {
                const idPed = ped.idpedido || ped.id;
                return (
                  <tr key={idPed}>
                    <td className="fw-bold">#{idPed}</td>
                    <td>{ped.cliente}</td>
                    <td className="text-success fw-bold">${parseFloat(ped.total || 0).toLocaleString()}</td>
                    <td>{ped.fecha || 'Reciente'}</td>
                    <td><span className={`badge ${obtenerClaseBadgeEstado(ped.estado)}`}>{ped.estado}</span></td>
                    <td className="text-end">
                      <button className="btn btn-outline-info btn-sm rounded-pill px-2 me-1" onClick={() => setPedidoSeleccionado(ped)}><i className="bi bi-eye"></i> Ver</button>
                      <button className="btn btn-outline-dark btn-sm rounded-pill px-2" onClick={() => { setPedidoCambiandoEstado(ped); setNuevoEstadoPedido(ped.estado || 'Pendiente'); }}><i className="bi bi-arrow-repeat"></i> Estado</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No se encontraron pedidos registrados...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VER DETALLES DE PEDIDO */}
      {pedidoSeleccionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <h5 className="fw-bold mb-0">Detalle Pedido #{pedidoSeleccionado.idpedido || pedidoSeleccionado.id}</h5>
                <button type="button" className="btn-close" onClick={() => setPedidoSeleccionado(null)}></button>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Cliente:</strong> {pedidoSeleccionado.cliente}</p>
                  <p><strong>Teléfono:</strong> {pedidoSeleccionado.telefono || 'No especificado'}</p>
                  <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion || 'Principal'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Fecha:</strong> {pedidoSeleccionado.fecha}</p>
                  <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodo_pago || 'Transferencia'}</p>
                  <p><strong>Estado Actual:</strong> <span className={`badge ${obtenerClaseBadgeEstado(pedidoSeleccionado.estado)}`}>{pedidoSeleccionado.estado}</span></p>
                </div>
              </div>
              <h6 className="fw-bold mb-2">Productos en el Pedido:</h6>
              <ul className="list-group mb-4">
                {pedidoSeleccionado.items?.map((item, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{item.nombre_producto} (Cant: {item.cantidad})</span>
                    <span className="fw-bold text-success">${Number(item.valor).toLocaleString()}</span>
                  </li>
                )) || <p className="text-muted small">Sin items detallados registrados.</p>}
              </ul>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-dark mb-0">Total: ${parseFloat(pedidoSeleccionado.total || 0).toLocaleString()}</h5>
                <button className="btn btn-dark rounded-pill px-4" onClick={() => setPedidoSeleccionado(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR ESTADO DE PEDIDO */}
      {pedidoCambiandoEstado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <h6 className="fw-bold mb-3">Cambiar Estado Pedido</h6>
              <form onSubmit={actualizarEstadoPedido}>
                <select className="form-select rounded-pill mb-3 shadow-none" value={nuevoEstadoPedido} onChange={(e) => setNuevoEstadoPedido(e.target.value)}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-dark rounded-pill">Actualizar Estado</button>
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setPedidoCambiandoEstado(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosTab;