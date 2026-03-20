import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login intent:', formData);
    // Aquí iría tu lógica de autenticación
  };

  // Estilos en línea
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #fdf2f8 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      zIndex: 10
    },
    watermark: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      opacity: 0.1,
      color: '#fbcfe8',
      pointerEvents: 'none',
      fontSize: '150px',
      transform: 'rotate(10deg)',
      display: 'none'
    },
    watermarkBottom: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      opacity: 0.1,
      color: '#fbcfe8',
      pointerEvents: 'none',
      fontSize: '150px',
      transform: 'rotate(-10deg)',
      display: 'none'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '40px 30px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 10px 30px rgba(236, 72, 153, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      zIndex: 20
    },
    logoContainer: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    logo: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      boxShadow: '0 10px 25px rgba(249, 168, 212, 0.3)',
      transform: 'rotate(0deg)',
      transition: 'transform 0.3s ease'
    },
    logoIcon: {
      color: '#ffffff',
      fontSize: '40px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#1f2937',
      margin: '0 0 5px 0',
      letterSpacing: '-0.5px'
    },
    brandSubtitle: {
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '3px',
      color: '#9ca3af',
      textTransform: 'uppercase',
      margin: '0'
    },
    welcomeContainer: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    welcomeTitle: {
      fontSize: '26px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 5px 0'
    },
    welcomeSubtitle: {
      color: '#6b7280',
      fontSize: '15px',
      margin: '0'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '1px',
      color: '#6b7280',
      marginBottom: '6px',
      marginLeft: '5px',
      textTransform: 'uppercase'
    },
    inputContainer: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      fontSize: '20px'
    },
    input: {
      width: '100%',
      height: '52px',
      padding: '0 45px 0 45px',
      border: '2px solid #f3f4f6',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f9fafb',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease'
    },
    inputFocus: {
      borderColor: '#f9a8d4',
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px #fce7f3'
    },
    passwordToggle: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '5px'
    },
    forgotPassword: {
      textAlign: 'right',
      marginBottom: '25px'
    },
    forgotButton: {
      background: 'none',
      border: 'none',
      color: '#6b7280',
      fontSize: '13px',
      cursor: 'pointer',
      textDecoration: 'underline',
      textUnderlineOffset: '2px'
    },
    submitButton: {
      width: '100%',
      height: '52px',
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    },
    separator: {
      position: 'relative',
      margin: '30px 0',
      textAlign: 'center'
    },
    separatorLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      background: '#f3f4f6',
      zIndex: 1
    },
    separatorText: {
      position: 'relative',
      zIndex: 2,
      display: 'inline-block',
      padding: '0 15px',
      background: 'white',
      color: '#9ca3af',
      fontSize: '13px'
    },
    registerContainer: {
      textAlign: 'center'
    },
    registerText: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '15px'
    },
    registerButton: {
      width: '100%',
      height: '52px',
      background: 'white',
      color: '#1f2937',
      border: '2px solid #1f2937',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    terms: {
      marginTop: '30px',
      fontSize: '11px',
      color: '#9ca3af',
      textAlign: 'center',
      lineHeight: '1.6'
    },
    termsLink: {
      color: '#6b7280',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      margin: '0 2px'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Watermarks decorativos */}
      <div style={styles.watermark}>
        <span className="material-symbols-outlined" style={{fontSize: 'inherit'}}>
          medical_services
        </span>
      </div>
      <div style={styles.watermarkBottom}>
        <span className="material-symbols-outlined" style={{fontSize: 'inherit'}}>
          pill
        </span>
      </div>

      <main style={styles.main}>
        <div style={styles.card}>
          
          {/* Logo */}
          <div style={styles.logoContainer}>
            <div style={styles.logo}>
              <span className="material-symbols-outlined" style={styles.logoIcon}>
                local_hospital
              </span>
            </div>
            <h1 style={styles.title}>Farmacia Rincón</h1>
            <p style={styles.brandSubtitle}>Salud a tu alcance</p>
          </div>

          {/* Welcome */}
          <div style={styles.welcomeContainer}>
            <h2 style={styles.welcomeTitle}>BIENVENIDO</h2>
            <p style={styles.welcomeSubtitle}>Inicia sesión</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>CORREO ELECTRÓNICO</label>
              <div style={styles.inputContainer}>
                <span className="material-symbols-outlined" style={styles.inputIcon}>
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f9a8d4';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 4px #fce7f3';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f3f4f6';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>CONTRASEÑA</label>
              <div style={styles.inputContainer}>
                <span className="material-symbols-outlined" style={styles.inputIcon}>
                  lock
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f9a8d4';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 4px #fce7f3';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f3f4f6';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={styles.forgotPassword}>
              <button
                type="button"
                style={styles.forgotButton}
                onClick={() => alert('Funcionalidad de recuperación')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={styles.submitButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.background = 'linear-gradient(135deg, #111827 0%, #1f2937 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
              }}
            >
              <span>Iniciar sesión</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Separator */}
          <div style={styles.separator}>
            <div style={styles.separatorLine}></div>
            <span style={styles.separatorText}>o</span>
          </div>

          {/* Register */}
          <div style={styles.registerContainer}>
            <p style={styles.registerText}>¿No tienes una cuenta?</p>
            <button
              type="button"
              onClick={() => navigate('/registro')}
              style={styles.registerButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#1f2937';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#1f2937';
              }}
            >
              Crear cuenta nueva
            </button>
          </div>

          {/* Terms */}
          <p style={styles.terms}>
            Al continuar, aceptas nuestros{' '}
            <a href="#" style={styles.termsLink}>Términos de Servicio</a>{' '}
            y{' '}
            <a href="#" style={styles.termsLink}>Política de Privacidad</a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;