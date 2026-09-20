import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
        telefono: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [avatarActual, setAvatarActual] = useState(null); 

    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        // 🔍 Unificamos la llave para buscar en localStorage de forma segura
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioLogueado') || localStorage.getItem('usuariologueado'));
        if (usuarioGuardado) {
            setFormData({
                nombre: usuarioGuardado.nombre || '',
                apellidos: usuarioGuardado.apellidos || '',
                correo: usuarioGuardado.correo || '',
                telefono: usuarioGuardado.telefono || ''
            });
            // 📸 Leemos 'foto' tal como viene de tu base de datos y backend
            if (usuarioGuardado.foto) {
                setAvatarActual(usuarioGuardado.foto);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const dataToSend = new FormData();
            dataToSend.append('nombre', formData.nombre);
            dataToSend.append('apellidos', formData.apellidos);
            dataToSend.append('correo', formData.correo);
            dataToSend.append('telefono', formData.telefono);

            if (avatarFile) {
                // 📸 CORREGIDO: Cambiado de 'avatar' a 'foto' para que coincida con el backend
                dataToSend.append('foto', avatarFile);
            }

            const response = await api.put('/usuarios/perfil', dataToSend);

            if (response.data.status === 'success') {
                setMensaje({ tipo: 'exito', texto: '¡Información y foto de perfil actualizadas correctamente!' });
                
                // Actualizamos ambas variantes en el localStorage para evitar conflictos con el Navbar
                const usuarioActualizado = response.data.usuario;
                localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioActualizado));
                localStorage.setItem('usuariologueado', JSON.stringify(usuarioActualizado));
                localStorage.setItem('userName', usuarioActualizado.nombre);
                
                if (usuarioActualizado.foto) {
                    setAvatarActual(usuarioActualizado.foto);
                }
                setAvatarFile(null); 

                // 🔄 Recargamos la página automáticamente para que el Navbar pinte la nueva foto al instante
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            setMensaje({
                tipo: 'error',
                texto: error.response?.data?.message || 'Error al actualizar el perfil'
            });
        } finally {
            setCargando(false);
        }
    };

    const obtenerIniciales = () => {
        const n = formData.nombre ? formData.nombre.charAt(0) : 'U';
        const a = formData.apellidos ? formData.apellidos.charAt(0) : '';
        return (n + a).toUpperCase();
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                
                {/* Header de la tarjeta */}
                <div style={styles.header}>
                    <div style={styles.avatarContainer}>
                        <div style={{
                            ...styles.avatar,
                            backgroundImage: (previewUrl || avatarActual) ? `url(${previewUrl || avatarActual})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            {(!previewUrl && !avatarActual) && obtenerIniciales()}
                        </div>
                        <div style={styles.badgeOnline} />
                    </div>
                    <div style={styles.headerInfo}>
                        <div style={styles.tag}>CONFIGURACIÓN DE CUENTA</div>
                        <h1 style={styles.title}>Editar Perfil</h1>
                        <p style={styles.subtitle}>Gestiona tus datos personales y tu foto de perfil</p>
                    </div>
                </div>

                <div style={styles.divider} />

                {/* Mensaje de alerta */}
                {mensaje.texto && (
                    <div style={{
                        ...styles.alert,
                        backgroundColor: mensaje.tipo === 'exito' ? '#F0FDF4' : '#FEF2F2',
                        color: mensaje.tipo === 'exito' ? '#15803D' : '#991B1B',
                        borderColor: mensaje.tipo === 'exito' ? '#BBF7D0' : '#FECACA'
                    }}>
                        {mensaje.tipo === 'exito' ? (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div style={styles.grid}>
                        
                        {/* Campo para seleccionar la nueva foto de perfil */}
                        <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Cambiar Foto de Perfil</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{
                                        ...styles.input,
                                        padding: '10px 14px',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                                Selecciona una imagen en formato PNG, JPG o WEBP.
                            </span>
                        </div>

                        {/* Campo Nombre */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nombres</label>
                            <div style={styles.inputWrapper}>
                                <svg style={styles.inputIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingresa tu nombre"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Campo Apellidos */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Apellidos</label>
                            <div style={styles.inputWrapper}>
                                <svg style={styles.inputIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    placeholder="Ingresa tus apellidos"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Campo Correo */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Correo Electrónico</label>
                            <div style={styles.inputWrapper}>
                                <svg style={styles.inputIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                    placeholder="ejemplo@correo.com"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Campo Teléfono */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Teléfono de Contacto</label>
                            <div style={styles.inputWrapper}>
                                <svg style={styles.inputIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="Número de celular"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Botón Guardar */}
                    <div style={styles.actions}>
                        <button
                            type="submit"
                            disabled={cargando}
                            style={{
                                ...styles.submitBtn,
                                opacity: cargando ? 0.75 : 1,
                                cursor: cargando ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            <span>{cargando ? 'Guardando cambios...' : 'Guardar Cambios'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Objeto de estilos profesionales
const styles = {
    pageContainer: {
        minHeight: '85vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '880px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
        padding: '48px',
        border: '1px solid #E2E8F0'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px'
    },
    avatarContainer: {
        position: 'relative'
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: '800',
        letterSpacing: '1px',
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
    },
    badgeOnline: {
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#22C55E',
        border: '3.5px solid #FFFFFF'
    },
    headerInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    tag: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#2563EB',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        marginBottom: '4px'
    },
    title: {
        margin: 0,
        fontSize: '30px',
        color: '#0F172A',
        fontWeight: '800',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        margin: '6px 0 0 0',
        fontSize: '15px',
        color: '#64748B',
        fontWeight: '400'
    },
    divider: {
        height: '1px',
        backgroundColor: '#F1F5F9',
        margin: '32px 0 36px 0'
    },
    alert: {
        padding: '14px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '28px',
        border: '1px solid',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '28px 24px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#334155',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#94A3B8',
        pointerEvents: 'none',
        transition: 'color 0.2s ease'
    },
    input: {
        width: '100%',
        padding: '14px 16px 14px 48px',
        borderRadius: '12px',
        border: '1.5px solid #CBD5E1',
        fontSize: '15px',
        fontWeight: '500',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    },
    actions: {
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    submitBtn: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        padding: '14px 32px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
        transition: 'all 0.2s ease-in-out'
    }
};

export default EditProfile;