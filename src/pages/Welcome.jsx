import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // Aquí puedes especificar la ruta a tu pantalla de login
    navigate('/login');
    // O si quieres abrir un modal, puedes usar:
    // setShowLoginModal(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decoración de fondo sutil */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: '#fadbde',
        borderRadius: '50%',
        opacity: '0.1',
        zIndex: '0'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '250px',
        height: '250px',
        background: '#fadbde',
        borderRadius: '50%',
        opacity: '0.1',
        zIndex: '0'
      }}></div>
      
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: '1'
      }}>
        {/* Logo - Aquí va tu imagen */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            width: '180px',
            height: '180px',
            margin: '0 auto',
            borderRadius: '50%',
            backgroundColor: '#fadbde',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(250, 219, 222, 0.3)',
            overflow: 'hidden' // Importante para que la imagen mantenga la forma circular
          }}>
            {/* Reemplaza la URL con la ruta de tu logo */}
            <img 
              src=".../img/logo.jpeg" // Cambia esta ruta por la de tu imagen
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain' // Ajusta la imagen para cubrir el círculo
                // Si tu logo tiene fondo blanco y quieres mantenerlo, usa 'contain' en lugar de 'cover'
                // objectFit: 'contain',
                // backgroundColor: 'white' // Si tu logo necesita fondo blanco
              }}
            />
            
            {/* Letra K en la parte inferior (opcional, puedes quitarla si no la necesitas) */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '4px 16px',
              borderRadius: '9999px',
              border: '2px solid #fadbde',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#4b5563' }}></span>
            </div>
          </div>
        </div>

        {/* Texto principal */}
        <h2 style={{ 
          color: '#9ca3af', 
          fontSize: '14px', 
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          Farmacia
        </h2>
        
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          color: '#1f2937',
          lineHeight: '1.2'
        }}>
          Médica Rincón
        </h1>
        
        {/* Línea decorativa sutil (opcional, puedes eliminarla si no la quieres) */}
        <div style={{ 
          width: '60px', 
          height: '3px', 
          backgroundColor: '#fadbde', 
          margin: '20px auto',
          borderRadius: '2px'
        }}></div>
        
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#fadbde',
          marginBottom: '40px',
          textShadow: '0 2px 4px rgba(250, 219, 222, 0.3)'
        }}>
          BIENVENIDO
        </h3>

        {/* Botón de acción */}
        <button 
          onClick={handleLoginClick}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: '#fadbde',
            border: 'none',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '18px',
            color: '#1f2937',
            cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: '0 4px 15px rgba(250, 219, 222, 0.4)',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f8c9cc';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(250, 219, 222, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#fadbde';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(250, 219, 222, 0.4)';
          }}
        >
          Iniciar Sesión / Registrarse
        </button>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px',
          lineHeight: '1.6',
          maxWidth: '280px',
          margin: '0 auto'
        }}>
          "Tu salud es nuestra prioridad número uno"
        </p>

        {/* Enlaces adicionales (opcional) */}
        <div style={{
          marginTop: '30px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          fontSize: '13px'
        }}>
          <a 
            href="#" 
            style={{ color: '#9ca3af', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/terminos');
            }}
          >
            Términos
          </a>
          <a 
            href="#" 
            style={{ color: '#9ca3af', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/privacidad');
            }}
          >
            Privacidad
          </a>
          <a 
            href="#" 
            style={{ color: '#9ca3af', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/contacto');
            }}
          >
            Contacto
          </a>
        </div>
      </div>
    </div>
  );
};

export default Welcome;