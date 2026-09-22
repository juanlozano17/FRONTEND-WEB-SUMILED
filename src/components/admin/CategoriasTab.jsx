import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const CategoriasTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [exitoMensaje, setExitoMensaje] = useState('');

  // Estados para el modal de Edición
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [editando, setEditando] = useState(false);

  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*');

      if (error) throw error;

      const categoriasOrdenadas = (data || []).sort((a, b) => {
        const idA = Number(a.idcategoria || a.id || 0);
        const idB = Number(b.idcategoria || b.id || 0);
        return idA - idB;
      });

      setCategorias(categoriasOrdenadas);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Crear Categoría
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nombreCategoria.trim()) {
      setErrorMensaje('El nombre de la categoría no puede estar vacío.');
      return;
    }

    setGuardando(true);
    setErrorMensaje('');
    setExitoMensaje('');

    try {
      const idsExistentes = categorias.map(c => Number(c.idcategoria || c.id || 0));
      const siguienteId = idsExistentes.length > 0 ? Math.max(...idsExistentes) + 1 : 1;

      const objetoInsert = { 
        idcategoria: siguienteId, 
        nombre: nombreCategoria.trim() 
      };

      const { error } = await supabase
        .from('categorias')
        .insert([objetoInsert]);

      if (error) throw error;

      setNombreCategoria('');
      setExitoMensaje('¡Categoría creada con éxito!');
      cargarCategorias();

      setTimeout(() => setExitoMensaje(''), 4000);
    } catch (err) {
      console.error("Error al registrar la categoría:", err);
      setErrorMensaje('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal de Edición
  const abrirEdicion = (cat) => {
    setCategoriaActual(cat);
    setNombreEditado(cat.nombre || '');
    setModalEditarAbierto(true);
  };

  // Guardar Cambios de Edición
  const handleEditarCategoria = async (e) => {
    e.preventDefault();
    if (!nombreEditado.trim()) return;

    setEditando(true);
    try {
      const idCat = categoriaActual.idcategoria || categoriaActual.id;
      
      const { error } = await supabase
        .from('categorias')
        .update({ nombre: nombreEditado.trim() })
        .eq('idcategoria', idCat); // Ajusta a 'id' si tu columna se llama así en Supabase

      if (error) throw error;

      setModalEditarAbierto(false);
      setExitoMensaje('¡Categoría actualizada correctamente!');
      cargarCategorias();

      setTimeout(() => setExitoMensaje(''), 4000);
    } catch (err) {
      console.error("Error al actualizar la categoría:", err);
      alert('Error al actualizar: ' + (err.message || 'Error desconocido'));
    } finally {
      setEditando(false);
    }
  };

  // Eliminar Categoría
  const handleEliminarCategoria = async (cat) => {
    const idCat = cat.idcategoria || cat.id;
    const nombreCat = cat.nombre;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombreCat}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('idcategoria', idCat); // Ajusta a 'id' si tu columna se llama así en Supabase

      if (error) throw error;

      setExitoMensaje(`Categoría "${nombreCat}" eliminada con éxito.`);
      cargarCategorias();

      setTimeout(() => setExitoMensaje(''), 4000);
    } catch (err) {
      console.error("Error al eliminar la categoría:", err);
      alert('No se pudo eliminar la categoría. Es posible que esté asociada a productos existentes.');
    }
  };

  return (
    <div className="row g-4">
      
      {/* Columna Izquierda: Formulario para Nueva Categoría */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '20px' }}>
          
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="bg-dark bg-opacity-10 text-dark rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
              <i className="bi bi-folder-plus fs-4"></i>
            </div>
            <div>
              <h5 className="fw-extrabold text-dark m-0">Nueva Categoría</h5>
              <p className="text-muted small m-0">Añade registros a Supabase.</p>
            </div>
          </div>

          {errorMensaje && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-exclamation-circle-fill me-1"></i> {errorMensaje}
            </div>
          )}

          {exitoMensaje && (
            <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 border-0 bg-success bg-opacity-10 text-success">
              <i className="bi bi-check-circle-fill me-1"></i> {exitoMensaje}
            </div>
          )}

          <form onSubmit={handleCrearCategoria}>
            <div className="mb-3">
              <label className="form-label text-dark small fw-bold">Nombre de la Categoría</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-light border-0 fs-6 shadow-none py-3 rounded-3" 
                placeholder="Ej. Herramientas" 
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sincronizando...
                </>
              ) : (
                'Guardar Categoría'
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Columna Derecha: Listado Completo con Acciones de Editar y Borrar */}
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-3">
            <div>
              <h4 className="fw-extrabold text-dark mb-1">Listado de Categorías</h4>
              <p className="text-muted small m-0">Administra, edita o elimina elementos en tiempo real.</p>
            </div>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm bg-white fw-semibold" onClick={cargarCategorias}>
              <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light text-uppercase fs-8 text-muted">
                <tr>
                  <th className="py-3 rounded-start ps-3" style={{ width: '100px' }}>ID</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3 text-end rounded-end pe-3" style={{ width: '180px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-dark me-2" role="status"></div>
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categorias.length > 0 ? (
                  categorias.map((cat) => {
                    const idCat = cat.idcategoria || cat.id;
                    const nombreCat = cat.nombre || 'Sin nombre';

                    return (
                      <tr key={idCat}>
                        <td className="ps-3 fw-bold text-muted">
                          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">#{idCat}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px', minWidth: '35px' }}>
                              {nombreCat.charAt(0).toUpperCase()}
                            </div>
                            <span className="fw-semibold text-dark fs-6">{nombreCat}</span>
                          </div>
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                              onClick={() => abrirEdicion(cat)}
                              title="Editar categoría"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                              onClick={() => handleEliminarCategoria(cat)}
                              title="Eliminar categoría"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      No hay categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal de Edición (Fondo sólido sin blur para cero bugs o parpadeos) */}
      {modalEditarAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="bg-white rounded-4 shadow-lg w-100 p-4 position-relative border" style={{ maxWidth: '420px' }}>
            
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-4 shadow-none" 
              onClick={() => setModalEditarAbierto(false)}
            ></button>

            <div className="mb-4 text-start">
              <h4 className="fw-extrabold text-dark m-0 mb-1">Editar Categoría</h4>
              <p className="text-muted small m-0">Modifica el nombre registrado en Supabase.</p>
            </div>

            <form onSubmit={handleEditarCategoria}>
              <div className="mb-3">
                <label className="form-label text-dark small fw-bold">Nuevo Nombre</label>
                <input 
                  type="text" 
                  className="form-control form-control-lg bg-light border-0 fs-6 shadow-none py-3 rounded-3" 
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="d-flex flex-column gap-2 mt-4">
                <button 
                  type="submit" 
                  className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
                  disabled={editando}
                >
                  {editando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Actualizando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-link text-muted text-decoration-none small py-2 fw-semibold"
                  onClick={() => setModalEditarAbierto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriasTab;