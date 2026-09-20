import React, { useState } from 'react';
import api from '../../api/axios';

const UsuariosTab = ({ usuarios = [], setUsuarios, cargando }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 6;

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosPaginaActual = usuarios.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleToggleEstado = async (e, usuario) => {
    e.preventDefault();
    
    // Invertimos el valor actual del estado
    const nuevoEstado = !usuario.estado; 
    
    console.log("----------------------------------------");
    console.log(`Intentando cambiar usuario ID: ${usuario.idusuario}`);
    console.log(`Estado ANTERIOR:`, usuario.estado, typeof usuario.estado);
    console.log(`Nuevo estado a enviar:`, nuevoEstado, typeof nuevoEstado);

    if (window.confirm(`¿Seguro que deseas cambiar el estado de ${usuario.nombre}?`)) {
      try {
        // Hacemos el PUT enviando explícitamente el nuevo estado booleano
        const response = await api.put(`/usuarios/${usuario.idusuario}`, {
          nombre: usuario.nombre,
          correo: usuario.correo,
          id_rol: usuario.id_rol,
          estado: nuevoEstado
        });

        console.log("Respuesta exitosa del servidor:", response.data);

        // Actualizamos el estado local de React inmediatamente
        setUsuarios(usuarios.map(u => 
          u.idusuario === usuario.idusuario ? { ...u, estado: nuevoEstado } : u
        ));

        alert("¡Estado actualizado con éxito!");
      } catch (error) {
        console.error("Error crítico en el PUT:", error.response?.data || error);
        alert("Error al actualizar el estado. Revisa la consola.");
      }
    }
  };

  const handleEditarRol = async (e, usuario) => {
    e.preventDefault();
    const nuevoRol = usuario.id_rol === 1 ? 2 : 1; 

    if (window.confirm(`¿Cambiar el rol de ${usuario.nombre}?`)) {
      try {
        await api.put(`/usuarios/${usuario.idusuario}`, {
          nombre: usuario.nombre,
          correo: usuario.correo,
          id_rol: nuevoRol,
          estado: usuario.estado
        });

        setUsuarios(usuarios.map(u => 
          u.idusuario === usuario.idusuario ? { ...u, id_rol: nuevoRol } : u
        ));
        alert("Rol actualizado con éxito");
      } catch (error) {
        console.error("Error al actualizar rol:", error.response?.data || error);
        alert("No se pudo actualizar el rol.");
      }
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando usuarios del sistema...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0 text-dark">Gestión de Usuarios</h4>
          <p className="text-muted small m-0">Listado de usuarios registrados y sus roles en el sistema</p>
        </div>
        <span className="badge bg-dark rounded-pill px-3 py-2">
          Total: {usuarios.length} usuarios
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th className="py-3 ps-3 rounded-start">ID</th>
              <th className="py-3">Nombre</th>
              <th className="py-3">Correo Electrónico</th>
              <th className="py-3 text-center">Estado</th>
              <th className="py-3 text-center">Rol</th>
              <th className="py-3 text-end pe-3 rounded-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPaginaActual.length > 0 ? (
              usuariosPaginaActual.map((usuario) => {
                // Forzamos una validación robusta para ver si es true de cualquier forma
                const estaActivo = usuario.estado === true || usuario.estado === 1 || usuario.estado === 'true';
                
                return (
                  <tr 
                    key={usuario.idusuario} 
                    style={{ 
                      opacity: estaActivo ? 1 : 0.45, 
                      transition: 'opacity 0.2s ease-in-out' 
                    }}
                  >
                    <td className="ps-3 fw-bold text-secondary">#{usuario.idusuario}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {/* 👈 Solución aplicada aquí: minWidth evita que el texto colapse o se mezcle con iconos */}
                        <div 
                          className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" 
                          style={{ width: '35px', height: '35px', minWidth: '35px' }}
                        >
                          <span style={{ lineHeight: '1' }}>
                            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <span className="fw-semibold text-dark">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td className="text-muted">{usuario.correo}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${estaActivo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {estaActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${usuario.id_rol === 1 ? 'bg-danger' : 'bg-primary'}`}>
                        {usuario.id_rol === 1 ? 'Administrador' : 'Cliente'}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-2 me-1" 
                        title="Cambiar Rol"
                        onClick={(e) => handleEditarRol(e, usuario)}
                      >
                        <i className="bi bi-shield-shaded"></i>
                      </button>

                      <button 
                        type="button"
                        className={`btn btn-sm rounded-pill px-2 ${estaActivo ? 'btn-outline-danger' : 'btn-outline-success'}`} 
                        title={estaActivo ? "Desactivar Usuario" : "Activar Usuario"}
                        onClick={(e) => handleToggleEstado(e, usuario)}
                      >
                        <i className={`bi ${estaActivo ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="bi bi-folder2-open fs-2 d-block mb-2"></i>
                  No hay usuarios registrados en este momento.
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
            onClick={() => cambiarPagina(paginaActual - 1)}
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
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default UsuariosTab;