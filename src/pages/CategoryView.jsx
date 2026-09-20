import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryView = ({ categoria, productos }) => {
  const navigate = useNavigate();

  // 1. Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8; // Puedes cambiar a 8, 12, 16, etc.

  // 2. Cálculos para recortar los productos de la página actual
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosVisibles = productos.slice(indicePrimerProducto, indiceUltimoProducto);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  return (
    <div className="container my-5">
      <h1 className="fw-bold mb-4">{categoria}</h1>
      
      {/* 3. Mapeamos únicamente los productos visibles de la página */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {productosVisibles.map((prod) => (
          <div key={prod.id} className="col">
            <div className="card h-100 border-0 shadow-sm position-relative">

              <div className="p-3 d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                <img src={prod.image_url} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} alt={prod.name} />
              </div>
              
              <div className="card-body d-flex flex-column text-center">
                <h6 className="fw-bold mb-2">{prod.name}</h6>
                <p className="text-primary fw-bold">$ {new Intl.NumberFormat('es-CO').format(prod.price)}</p>
                <button className="btn btn-outline-dark w-100" onClick={() => navigate(`/producto/${prod.id}`)}>
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Botones de Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 my-5">
          <button 
            className="btn btn-outline-dark rounded-pill px-4"
            onClick={() => {
              setPaginaActual(prev => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla al cambiar de página
            }}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>
          
          <span className="fw-bold text-muted">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button 
            className="btn btn-outline-dark rounded-pill px-4"
            onClick={() => {
              setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
              window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla al cambiar de página
            }}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryView;