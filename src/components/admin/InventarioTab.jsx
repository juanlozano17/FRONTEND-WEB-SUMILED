import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const InventarioTab = ({ productos, setProductos, cargando }) => {
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [esAgregando, setEsAgregando] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({ 
    nombre_producto: '', precio: '', stock: '', idcategoria: '', descripcion: '', caracteristicas: '', imagenes: '' 
  });

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const res = await api.get('/categorias');
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    obtenerCategorias();
  }, []);

  const productosPorPagina = 12;
  const productosFiltrados = productos.filter(p => 
    p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosVisibles = productosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const eliminarProducto = async (idproducto) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${idproducto}`, { 
        method: 'DELETE',
        credentials: 'include' 
      });
      if (res.ok) setProductos(productos.filter(p => p.idproducto !== idproducto));
    } catch (err) { console.error(err); }
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre_producto || !nuevoProducto.precio || !nuevoProducto.stock || nuevoProducto.idcategoria === '') {
      alert("Por favor completa los campos obligatorios principales.");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(nuevoProducto)
      });
      
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setProductos([...productos, Array.isArray(data) ? data[0] : data]);
        setEsAgregando(false);
        setNuevoProducto({ nombre_producto: '', precio: '', stock: '', idcategoria: '', descripcion: '', caracteristicas: '', imagenes: '' });
      } else {
        alert("Error al guardar: " + (data.mensaje || data.error || "Error desconocido"));
      }
    } catch (err) { 
      console.error("Error de red:", err); 
    }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${productoEditando.idproducto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productoEditando)
      });
      if (res.ok) {
        setProductos(productos.map(p => p.idproducto === productoEditando.idproducto ? productoEditando : p));
        setProductoEditando(null);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-lg rounded-4 p-4 bg-white">
        
        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3 border-bottom">
          <div>
            <h4 className="fw-bold text-dark mb-1">📦 Gestión de Inventario</h4>
            <p className="text-muted small mb-0">Administra los productos, precios y stock en tiempo real.</p>
          </div>
          <div className="d-flex gap-3 w-50">
            <div className="input-group bg-light rounded-pill overflow-hidden border shadow-sm">
              <span className="input-group-text bg-transparent border-0 ps-3 text-muted"><i className="bi bi-search"></i></span>
              <input 
                className="form-control shadow-none border-0 bg-transparent py-2" 
                placeholder="Buscar por nombre de producto..." 
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} 
                value={busqueda} 
              />
            </div>
            <button className="btn btn-dark rounded-pill px-4 text-nowrap shadow-sm d-flex align-items-center gap-2 fw-semibold" onClick={() => setEsAgregando(true)}>
              <i className="bi bi-plus-circle fs-5"></i> Nuevo Producto
            </button>
          </div>
        </div>
        
        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase fs-7 text-secondary">
              <tr>
                <th className="py-3 rounded-start-3 ps-3">ID</th>
                <th className="py-3">Producto</th>
                <th className="py-3">Precio</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Categoría</th>
                <th className="py-3 text-end rounded-end-3 pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Cargando inventario...</td></tr>
              ) : productosVisibles.length > 0 ? (
                productosVisibles.map(p => {
                  const catEncontrada = categorias.find(c => c.idcategoria === Number(p.idcategoria));
                  return (
                    <tr key={p.idproducto} className="border-bottom">
                      <td className="ps-3 fw-semibold text-muted">#{p.idproducto}</td>
                      <td className="fw-bold text-dark">{p.nombre_producto}</td>
                      <td className="text-success fw-bold">${parseFloat(p.precio || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill ${Number(p.stock) <= 5 ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'}`}>
                          {p.stock} unidades
                        </span>
                      </td>
                      <td><span className="badge bg-light text-dark border px-3 py-2 rounded-pill">{catEncontrada ? catEncontrada.nombre : 'Sin Categoría'}</span></td>
                      <td className="text-end pe-3">
                        <button className="btn btn-light btn-sm rounded-pill me-2 px-3 text-primary shadow-sm" onClick={() => setProductoEditando(p)}>
                          <i className="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button className="btn btn-light btn-sm rounded-pill px-3 text-danger shadow-sm" onClick={() => eliminarProducto(p.idproducto)}>
                          <i className="bi bi-trash3 me-1"></i> Borrar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron productos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 shadow-sm" onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
            Anterior
          </button>
          <span className="text-muted small fw-bold">Página {paginaActual} de {totalPaginas || 1}</span>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 shadow-sm" onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas || totalPaginas === 0}>
            Siguiente
          </button>
        </div>

      </div>

      {/* MODAL NUEVO PRODUCTO */}
      {esAgregando && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4 bg-white my-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark m-0">✨ Registrar Nuevo Producto</h4>
                <button type="button" className="btn-close shadow-none" onClick={() => setEsAgregando(false)}></button>
              </div>
              <form onSubmit={agregarProducto}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">NOMBRE DEL PRODUCTO</label>
                  <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" required placeholder="Ej. Chazos expansivos metálicos" onChange={(e) => setNuevoProducto({...nuevoProducto, nombre_producto: e.target.value})} value={nuevoProducto.nombre_producto} />
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">PRECIO ($)</label>
                    <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" type="number" required placeholder="0.00" onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} value={nuevoProducto.precio} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">STOCK</label>
                    <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" type="number" required placeholder="0" onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})} value={nuevoProducto.stock} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">CATEGORÍA</label>
                    <select 
                      className="form-select rounded-pill bg-light border-0 px-3 py-2 shadow-sm" 
                      required 
                      onChange={(e) => {
                        const catSeleccionada = categorias.find(cat => cat.nombre === e.target.value);
                        setNuevoProducto({
                          ...nuevoProducto, 
                          idcategoria: catSeleccionada ? Number(catSeleccionada.idcategoria) : ''
                        });
                      }} 
                      value={categorias.find(cat => cat.idcategoria === Number(nuevoProducto.idcategoria))?.nombre || ''}
                    >
                      <option value="">Seleccione...</option>
                      {categorias.map(cat => (
                        <option key={cat.idcategoria} value={cat.nombre}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">DESCRIPCIÓN</label>
                  <textarea className="form-control rounded-4 bg-light border-0 p-3 shadow-sm" rows="2" placeholder="Detalles del producto..." onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} value={nuevoProducto.descripcion} />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">CARACTERÍSTICAS</label>
                  <textarea className="form-control rounded-4 bg-light border-0 p-3 shadow-sm" rows="2" placeholder="Material, medidas, uso..." onChange={(e) => setNuevoProducto({...nuevoProducto, caracteristicas: e.target.value})} value={nuevoProducto.caracteristicas} />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary">IMAGEN URL</label>
                  <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" placeholder="https://..." onChange={(e) => setNuevoProducto({...nuevoProducto, imagenes: e.target.value})} value={nuevoProducto.imagenes} />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-secondary" onClick={() => setEsAgregando(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 py-2 fw-semibold shadow">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {productoEditando && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4 bg-white my-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark m-0">✏️ Editar Producto</h4>
                <button type="button" className="btn-close shadow-none" onClick={() => setProductoEditando(null)}></button>
              </div>
              <form onSubmit={guardarEdicion}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">NOMBRE DEL PRODUCTO</label>
                  <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" required value={productoEditando.nombre_producto || ''} onChange={(e) => setProductoEditando({...productoEditando, nombre_producto: e.target.value})} />
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">PRECIO ($)</label>
                    <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" type="number" required value={productoEditando.precio || ''} onChange={(e) => setProductoEditando({...productoEditando, precio: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">STOCK</label>
                    <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" type="number" required value={productoEditando.stock || ''} onChange={(e) => setProductoEditando({...productoEditando, stock: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-secondary">CATEGORÍA</label>
                    <select 
                      className="form-select rounded-pill bg-light border-0 px-3 py-2 shadow-sm" 
                      required 
                      value={categorias.find(cat => cat.idcategoria === Number(productoEditando.idcategoria))?.nombre || ''} 
                      onChange={(e) => {
                        const catSeleccionada = categorias.find(cat => cat.nombre === e.target.value);
                        setProductoEditando({
                          ...productoEditando, 
                          idcategoria: catSeleccionada ? Number(catSeleccionada.idcategoria) : ''
                        });
                      }}
                    >
                      <option value="">Seleccione...</option>
                      {categorias.map(cat => (
                        <option key={cat.idcategoria} value={cat.nombre}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">DESCRIPCIÓN</label>
                  <textarea className="form-control rounded-4 bg-light border-0 p-3 shadow-sm" rows="2" value={productoEditando.descripcion || ''} onChange={(e) => setProductoEditando({...productoEditando, descripcion: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">CARACTERÍSTICAS</label>
                  <textarea className="form-control rounded-4 bg-light border-0 p-3 shadow-sm" rows="2" value={productoEditando.caracteristicas || ''} onChange={(e) => setProductoEditando({...productoEditando, caracteristicas: e.target.value})} />
                </div>

                {/* Campo de imagen agregado aquí también */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary">IMAGEN URL</label>
                  <input className="form-control rounded-pill bg-light border-0 px-3 py-2 shadow-sm" placeholder="https://..." value={productoEditando.imagenes || ''} onChange={(e) => setProductoEditando({...productoEditando, imagenes: e.target.value})} />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-secondary" onClick={() => setProductoEditando(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 py-2 fw-semibold shadow">Actualizar Producto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioTab;