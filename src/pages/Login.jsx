import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import RegistroForm from './Register';

const Login = ({ setUserLogin, userLogin, handleRegistro, setNuevoUsuario, nuevoUsuario }) => {
  const navigate = useNavigate();

  // Estados para la recuperación propia
  const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState({ texto: '', tipo: '' });

  const handleLogin = async (e) => {
    e.preventDefault(); 
    console.log("Intentando iniciar sesión...");
    
    try {
      const response = await api.post('/usuarios/login', {
        correo: userLogin.email,
        contrasena: userLogin.password
      });

      if (response.data.status === 'success') {
        const usuario = response.data.usuario;
        
        localStorage.setItem('userRole', usuario.id_rol);
        localStorage.setItem('userName', usuario.nombre);
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        if (usuario.id_rol === 1) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
        window.location.reload();
      }
      
    } catch (err) {
      console.error("Error al loguear:", err);
      alert(err.response?.data?.mensaje || "Credenciales incorrectas o error al intentar iniciar sesión");
    }
  };

  // Petición a tu propio Backend para recuperar contraseña
  const handleEnviarRecuperacion = async (e) => {
    e.preventDefault();
    if (!emailRecuperacion.trim()) return;

    setEnviandoRecuperacion(true);
    setMensajeRecuperacion({ texto: '', tipo: '' });

    try {
      const response = await api.post('/usuarios/recuperar-password', {
        correo: emailRecuperacion.trim()
      });

      setMensajeRecuperacion({ 
        texto: response.data.mensaje || 'Instrucciones enviadas. Revisa tu correo.', 
        tipo: 'success' 
      });
      setEmailRecuperacion('');
    } catch (err) {
      console.error("Error de recuperación:", err);
      setMensajeRecuperacion({ 
        texto: err.response?.data?.mensaje || 'Error al procesar la solicitud.', 
        tipo: 'danger' 
      });
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
      <div className="d-flex flex-row overflow-hidden shadow-lg" style={{ maxWidth: '1000px', width: '95%', borderRadius: '40px', backgroundColor: '#fff' }}>
        
        <div className="form-section p-5 d-flex flex-column justify-content-center" style={{ flex: '1' }}>
          <div className="text-center mb-4">
            <img src="/logosumiled.png" alt="Logo" className="logo-img" />
            <h2 className="login-title mt-3">SUMILED S.A.S</h2>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="auth-label ms-3 small fw-bold text-muted">CORREO ELECTRÓNICO</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
                <input 
                  type="email" 
                  className="auth-input form-control bg-light border-start-0 py-2 fs-6" 
                  required 
                  placeholder="correo@ejemplo.com"
                  value={userLogin.email || ''} 
                  onChange={(e) => setUserLogin({...userLogin, email: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="mb-2">
              <label className="auth-label ms-3 small fw-bold text-muted">CONTRASEÑA</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-lock"></i></span>
                <input 
                  type="password" 
                  className="auth-input form-control bg-light border-start-0 py-2 fs-6" 
                  required 
                  placeholder="••••••••"
                  value={userLogin.password || ''} 
                  onChange={(e) => setUserLogin({...userLogin, password: e.target.value})} 
                />
              </div>
            </div>

            <div className="text-end mb-4">
              <button 
                type="button" 
                className="btn btn-link text-muted p-0 text-decoration-none small fw-semibold"
                onClick={() => { 
                  setMostrarModalRecuperar(true); 
                  setMensajeRecuperacion({ texto: '', tipo: '' }); 
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="btn btn-dark w-100 py-3 fw-bold rounded-pill shadow-sm">Ingresar</button>
          </form>

          <div className="auth-footer text-center mt-4">
            <button type="button" className="btn btn-link register-link text-decoration-none fw-semibold text-muted" data-bs-toggle="modal" data-bs-target="#modalRegistro">
              ¿No tienes cuenta? <span className="text-primary">Regístrate</span>
            </button>
          </div>
        </div>

        <div className="store-image-section d-none d-md-block" style={{ flex: '1', backgroundImage: 'url("/tienda-pyp.png")', backgroundSize: 'cover' }} />
      </div>

      <div className="modal fade" id="modalRegistro" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content p-0 rounded-4 border-0 shadow-lg overflow-hidden bg-transparent">
            <RegistroForm 
              nuevoUsuario={nuevoUsuario} 
              setNuevoUsuario={setNuevoUsuario} 
              handleRegistro={handleRegistro} 
            />
          </div>
        </div>
      </div>

      {mostrarModalRecuperar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="bg-white rounded-4 shadow-lg w-100 p-4 position-relative border" style={{ maxWidth: '420px' }}>
            
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-4 shadow-none" 
              onClick={() => setMostrarModalRecuperar(false)}
            ></button>

            <div className="mb-4 text-start">
              <h4 className="fw-extrabold text-dark m-0 mb-1">Recuperar Contraseña</h4>
              <p className="text-muted small m-0">Ingresa tu correo para recibir instrucciones.</p>
            </div>

            {mensajeRecuperacion.texto && (
              <div className={`alert alert-${mensajeRecuperacion.tipo} py-2 px-3 small rounded-3 mb-3 border-0`}>
                {mensajeRecuperacion.texto}
              </div>
            )}

            <form onSubmit={handleEnviarRecuperacion}>
              <div className="mb-3">
                <label className="form-label text-dark small fw-bold">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg bg-light border-0 fs-6 shadow-none py-3 rounded-3" 
                  placeholder="correo@ejemplo.com"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="d-flex flex-column gap-2 mt-4">
                <button 
                  type="submit" 
                  className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm"
                  disabled={enviandoRecuperacion}
                >
                  {enviandoRecuperacion ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Procesando...
                    </>
                  ) : (
                    'Solicitar Recuperación'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-link text-muted text-decoration-none small py-2 fw-semibold"
                  onClick={() => setMostrarModalRecuperar(false)}
                >
                  Volver al Login
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;