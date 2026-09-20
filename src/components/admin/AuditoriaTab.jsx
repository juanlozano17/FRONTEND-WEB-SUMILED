import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const AuditoriaTab = () => {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const logsPorPagina = 8;

  useEffect(() => {
    const cargarLogs = async () => {
      try {
        const response = await api.get('/auditoria');
        setLogs(response.data);
      } catch (error) {
        console.error("Error cargando auditoría:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarLogs();
  }, []);

  // Lógica de paginación
  const indiceUltimo = paginaActual * logsPorPagina;
  const indicePrimero = indiceUltimo - logsPorPagina;
  const logsPaginaActual = logs.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(logs.length / logsPorPagina);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando registros de auditoría...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">Auditoría y Logs del Sistema</h4>
          <p className="text-muted small m-0">Registro histórico de acciones críticas realizadas en la plataforma</p>
        </div>
        <span className="badge bg-dark rounded-pill px-3 py-2">
          Total: {logs.length} eventos
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th className="py-3 ps-3 rounded-start">ID</th>
              <th className="py-3">Acción Realizada</th>
              <th className="py-3">Admin / Correo</th>
              <th className="py-3">IP</th>
              <th className="py-3 text-end pe-3 rounded-end">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logsPaginaActual.length > 0 ? (
              logsPaginaActual.map((log) => (
                <tr key={log.id_auditoria}>
                  <td className="ps-3 fw-bold text-secondary">#{log.id_auditoria}</td>
                  <td className="fw-semibold text-dark">{log.accion}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {log.admin_correo || 'Sistema / Desconocido'}
                    </span>
                  </td>
                  <td className="text-muted small">{log.ip}</td>
                  <td className="text-end pe-3 text-muted small">
                    {new Date(log.fecha_hora).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  <i className="bi bi-shield-check fs-2 d-block mb-2"></i>
                  No hay registros de auditoría recientes...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <button 
            type="button"
            className="btn btn-outline-dark btn-sm rounded-pill px-4"
            onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          
          <span className="text-muted fw-semibold small">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button 
            type="button"
            className="btn btn-outline-dark btn-sm rounded-pill px-4"
            onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditoriaTab;