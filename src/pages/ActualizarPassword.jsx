import React, { useState } from 'react';
import '../App.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const RestablecerPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Captura el token enviado por url
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 6) {
      setMensaje({ texto: 'La contraseña debe tener al menos 6 caracteres.', tipo: 'danger' });
      return;
    }

    setCargando(true);
    try {
      const response = await api.post('/usuarios/actualizar-password', {
        token,
        nuevaPassword
      });

      setMensaje({ texto: response.data.mensaje || '¡Contraseña actualizada con éxito!', tipo: 'success' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMensaje({ texto: err.response?.data?.mensaje || 'Error al actualizar contraseña.', tipo: 'danger' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
      <div className="bg-white p-5 rounded-4 shadow-lg w-100" style={{ maxWidth: '450px' }}>
        <h3 className="fw-bold text-dark mb-1">Nueva Contraseña</h3>
        <p className="text-muted small mb-4">Ingresa tu nueva clave de acceso.</p>

        {mensaje.texto && (
          <div className={`alert alert-${mensaje.tipo} py-2 px-3 small rounded-3 mb-3 border-0`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleCambiarPassword}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-muted">NUEVA CONTRASEÑA</label>
            <input 
              type="password" 
              className="form-control bg-light py-2 fs-6" 
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-dark w-100 py-3 fw-bold rounded-pill shadow-sm" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestablecerPassword;