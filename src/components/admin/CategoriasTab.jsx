import React, { useState } from 'react';

const CategoriasTab = ({ categorias, setCategorias, cargando }) => {
  const [esAgregandoCategoria, setEsAgregandoCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ idcategoria: '', nombre: '' });

  const eliminarCategoria = async (idcategoria) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/categorias/${idcategoria}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategorias(categorias.filter(c => (c.idcategoria || c.id) !== idcategoria));
      } else {
        alert("Error al eliminar la categoría.");
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  const agregarCategoria = async (e) => {
    e.preventDefault();
    const existe = categorias.some(c => String(c.idcategoria) === String(nuevaCategoria.idcategoria));
    if (existe) {
      alert("Ya existe una categoría registrada con ese ID.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCategoria)
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias([...categorias, data]);
        setEsAgregandoCategoria(false);
        setNuevaCategoria({ idcategoria: '', nombre: '' });
      } else {
        alert("Error al registrar la categoría.");
      }
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Categorías de Productos</h4>
          <p className="text-muted small mb-0">Cargado directamente desde la tabla `categoria` de tu base de datos.</p>
        </div>
        <button className="btn btn-dark rounded-pill px-3" onClick={() => setEsAgregandoCategoria(true)}>
          <i className="bi bi-plus-lg me-1"></i> Nueva Categoría
        </button>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '25%' }}>ID Categoría</th>
              <th style={{ width: '60%' }}>Nombre</th>
              <th style={{ width: '15%' }} className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="3" className="text-center py-4 text-muted">Cargando categorías...</td></tr>
            ) : categorias.length > 0 ? (
              categorias.map((cat) => (
                <tr key={cat.idcategoria || cat.id}>
                  <td className="fw-bold">#{cat.idcategoria || cat.id}</td>
                  <td className="fw-medium text-dark">{cat.nombre}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => eliminarCategoria(cat.idcategoria || cat.id)}>
                      <i className="bi bi-trash me-1"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center py-4 text-muted">No hay categorías registradas...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: NUEVA CATEGORÍA */}
      {esAgregandoCategoria && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <h4 className="fw-bold mb-3">Registrar Nueva Categoría</h4>
              <form onSubmit={agregarCategoria}>
                <label className="small text-muted fw-bold">ID de Categoría (Número único)</label>
                <input 
                  className="form-control mb-3" 
                  type="number" 
                  required 
                  placeholder="Ej. 5" 
                  onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, idcategoria: e.target.value })} 
                  value={nuevaCategoria.idcategoria} 
                />

                <label className="small text-muted fw-bold">Nombre de la Categoría</label>
                <input 
                  className="form-control mb-4" 
                  required 
                  placeholder="Ej. Lámparas LED" 
                  onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })} 
                  value={nuevaCategoria.nombre} 
                />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-dark rounded-pill">Guardar</button>
                  <button type="button" className="btn btn-light rounded-pill" onClick={() => setEsAgregandoCategoria(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasTab;   