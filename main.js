document.addEventListener("DOMContentLoaded", () => {
  // Respetar la preferencia del sistema: si el usuario pidió menos movimiento,
  // la terminal sigue funcional pero sin typewriter/scroll infinito agresivo.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intersection Observer para la Tarjeta de Perfil y la Sección de Proyectos
  // Función genérica para animación de tipeo (se ejecuta una sola vez)
  const typeWriterOnce = (el, speed = 100) => {
    if (el.dataset.typingStarted) return;
    el.dataset.typingStarted = "true";
    const text = el.dataset.originalText || el.textContent.trim();
    el.textContent = "";
    el.classList.add('typing-cursor');
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        el.classList.remove('typing-cursor');
      }
    };
    type();
  };

  // Preparar los headers para que no tengan texto al inicio (evita parpadeo)
  document.querySelectorAll('.about-section h2, .tech-stack h2, .experience-section h2, .project-section h2').forEach(h2 => {
    h2.dataset.originalText = h2.textContent.trim();
    h2.textContent = "";
  });

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");

          // Si la sección tiene un h2, disparamos el efecto de tipeo (excepto en la profile card)
          const h2 = entry.target.querySelector("h2");
          if (h2 && !h2.dataset.typingStarted && !entry.target.classList.contains("profile-card")) {
            typeWriterOnce(h2, 150);
          }
        } else {
          entry.target.classList.remove("show");
        }
      });
    },
    { threshold: 0.2 } // Disparar antes para que la línea se mueva al entrar
  );




  const profileCard = document.querySelector(".profile-card");
  if (profileCard) sectionObserver.observe(profileCard);

  const aboutSection = document.querySelector(".about-section");
  if (aboutSection) {
    // Animacion de About: dispara recien cuando la seccion sube lo
    // suficiente en el viewport (borde inferior recortado 35%), no apenas
    // asoma por abajo.
    const aboutObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            const h2 = entry.target.querySelector("h2");
            if (h2 && !h2.dataset.typingStarted && !entry.target.classList.contains("profile-card")) {
              typeWriterOnce(h2, 150);
            }
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0.15 }
    );
    aboutObserver.observe(aboutSection);
  }

  const techStackSection = document.querySelector(".tech-stack");
  if (techStackSection) sectionObserver.observe(techStackSection);

  // Sección de proyectos: umbral BAJO y reveal permanente. Con el umbral
  // compartido (0.2 = 20% visible) el .show nunca se agregaba: la sección es
  // tan alta en mobile que jamás llega a 20% dentro del viewport, y sin .show
  // quedaba en opacity 0 → "no se ven los proyectos". Una vez revelada, se
  // queda (sin quitar .show al salir, no parpadea).
  const projectSection = document.querySelector(".project-section");
  if (projectSection) {
    const projectsObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            const h2 = entry.target.querySelector("h2");
            if (h2 && !h2.dataset.typingStarted && !entry.target.classList.contains("profile-card")) {
              typeWriterOnce(h2, 150);
            }
          }
        });
      },
      { threshold: 0.05 }
    );
    projectsObserver.observe(projectSection);
  }

  const experienceSection = document.querySelector(".experience-section");
  if (experienceSection) sectionObserver.observe(experienceSection);

  // Intersection Observer para iconos del stack tecnológico (revelación escalonada vía JS)
  const iconObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('language-container')) {
          const icons = entry.target.querySelectorAll('.language');
          if (entry.isIntersecting) {
            icons.forEach((icon, i) => {
              setTimeout(() => icon.classList.add('show'), i * 80);
            });
          } else {
            icons.forEach(icon => icon.classList.remove('show'));
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll(".language-container")
    .forEach(el => iconObserver.observe(el));

  // --- Acordeón del Tech Stack (click/touch) ---
  // El hover ya funciona en desktop vía CSS; esto agrega soporte táctil
  // y el comportamiento de acordeón (exclusivo) para todos los dispositivos.
  const techCategories = document.querySelectorAll(".tech-category");
  techCategories.forEach((category) => {
    const header = category.querySelector(".tech-category-header");
    if (header) {
      header.addEventListener("click", () => {
        const wasOpen = category.classList.contains("open");
        techCategories.forEach((c) => c.classList.remove("open"));
        if (!wasOpen) category.classList.add("open");
      });
    }
  });

  const hero = document.querySelector(".hero");
  const gridContainer = document.getElementById("grid-container");

  if (hero && gridContainer) {
    // Seguir al ratón para crear la máscara de foco de luz
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      gridContainer.style.setProperty("--mouse-x", `${mouseX}px`);
      gridContainer.style.setProperty("--mouse-y", `${mouseY}px`);
    });

    // Animar el movimiento de la cuadrícula de forma infinita
    let offsetX = 0;
    let offsetY = 0;
    const speedX = 0.4;
    const speedY = 0.4;

    const animateGrid = () => {
      // Reiniciar el desplazamiento a 0 cuando alcanza los 40px (tamaño de la cuadrícula)
      offsetX = (offsetX + speedX) % 40;
      offsetY = (offsetY + speedY) % 40;
      
      gridContainer.style.setProperty("--grid-offset-x", `${offsetX}px`);
      gridContainer.style.setProperty("--grid-offset-y", `${offsetY}px`);
      
      requestAnimationFrame(animateGrid);
    };

    if (!prefersReducedMotion) {
      animateGrid();
    }
  }

  // --- Animación de Tipeo para el Hero (H1) ---
  const heroH1 = document.querySelector('.presentation h1');
  let startHeroTyping = () => {};

  if (heroH1) {
    // Texto a simular que se escribe
    const textToType = "Hi, I'm Alex Alvez";
    
    // Preparar el elemento limpiando y SIN cursor inicial
    heroH1.textContent = "";

    startHeroTyping = () => {
      if (prefersReducedMotion) {
        heroH1.textContent = textToType;
        heroH1.classList.remove('typing-cursor');
        const glitchWrapper = document.querySelector('.glitch-wrapper');
        if (glitchWrapper) glitchWrapper.classList.add('show');
        return;
      }

      heroH1.classList.add('typing-cursor');
      let charIndex = 0;
      let isDeleting = false;

      const typeWriter = () => {
        if (isDeleting) {
          // Borrando caracteres
          heroH1.textContent = textToType.substring(0, charIndex - 1);
          charIndex--;
        } else {
          // Escribiendo caracteres
          heroH1.textContent = textToType.substring(0, charIndex + 1);
          charIndex++;
        }

        // Definir la velocidad base
        let typeSpeed = isDeleting ? 100 : 100;

        // Comprobar si ha terminado de escribir la frase
        if (!isDeleting && charIndex === textToType.length) {
          // Pausa larga cuando termina de escribir
          typeSpeed = 3000;
          isDeleting = true;
        } 
        // Comprobar si ha terminado de borrar
        else if (isDeleting && charIndex === 0) {
          // Pausa corta antes de volver a empezar
          isDeleting = false;
          typeSpeed = 800;
        }

        setTimeout(typeWriter, typeSpeed);
      };

      // Comenzar animación text H1
      setTimeout(typeWriter, 500);
      
      // Mostrar el subtitulo deslizando desde abajo
      setTimeout(() => {
        const glitchWrapper = document.querySelector('.glitch-wrapper');
        if (glitchWrapper) glitchWrapper.classList.add('show');
      }, 500); 
    };
  }

  // --- Scroll Suave Manual para el botón de bajar ---
  const scrollIcon = document.querySelector('.scroll-down-icon');
  if (scrollIcon) {
    scrollIcon.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = scrollIcon.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const startPosition = window.pageYOffset || window.scrollY;
        const targetPosition = targetElement.getBoundingClientRect().top + startPosition;
        const distance = targetPosition - startPosition;
        const duration = 800; 
        let start = null;

    
        const easeInOutCubic = (t, b, c, d) => {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t * t + b;
          t -= 2;
          return c / 2 * (t * t * t + 2) + b;
        };

        const animation = (currentTime) => {
          if (start === null) start = currentTime;
          const timeElapsed = currentTime - start;
          const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
          window.scrollTo(0, run);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          } else {
            window.scrollTo(0, targetPosition);
          }
        };

        requestAnimationFrame(animation);
      }
    });
  }

  // --- Terminal Interactiva ---
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInputLine = document.getElementById('terminal-input-line');
  const terminalInput = document.getElementById('terminal-input');
  const terminalBody = document.getElementById('terminal-body');

  // Bloquear scroll hasta que cargue la consola (con red de seguridad)
  document.body.classList.add('no-scroll');

  // Desbloquea la página y muestra navegación + botón de idioma
  const unlockPage = () => {
    document.body.classList.remove('no-scroll');
    const scrollArrow = document.querySelector('.scroll-down-icon');
    if (scrollArrow) scrollArrow.classList.add('show');
    const iconNav = document.getElementById('icon-nav');
    if (iconNav) iconNav.classList.add('show');
    const langSwitcher = document.querySelector('.lang-switcher');
    if (langSwitcher) langSwitcher.classList.add('show');
  };

  // Red de seguridad: si el boot de la terminal falla o se traba, nunca
  // dejar la página con el scroll bloqueado.
  setTimeout(unlockPage, 8000);

  if (terminalOutput && terminalInput && terminalBody) {

    const addLine = (html, extraClass = '') => {
      const line = document.createElement('div');
      line.className = 'terminal-line' + (extraClass ? ` ${extraClass}` : '');
      line.innerHTML = html;
      terminalOutput.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    // Escapa caracteres HTML para no inyectar código desde la entrada del usuario
    const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));



    // Líneas de la secuencia de arranque
    const bootSequence = [
      { html: '> <span class="cmd">npm start alex-portfolio</span>', delay: 500 },
      { html: '', delay: 200 },
      { html: '<span class="dim">[..........] / installing dependencies</span>', delay: 700 },
      { html: '<span class="dim">[##########] ✓ dependencies ready</span>', delay: 500 },
      { html: '', delay: 150 },
      { html: '&nbsp;&nbsp;<span class="dim">⊙</span> Compiling modules...', delay: 400 },
      { html: '&nbsp;&nbsp;<span class="dim">⊙</span> Building portfolio...', delay: 400 },
      { html: '&nbsp;&nbsp;<span class="dim">⊙</span> Starting dev server...', delay: 400 },
      { html: '', delay: 200 },
      { html: '<span class="green">  ✓ Portfolio is running successfully!</span>', delay: 100 },
      { html: '', delay: 300 },
      { html: '<span class="yellow">  Type \'help\' to see available commands.</span>', delay: 100 },
      { html: '', delay: 200 },
    ];

    // Ejecutar secuencia de arranque, luego mostrar input
    let bootIndex = 0;
    const runBoot = () => {
      if (bootIndex < bootSequence.length) {
        const item = bootSequence[bootIndex];
        addLine(item.html);
        bootIndex++;
        setTimeout(runBoot, item.delay);
      } else {
        // Mostrar línea de entrada
        terminalInputLine.style.display = 'flex';
        terminalInput.focus();
        terminalBody.scrollTop = terminalBody.scrollHeight;
        
        // Mover terminal a la derecha y expandir texto
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.classList.remove('booting');

        // Disparar la animación de texto del Hero al terminar la terminal
        startHeroTyping();

        // Desbloquear scroll y mostrar flecha + nav + lang switcher
        unlockPage();
      }
    };

    // Iniciar arranque con un pequeño retraso
    setTimeout(runBoot, 800);

    // Hacer click en cualquier parte del body del terminal para enfocar el input
    terminalBody.addEventListener('click', () => {
      if (terminalInputLine.style.display !== 'none') {
        terminalInput.focus();
      }
    });

    // Manejo de comandos
    const commands = {
      about: () => {
        addLine('');
        addLine("<span class='cyan'>Full Stack Developer from Argentina. Currently 4th year Bachelor's Degree in Systems student at UADER. Passionate about building modern web apps</span>");
        addLine('');
      },
      skills: () => {
        addLine('');
        addLine('  <span class="cyan">Front:</span>      <span class="cmd">HTML · CSS · JavaScript · TypeScript</span>');
        addLine('  <span class="cyan">Back:</span>       <span class="cmd">Python · Node.js · PostgreSQL</span>');
        addLine('  <span class="cyan">Frameworks:</span> <span class="cmd">React · Express · NestJS · Tailwind</span>');
        addLine('  <span class="cyan">IA Tools:</span>   <span class="cmd">Codex · Claude · Gemini</span>');
        addLine('  <span class="cyan">Tools:</span>      <span class="cmd">GitHub · Docker · Postman</span>');
        addLine('');
      },
      projects: () => {
        addLine('');
        addLine('  <span class="cyan">1.</span> <span class="cmd">Task Management App</span>');
        addLine('  <span class="cyan">2.</span> <span class="cmd">Amargo y Dulce (E-commerce)</span>');
        addLine('  <span class="cyan">3.</span> <span class="cmd">Districom Landing Page</span>');
        addLine('  <span class="cyan">4.</span> <span class="cmd">Vialibre (Mobile + Dashboard)</span>');
        addLine('');
        addLine('  <span class="yellow">↓ Scroll down to see more</span>');
        addLine('');
      },
      contact: () => {
        addLine('');
        addLine('  <span class="cyan">Email:   alexfalvez001@gmail.com</span>');
        addLine('  <span class="cyan">Phone:   +54 9 3442 66-8413</span>');
        addLine('');
      },
      help: () => {
        addLine('');
        addLine('<span class="cyan">  Available commands:</span>');
        addLine('  <span class="cmd">about </span>    <span class="dim">View my information</span>');
        addLine('  <span class="cmd">skills </span>   <span class="dim">View my tech stack</span>');
        addLine('  <span class="cmd">projects </span> <span class="dim">View my projects</span>');
        addLine('  <span class="cmd">contact </span>  <span class="dim">View my contact information</span>');
        addLine('  <span class="cmd">clear </span>    <span class="dim">Clear this terminal</span>');
        addLine('  <span class="cmd">help </span>     <span class="dim">Show this help menu</span>');
        addLine('');
      },
      clear: () => {
        terminalOutput.innerHTML = '';
      }
    };

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = terminalInput.value.trim().toLowerCase();
        
        // Repetir el comando escrito (escapeado para evitar self-XSS)
        addLine(`<span class="cmd">visitor@alex&gt;</span> ${escapeHtml(value) || ' '}`);
        terminalInput.value = '';

        if (value === '') return;

        if (commands[value]) {
          setTimeout(() => commands[value](), 300);
        } else {
          addLine(`<span class="pink">  Command not found: '${escapeHtml(value)}'. Type 'help' for available commands.</span>`);
        }
      }
    });
  }

  // --- Scroll Spy para el Nav ---
  const navLinks = document.querySelectorAll('.nav-icon');
  const sections = document.querySelectorAll('#hero, #about-section, #tech-section, #projects-section, #experience-section, #profile');

  if (navLinks.length && sections.length) {
    const setActive = (id) => {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) {
          link.classList.add('active');
        }
      });
    };

    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(section => spyObserver.observe(section));
  }

  // --- Botón de contacto (teléfono) ---
  // Scroll directo a la card de perfil con scrollIntoView: no depende de
  // la navegación por anclas (#profile), que en algunos móviles no
  // scrollea cuando el contenedor raíz tiene overflow-x recortado.
  const contactLink = document.querySelector('a[href="#profile"]');
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      const profile = document.getElementById('profile');
      if (profile) profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // --- Lógica de cambio de idioma ---
  const translations = {
    en: {
      hero_role: "Full Stack Developer",
      profile_role: "Web Developer",
      contact_btn: "Contact Me",
      about_title: "ABOUT ME",
      about_p1: "Hello! I'm Alex Alvez, a graduated <strong>Systems Analyst</strong> and passionate Web Developer from Argentina. I specialize in building responsive and interactive web applications using modern technologies. My journey in tech is driven by a strong desire to create seamless, user-centric experiences.",
      about_p2: "Currently, I'm in the fourth year of a <strong>Bachelor's Degree in Systems</strong>, which provides me with a solid foundation in computer science principles and software engineering practices. I thrive in collaborative environments and I am always looking to learn new tools and frameworks to stay updated with the latest trends in web development.",
      edu_analyst_title: "Graduated: Systems Analyst",
      edu_bachelor_title: "In Progress: Bachelor's Degree in Systems",
      skills_title: "SOFT SKILLS & INTERESTS",
      skill_teamwork: "TEAMWORK",
      skill_comm: "COMMUNICATION",
      skill_agile: "AGILE METHODOLOGIES",
      skill_proactive: "PROACTIVITY",
      skill_adapt: "ADAPTABILITY",
      download_cv: "DOWNLOAD CV",
      tech_title: "TECH STACK",
      tech_ai_tools: "AI TOOLS",
      tech_tools: "TOOLS",
      projects_title: "MY PROJECTS",
      experience_title: "WORK EXPERIENCE",
      proj1_desc: "Premium landing page for a technology company featuring an interactive 3D hero, real-time business status, and a modern aesthetic.",
      proj2_desc: "Landing page for a burger restaurant with slide-out cart, WhatsApp checkout and delivery options in dark mode.",
      proj3_desc: "Full-featured e-commerce with Mercado Pago and Google integration, shopping cart, shipment tracking and admin dashboard.",
      proj4_status: "app + dashboard",
      proj4_desc: "Vialibre is a collaborative platform for reporting urban accessibility obstacles in public spaces. Citizens report with photo and geolocation from a React Native mobile app, where AI validates the photographic evidence and suggests severity; municipal teams manage everything from a protected dashboard (React + Vite + Tailwind) with live metrics, a PostGIS map and AI verdicts.",
      proj4_dash_label: "Dashboard",
      proj4_app_label: "Mobile App",
      visit_site: "Visit Site",
      visit_repo: "Visit Repo"
    },
    es: {
      hero_role: "Desarrollador Full Stack",
      profile_role: "Desarrollador Web",
      contact_btn: "Contáctame",
      about_title: "SOBRE MÍ",
      about_p1: "¡Hola! Soy Alex Alvez, un <strong>Analista de Sistemas</strong> recibido y un apasionado Desarrollador Web de Argentina. Me especializo en crear aplicaciones web responsivas e interactivas utilizando tecnologías modernas. Mi viaje en la tecnología está impulsado por un fuerte deseo de crear experiencias de usuario fluidas.",
      about_p2: "Actualmente estoy en el cuarto año de la <strong>Licenciatura en Sistemas</strong>, lo cual me proporciona una base sólida en principios de ciencias de la computación y prácticas de ingeniería de software. Me desenvuelvo muy bien en entornos colaborativos y siempre busco aprender nuevas herramientas para mantenerme actualizado con las últimas tendencias del desarrollo web.",
      edu_analyst_title: "Recibido: Analista de Sistemas",
      edu_bachelor_title: "En Curso: Licenciatura en Sistemas",
      skills_title: "HABILIDADES BLANDAS E INTERESES",
      skill_teamwork: "TRABAJO EN EQUIPO",
      skill_comm: "COMUNICACIÓN",
      skill_agile: "METODOLOGÍAS ÁGILES",
      skill_proactive: "PROACTIVIDAD",
      skill_adapt: "ADAPTABILIDAD",
      download_cv: "DESCARGAR CV",
      tech_title: "TECNOLOGÍAS",
      tech_ai_tools: "HERRAMIENTAS IA",
      tech_tools: "HERRAMIENTAS",
      projects_title: "MIS PROYECTOS",
      experience_title: "EXPERIENCIA LABORAL",
      proj1_desc: "Landing page premium para una empresa de tecnología con un hero 3D interactivo, estado de la empresa en tiempo real y una estética moderna.",
      proj2_desc: "Landing para hamburguesería con carrito deslizante, checkout por WhatsApp y selector de entrega en modo oscuro.",
      proj3_desc: "E-commerce completo con integración de Mercado Pago y Google, carrito de compras, seguimiento de envíos y panel de administración.",
      proj4_status: "app + dashboard",
      proj4_desc: "Vialibre es una plataforma colaborativa para reportar obstáculos de accesibilidad en el espacio público. Los ciudadanos reportan con foto y geolocalización desde una app móvil en React Native, donde la IA valida la evidencia fotográfica y sugiere la severidad; los equipos municipales gestionan todo desde un panel protegido (React + Vite + Tailwind) con métricas en vivo, mapa PostGIS y veredictos de IA.",
      proj4_dash_label: "Panel",
      proj4_app_label: "App movil",
      visit_site: "Visitar Sitio",
      visit_repo: "Visitar Repositorio"
    }
  };

  const btnEn = document.getElementById('btn-en');
  const btnEs = document.getElementById('btn-es');

  const setLanguage = (lang) => {
    // Actualizar estado del botón activo
    if (lang === 'es') {
      btnEs.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnEs.classList.remove('active');
    }

    // Actualizar elementos
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        
        el.innerHTML = translations[lang][key];
        
        // Manejar actualización de datos originales del efecto máquina de escribir
        if (el.dataset.originalText) {
          el.dataset.originalText = translations[lang][key];
          // Si aún no ha escrito, no mostrar el texto
          if(!el.dataset.typingStarted) {
             el.textContent = "";
          }
        }
        
        // Manejar atributo personalizado del efecto glitch
        if (el.classList.contains('glitch-text')) {
           el.setAttribute('data-text', translations[lang][key]);
        }
      }
    });

    localStorage.setItem('portfolio_lang', lang);
  };

  // Event Listeners
  if (btnEn && btnEs) {
    btnEn.addEventListener('click', () => setLanguage('en'));
    btnEs.addEventListener('click', () => setLanguage('es'));
  }

  // Load saved language or default to English
  const savedLang = localStorage.getItem('portfolio_lang') || 'en';
  setLanguage(savedLang);

  // --- Hash del último commit en el footer (fallback silencioso) ---
  const footerCommitHash = document.getElementById('footer-commit-hash');
  if (footerCommitHash) {
    fetch('https://api.github.com/repos/alexalvez01/Portfolio/commits?per_page=1')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('github api'))))
      .then((data) => {
        if (Array.isArray(data) && data[0] && data[0].sha) {
          footerCommitHash.textContent = data[0].sha.slice(0, 7);
        }
      })
      .catch(() => {
        /* Sin conexión o error: queda el hash placeholder */
      });
  }

  // --- Vialibre carousels: phone (vertical scroll) + dashboard (horizontal track) ---
  // Self-contained, no dependencies. Respects prefers-reduced-motion (instant jump).
  const initVialibreCarousels = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    // Phone: slides stacked vertically, JS animates scrollTop like a real phone scroll
    const phoneScreen = document.getElementById('vialibre-phone-screen');
    if (phoneScreen) {
      const slides = Array.from(phoneScreen.querySelectorAll('.phone-slide'));
      const prevBtn = document.querySelector('[data-phone-prev]');
      const nextBtn = document.querySelector('[data-phone-next]');
      const dots = Array.from(document.querySelectorAll('[data-phone-dot]'));
      let phoneIndex = 0;
      let phoneToken = 0;
      let phoneAnimating = false;

      const setPhoneDots = (i) => {
        dots.forEach((d, k) => {
          d.classList.toggle('active', k === i);
          if (k === i) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      };

      // Measured on demand from live layout: robust to lazy image loading
      const phoneSlideTop = (i) => {
        const target = slides[i];
        if (!target) return 0;
        const screenRect = phoneScreen.getBoundingClientRect();
        const slideRect = target.getBoundingClientRect();
        return phoneScreen.scrollTop + (slideRect.top - screenRect.top);
      };

      const animateScrollTop = (from, to, duration, done) => {
        const token = ++phoneToken;
        phoneAnimating = true;
        const maxTop = phoneScreen.scrollHeight - phoneScreen.clientHeight;
        let start = null;
        const finishing = () => {
          phoneScreen.scrollTop = Math.max(0, Math.min(to, maxTop));
          phoneAnimating = false;
          if (done) done();
        };
        const step = (now) => {
          if (token !== phoneToken) {
            phoneAnimating = false;
            return;
          }
          if (start === null) start = now;
          const t = Math.min((now - start) / duration, 1);
          phoneScreen.scrollTop = from + (to - from) * easeOutQuart(t);
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            phoneScreen.scrollTop = to;
            finishing();
          }
        };
        requestAnimationFrame(step);
      };

      const goToPhone = (i) => {
        if (!slides.length) return;
        phoneIndex = ((i % slides.length) + slides.length) % slides.length;
        setPhoneDots(phoneIndex);
        const target = phoneSlideTop(phoneIndex);
        if (reduceMotion) {
          phoneToken++;
          phoneAnimating = false;
          phoneScreen.scrollTop = target;
          return;
        }
        if (Math.abs(target - phoneScreen.scrollTop) < 1) {
          phoneToken++;
          phoneAnimating = false;
          return;
        }
        animateScrollTop(phoneScreen.scrollTop, target, 720);
      };

      if (prevBtn) prevBtn.addEventListener('click', () => goToPhone(phoneIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToPhone(phoneIndex + 1));
      dots.forEach((d) => {
        d.addEventListener('click', () => goToPhone(parseInt(d.getAttribute('data-phone-dot'), 10) || 0));
      });

      // Keep dots in sync if the user scrolls the screen manually
      let scrollTimer = null;
      phoneScreen.addEventListener('scroll', () => {
        if (phoneAnimating) return;
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const h = phoneScreen.clientHeight || 1;
          const nearest = Math.round(phoneScreen.scrollTop / h);
          phoneIndex = Math.max(0, Math.min(slides.length - 1, nearest));
          setPhoneDots(phoneIndex);
        }, 120);
      }, { passive: true });
    }

    // Dashboard: classic horizontal track with translateX
    const dashTrack = document.getElementById('vialibre-dash-track');
    if (dashTrack) {
      const slides = Array.from(dashTrack.querySelectorAll('.vialibre-dash-slide'));
      const prevBtn = document.querySelector('[data-dash-prev]');
      const nextBtn = document.querySelector('[data-dash-next]');
      const dots = Array.from(document.querySelectorAll('[data-dash-dot]'));
      let dashIndex = 0;

      const goToDash = (i) => {
        if (!slides.length) return;
        dashIndex = ((i % slides.length) + slides.length) % slides.length;
        dashTrack.style.transform = `translateX(-${dashIndex * 100}%)`;
        dots.forEach((d, k) => {
          d.classList.toggle('active', k === dashIndex);
          if (k === dashIndex) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => goToDash(dashIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToDash(dashIndex + 1));
      dots.forEach((d) => {
        d.addEventListener('click', () => goToDash(parseInt(d.getAttribute('data-dash-dot'), 10) || 0));
      });
    }

    // Districom (card 1): mismo patron horizontal con translateX que el dashboard
    const districomTrack = document.getElementById('districom-track');
    if (districomTrack) {
      const slides = Array.from(districomTrack.querySelectorAll('.districom-slide'));
      const prevBtn = document.querySelector('[data-districom-prev]');
      const nextBtn = document.querySelector('[data-districom-next]');
      const dots = Array.from(document.querySelectorAll('[data-districom-dot]'));
      let districomIndex = 0;

      const goToDistricom = (i) => {
        if (!slides.length) return;
        districomIndex = ((i % slides.length) + slides.length) % slides.length;
        districomTrack.style.transform = `translateX(-${districomIndex * 100}%)`;
        dots.forEach((d, k) => {
          d.classList.toggle('active', k === districomIndex);
          if (k === districomIndex) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => goToDistricom(districomIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToDistricom(districomIndex + 1));
      dots.forEach((d) => {
        d.addEventListener('click', () => goToDistricom(parseInt(d.getAttribute('data-districom-dot'), 10) || 0));
      });
    }

    // Amargo y Dulce (card 3): mismo patron horizontal con translateX
    const amargoTrack = document.getElementById('amargo-track');
    if (amargoTrack) {
      const slides = Array.from(amargoTrack.querySelectorAll('.amargo-slide'));
      const prevBtn = document.querySelector('[data-amargo-prev]');
      const nextBtn = document.querySelector('[data-amargo-next]');
      const dots = Array.from(document.querySelectorAll('[data-amargo-dot]'));
      let amargoIndex = 0;

      const goToAmargo = (i) => {
        if (!slides.length) return;
        amargoIndex = ((i % slides.length) + slides.length) % slides.length;
        amargoTrack.style.transform = `translateX(-${amargoIndex * 100}%)`;
        dots.forEach((d, k) => {
          d.classList.toggle('active', k === amargoIndex);
          if (k === amargoIndex) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => goToAmargo(amargoIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToAmargo(amargoIndex + 1));
      dots.forEach((d) => {
        d.addEventListener('click', () => goToAmargo(parseInt(d.getAttribute('data-amargo-dot'), 10) || 0));
      });
    }

    // CheesyBite (card 2): mismo patron horizontal con translateX
    const cheesyTrack = document.getElementById('cheesy-track');
    if (cheesyTrack) {
      const slides = Array.from(cheesyTrack.querySelectorAll('.cheesy-slide'));
      const prevBtn = document.querySelector('[data-cheesy-prev]');
      const nextBtn = document.querySelector('[data-cheesy-next]');
      const dots = Array.from(document.querySelectorAll('[data-cheesy-dot]'));
      let cheesyIndex = 0;

      const goToCheesy = (i) => {
        if (!slides.length) return;
        cheesyIndex = ((i % slides.length) + slides.length) % slides.length;
        cheesyTrack.style.transform = `translateX(-${cheesyIndex * 100}%)`;
        dots.forEach((d, k) => {
          d.classList.toggle('active', k === cheesyIndex);
          if (k === cheesyIndex) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => goToCheesy(cheesyIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToCheesy(cheesyIndex + 1));
      dots.forEach((d) => {
        d.addEventListener('click', () => goToCheesy(parseInt(d.getAttribute('data-cheesy-dot'), 10) || 0));
      });
    }
  };

  initVialibreCarousels();

  // --- Sidebar slides left while the projects section is in view ---
  // Franja central como histéresis: se activa cuando la sección toca el
  // 60% central del viewport y se desactiva al salir de esa franja, no en
  // el borde exacto. Con threshold 0.05 el flapeo en el límite
  // proyectos→experiencia + el reflow del colapso se retroalimentaban y
  // el layout parpadeaba; la franja separa los puntos de toggle y rompe
  // el loop aunque la sidebar colapse (width 0 → contenido al centro).
  const projectsSection = document.querySelector('#projects-section');
  if (projectsSection && 'IntersectionObserver' in window) {
    const projectsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle('vialibre-active', entry.isIntersecting);
        });
      },
      { rootMargin: '-15% 0px -25% 0px', threshold: 0 }
    );
    projectsObserver.observe(projectsSection);
  }

  // --- Reveal individual por proyecto ---
  // Cada card entra por separado al volverse visible; una vez revelada, queda.
  const projectCards = document.querySelectorAll('.project');
  if ('IntersectionObserver' in window && projectCards.length) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('project-in');
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    projectCards.forEach((card) => cardObserver.observe(card));
  }

  // --- Sección de proyectos: columna estática, reveal al scrollear ---
  // Las cards se apilan una tras otra en .container-projects (flex column).
  // Sin sticky y sin scroll-math: el IntersectionObserver agrega .show
  // y el CSS se encarga del resto.

});
