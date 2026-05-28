document.addEventListener("DOMContentLoaded", () => {
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
  document.querySelectorAll('.about-section h2, .tech-stack h2, .project-section h2').forEach(h2 => {
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
  if (aboutSection) sectionObserver.observe(aboutSection);

  const techStackSection = document.querySelector(".tech-stack");
  if (techStackSection) sectionObserver.observe(techStackSection);

  const projectSection = document.querySelector(".project-section");
  if (projectSection) sectionObserver.observe(projectSection);

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

    animateGrid();
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

  // Bloquear scroll hasta que cargue la consola
  document.body.classList.add('no-scroll');

  if (terminalOutput && terminalInput && terminalBody) {

    const addLine = (html, extraClass = '') => {
      const line = document.createElement('div');
      line.className = 'terminal-line' + (extraClass ? ` ${extraClass}` : '');
      line.innerHTML = html;
      terminalOutput.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    };



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
        document.body.classList.remove('no-scroll');
        const scrollArrow = document.querySelector('.scroll-down-icon');
        if (scrollArrow) scrollArrow.classList.add('show');
        const iconNav = document.getElementById('icon-nav');
        if (iconNav) iconNav.classList.add('show');
        const langSwitcher = document.querySelector('.lang-switcher');
        if (langSwitcher) langSwitcher.classList.add('show');
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
        
        // Repetir el comando escrito
        addLine(`<span class="cmd">visitor@alex&gt;</span> ${value || ' '}`);
        terminalInput.value = '';

        if (value === '') return;

        if (commands[value]) {
          setTimeout(() => commands[value](), 300);
        } else {
          addLine(`<span class="pink">  Command not found: '${value}'. Type 'help' for available commands.</span>`);
        }
      }
    });
  }

  // --- Scroll Spy para el Nav ---
  const navLinks = document.querySelectorAll('.nav-icon');
  const sections = document.querySelectorAll('#hero, #about-section, #tech-section, #projects-section');

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
      proj1_desc: "Premium landing page for a technology company featuring an interactive 3D hero, real-time business status, and a modern aesthetic.",
      proj2_desc: "Full Stack task manager with authentication, full CRUD, REST API and dynamic UI in dark mode.",
      proj3_desc: "Full-featured e-commerce with Mercado Pago and Google integration, shopping cart, shipment tracking and admin dashboard.",
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
      proj1_desc: "Landing page premium para una empresa de tecnología con un hero 3D interactivo, estado de la empresa en tiempo real y una estética moderna.",
      proj2_desc: "Administrador de tareas Full Stack con autenticación, CRUD completo, API REST y UI dinámica en modo oscuro.",
      proj3_desc: "E-commerce completo con integración de Mercado Pago y Google, carrito de compras, seguimiento de envíos y panel de administración.",
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

  // --- Stacking Cards Effect ---
  const projects = document.querySelectorAll('.project');
  if (projects.length > 0) {
    const handleStacking = () => {
      projects.forEach((project, index) => {
        let scale = 1;
        let brightness = 1;
        
        if (index < projects.length - 1) {
          const nextProject = projects[index + 1];
          const nextRect = nextProject.getBoundingClientRect();
          const nextStickyTop = 150 + ((index + 1) * 40);
          
          const distance = nextRect.top - nextStickyTop;
          const maxDistance = 300; 
          
          if (distance < maxDistance && distance >= 0) {
            const progress = 1 - (distance / maxDistance);
            scale = 1 - (progress * 0.05); 
            brightness = 1 - (progress * 0.6); 
          } else if (distance < 0) {
            scale = 0.95;
            brightness = 0.4;
          }
        }
        
        if (scale === 1) {
          project.style.scale = '';
          project.style.filter = '';
          project.style.pointerEvents = 'auto';
        } else {
          project.style.scale = scale;
          project.style.filter = `brightness(${brightness})`;
          project.style.pointerEvents = scale < 0.98 ? 'none' : 'auto';
        }
      });
    };

    window.addEventListener('scroll', handleStacking, { passive: true });
    window.addEventListener('resize', handleStacking, { passive: true });
    setTimeout(handleStacking, 100);
  }

});
