import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // Instancia configurada con withCredentials: true y baseURL correcta
import InventarioTab from './InventarioTab';
import CategoriasTab from './CategoriasTab';
import PedidosTab from './PedidosTab';
import UsuariosTab from './UsuariosTab';
import AuditoriaTab from './AuditoriaTab';

const AdminDashboard = () => {
  const [pestanaActiva, setPestanaActiva] = useState('productos');
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [logsActividad, setLogsActividad] = useState([]);
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorConexion, setErrorConexion] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargandoDatos(true);
    setErrorConexion(null);
    try {
      // Al usar la instancia 'api' de Axios, esta viajará automáticamente con la cookie 'token_sesion' gracias a withCredentials: true
      const [resProd, resCat, resPed, resUsu] = await Promise.all([
        api.get('/productos'),
        api.get('/categorias'),
        api.get('/ventas'),
        api.get('/usuarios')
      ]);

      setProductos(resProd.data || []);
      setCategorias(resCat.data || []);
      setPedidos(resPed.data || []);
      setUsuarios(resUsu.data || []);
      setLogsActividad([]); 

    } catch (error) {
      console.error("Detalle del error:", error.response?.data || error.message);
      setErrorConexion("Acceso denegado (403): Asegúrate de haber iniciado sesión como Administrador.");
    } finally {
      setCargandoDatos(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {errorConexion && (
        <div className="alert alert-danger rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{errorConexion}</span>
          <button className="btn btn-sm btn-outline-danger bg-white" onClick={cargarDatosIniciales}>Reintentar</button>
        </div>
      )}

      {/* Pestañas de Navegación */}
      <ul className="nav nav-pills gap-2 mb-4 overflow-x-auto pb-2">
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-semibold ${pestanaActiva === 'productos' ? 'active bg-dark text-white' : 'bg-white text-dark shadow-sm'}`} onClick={() => setPestanaActiva('productos')}>
            <i className="bi bi-box-seam me-2"></i> Inventario
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-semibold ${pestanaActiva === 'categorias' ? 'active bg-dark text-white' : 'bg-white text-dark shadow-sm'}`} onClick={() => setPestanaActiva('categorias')}>
            <i className="bi bi-tags me-2"></i> Categorías
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-semibold ${pestanaActiva === 'pedidos' ? 'active bg-dark text-white' : 'bg-white text-dark shadow-sm'}`} onClick={() => setPestanaActiva('pedidos')}>
            <i className="bi bi-receipt me-2"></i> Control de Pedidos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-semibold ${pestanaActiva === 'usuarios' ? 'active bg-dark text-white' : 'bg-white text-dark shadow-sm'}`} onClick={() => setPestanaActiva('usuarios')}>
            <i className="bi bi-people me-2"></i> Usuarios
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-semibold ${pestanaActiva === 'auditoria' ? 'active bg-dark text-white' : 'bg-white text-dark shadow-sm'}`} onClick={() => setPestanaActiva('auditoria')}>
            <i className="bi bi-shield-lock me-2"></i> Auditoría y Logs
          </button>
        </li>
      </ul>

      {/* Renderizado Condicional */}
      {pestanaActiva === 'productos' && (
        <InventarioTab productos={productos} setProductos={setProductos} cargando={cargandoDatos} />
      )}
      {pestanaActiva === 'categorias' && (
        <CategoriasTab categorias={categorias} setCategorias={setCategorias} cargando={cargandoDatos} />
      )}
      {pestanaActiva === 'pedidos' && (
        <PedidosTab pedidos={pedidos} setPedidos={setPedidos} cargando={cargandoDatos} />
      )}
      {pestanaActiva === 'usuarios' && (
        <UsuariosTab usuarios={usuarios} setUsuarios={setUsuarios} cargando={cargandoDatos} />
      )}
      {pestanaActiva === 'auditoria' && (
        <AuditoriaTab logs={logsActividad} cargando={cargandoDatos} />
      )}
    </div>
  );
};

export default AdminDashboard;