import React, { useEffect, useState } from 'react';
import api from '../api/axios'; // 👈 Usamos tu instancia de Axios configurada con credenciales/cookies

const ListaDeseos = () => {
    const [deseos, setDeseos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Cargar la lista de deseos desde tu backend Node.js
    useEffect(() => {
        const cargarDeseos = async () => {
            try {
                // Hacemos la petición a la API protegida con tu cookie de sesión
                const response = await api.get('/deseos');
                setDeseos(response.data || []);
            } catch (err) {
                console.error("Error al cargar lista de deseos:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Debes iniciar sesión para ver tus favoritos.");
                } else {
                    setError("No se pudieron cargar tus productos favoritos.");
                }
            } finally {
                setCargando(false);
            }
        };

        cargarDeseos();
    }, []);

    // Eliminar un producto de la lista de deseos
    const handleEliminar = async (idDeseo) => {
        try {
            await api.delete(`/deseos/${idDeseo}`);
            setDeseos(deseos.filter(item => item.id_deseo !== idDeseo));
        } catch (err) {
            console.error("Error al eliminar de favoritos:", err);
            alert("No se pudo quitar el producto de favoritos.");
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                
                {/* Header de la sección */}
                <div style={styles.header}>
                    <div style={styles.headerTitleGroup}>
                        <div style={styles.tag}>TU COLECCIÓN</div>
                        <h1 style={styles.title}>Mis Productos Favoritos</h1>
                        <p style={styles.subtitle}>
                            Guarda los artículos que más te gustan para comprarlos cuando quieras
                        </p>
                    </div>
                    {deseos.length > 0 && (
                        <div style={styles.counterBadge}>
                            {deseos.length} {deseos.length === 1 ? 'Producto' : 'Productos'}
                        </div>
                    )}
                </div>

                <div style={styles.divider} />

                {/* Estado de Carga */}
                {cargando && (
                    <div style={styles.statusBox}>
                        <div style={styles.spinner} />
                        <p style={styles.statusText}>Cargando tus productos favoritos...</p>
                    </div>
                )}

                {/* Estado de Error o No Logueado */}
                {!cargando && error && (
                    <div style={styles.errorCard}>
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                {/* Estado Vacío (Sin Favoritos) */}
                {!cargando && !error && deseos.length === 0 && (
                    <div style={styles.emptyCard}>
                        <div style={styles.emptyIconContainer}>
                            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#94A3B8">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 style={styles.emptyTitle}>Aún no tienes productos en tu lista de deseos</h3>
                        <p style={styles.emptySubtitle}>
                            Explora nuestro catálogo y haz clic en el ícono de corazón para guardar tus ítems favoritos.
                        </p>
                    </div>
                )}

                {/* Grid de Tarjetas de Favoritos */}
                {!cargando && !error && deseos.length > 0 && (
                    <div style={styles.grid}>
                        {deseos.map((d) => {
                            const prod = d.producto || d; // Compatibilidad según estructura de backend
                            return (
                                <div key={d.id_deseo || d.id_producto} style={styles.card}>
                                    
                                    {/* Botón para quitar de favoritos */}
                                    <button 
                                        onClick={() => handleEliminar(d.id_deseo)} 
                                        style={styles.deleteBtn}
                                        title="Quitar de favoritos"
                                    >
                                        <svg width="18" height="18" fill="#EF4444" viewBox="0 0 24 24" stroke="#EF4444">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>

                                    {/* Imagen del Producto */}
                                    <div style={styles.imageContainer}>
                                        <img 
                                            src={prod.imagenes || prod.imagen || 'https://via.placeholder.com/300'} 
                                            alt={prod.nombre_producto || 'Producto'} 
                                            style={styles.image}
                                        />
                                    </div>

                                    {/* Contenido de la Tarjeta */}
                                    <div style={styles.cardBody}>
                                        <h3 style={styles.productTitle}>
                                            {prod.nombre_producto || 'Producto sin nombre'}
                                        </h3>
                                        
                                        {prod.precio && (
                                            <div style={styles.price}>
                                                ${Number(prod.precio).toLocaleString('es-CO')}
                                            </div>
                                        )}

                                        <button style={styles.actionBtn}>
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

// Estilos de alto nivel UI/UX
const styles = {
    pageContainer: {
        minHeight: '85vh',
        backgroundColor: '#F8FAFC',
        padding: '50px 20px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    contentWrapper: {
        maxWidth: '1100px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
    },
    headerTitleGroup: {
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
        fontSize: '32px',
        color: '#0F172A',
        fontWeight: '800',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        margin: '6px 0 0 0',
        fontSize: '15px',
        color: '#64748B'
    },
    counterBadge: {
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        padding: '8px 18px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '700',
        border: '1px solid #BFDBFE'
    },
    divider: {
        height: '1px',
        backgroundColor: '#E2E8F0',
        margin: '30px 0 36px 0'
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
        gap: '16px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3.5px solid #E2E8F0',
        borderTop: '3.5px solid #2563EB',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    statusText: {
        color: '#64748B',
        fontSize: '15px',
        fontWeight: '500'
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        color: '#991B1B',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #FECACA',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '15px',
        fontWeight: '600'
    },
    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '60px 20px',
        textAlign: 'center',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04)',
        maxWidth: '560px',
        margin: '40px auto'
    },
    emptyIconContainer: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto'
    },
    emptyTitle: {
        margin: '0 0 8px 0',
        fontSize: '20px',
        color: '#0F172A',
        fontWeight: '700'
    },
    emptySubtitle: {
        margin: 0,
        fontSize: '14px',
        color: '#64748B',
        lineHeight: '1.5'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    deleteBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
        zIndex: 2,
        transition: 'transform 0.2s ease'
    },
    imageContainer: {
        width: '100%',
        height: '200px',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
    },
    image: {
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain'
    },
    cardBody: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: '12px'
    },
    productTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: '1.3'
    },
    price: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#2563EB'
    },
    actionBtn: {
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '10px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'backgroundColor 0.2s ease'
    }
};

export default ListaDeseos;