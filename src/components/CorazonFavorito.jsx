import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // 👈 Importamos tu instancia de Axios con cookies

const CorazonFavorito = ({ idProducto, onLoginRequerido }) => {
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargando, setCargando] = useState(false);

  // 1. Verificar si el producto ya está en la lista de deseos al cargar
  useEffect(() => {
    const verificar = async () => {
      const usuarioLogueado = localStorage.getItem('usuarioLogueado');
      if (!usuarioLogueado) return;

      try {
        // Consultamos los deseos del usuario a tu backend
        const response = await api.get('/deseos');
        const listaDeseos = response.data || [];
        
        // Revisamos si el idProducto está en la lista
        const existe = listaDeseos.some(d => (d.id_producto || d.producto?.id_producto) === idProducto);
        if (existe) setEsFavorito(true);
      } catch (error) {
        console.error("Error al verificar favorito:", error);
      }
    };

    verificar();
  }, [idProducto]);

  // 2. Agregar o Quitar de favoritos
  const manejarClick = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que al hacer clic se abra la página de detalles

    // Verificar si hay usuario logueado en localStorage
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    if (!usuarioLogueado) {
      if (onLoginRequerido) {
        onLoginRequerido();
      } else {
        alert("Por favor, inicia sesión para guardar tus deseos.");
      }
      return;
    }

    if (cargando) return;
    setCargando(true);

    try {
      if (!esFavorito) {
        // Petición a tu API Node.js para guardar
        await api.post('/deseos', { id_producto: idProducto });
        setEsFavorito(true);
      } else {
        // Opcional: Si vuelve a dar clic, lo quitamos
        // Si tu backend maneja el id_deseo, puedes implementarlo aquí
        setEsFavorito(true); 
      }
    } catch (error) {
      console.error("Error al procesar favorito:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      } else {
        alert("No se pudo agregar el producto a tus favoritos.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <button 
      onClick={manejarClick} 
      className="btn position-absolute top-0 end-0 m-2 border-0 d-flex align-items-center justify-content-center"
      style={{ 
        zIndex: 10, 
        fontSize: '1.4rem', 
        color: esFavorito ? '#ef4444' : '#64748b', 
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: '50%',
        width: '38px',
        height: '38px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'all 0.2s ease'
      }}
      title={esFavorito ? "En tus favoritos" : "Guardar en favoritos"}
    >
      <i className={`bi bi-heart${esFavorito ? '-fill' : ''}`}></i>
    </button>
  );
};

export default CorazonFavorito;