export type Locale = "en" | "es";

export const LANDING_COPY = {
  en: {
    nav: {
      about: "About",
      work: "Work",
      skills: "Skills",
      contact: "Get in touch",
      mainLabel: "Main navigation",
      menuLabel: "Toggle menu",
      languageLabel: "Ver sitio en español",
    },
    hero: {
      welcome: "Welcome to my personal site",
      contact: "Get in touch",
      work: "Featured Work",
      productPrefix: "Product",
      productSuffix: "",
      rotatingWords: ["Designer", "Specialist", "Builder"],
      rotatingLabel: "Designer, Specialist and Builder",
    },
    about: {
      intro: "I'm Matias Monzalvo",
      description:
        "22yo design engineer based in Buenos Aires. I turn complex problems into clear, useful digital products, moving from early strategy to shipped details and building the systems that keep every experience coherent as it grows.\nThis is the tool I work with every day.",
      facts: [
        { value: "6 years", label: "Designing products" },
        { value: "40+", label: "Shipped features" },
        { value: "Based in", label: "Buenos Aires, Argentina" },
      ],
    },
    work: {
      heading: "Featured Work",
      description: (count: number) =>
        `Apps, sites, products and the systems behind them. +${count} projects shipped end to end.`,
      imageAlt: (title: string) => `Screenshot of ${title}`,
    },
    formation:
      "None of it was luck. Every screen up there is the sum of what I studied, practised and rebuilt until it held — the training that turns a blank file into a system, and a system into something worth shipping.",
    skills: {
      heading: "Skills & Experience",
      description:
        "These are the tools, languages, and systems I use in my day-to-day work, along with the experiences that have shaped how I approach it.",
    },
    contact: {
      heading: "Get in touch",
      description:
        "I'm open to working on innovative and ambitious projects with meaningful impact.",
    },
    theme: {
      light: "Switch to light theme",
      dark: "Switch to dark theme",
    },
    visuals: {
      aiLabel:
        "Claude Code, Codex and Cursor feeding into one pair of hands, and one result out the far side",
      education: [
        "University",
        "App Flows",
        "C1 Cambridge",
        "Hackathons",
        "Courses",
        "Side Projects",
        "Sales",
        "Customer Support",
      ],
    },
    footer: "Designed and built in the open.",
    componentShowcase: {
      versionLabel: "Component version",
      preview: "Preview",
      usage: "Usage",
      dependencies: "Dependencies",
      dependencyDescription: (name: string) =>
        `${name} imports these from the project. Copy them across too if you have no equivalent.`,
      copy: "Copy",
      copied: "Copied",
    },
  },
  es: {
    nav: {
      about: "Sobre mí",
      work: "Proyectos",
      skills: "Habilidades",
      contact: "Contactame",
      mainLabel: "Navegación principal",
      menuLabel: "Abrir o cerrar el menú",
      languageLabel: "View site in English",
    },
    hero: {
      welcome: "Bienvenido a mi sitio personal",
      contact: "Contactame",
      work: "Proyectos destacados",
      productPrefix: "",
      productSuffix: " de productos",
      rotatingWords: ["Diseñador", "Estratega", "Creador"],
      rotatingLabel: "Diseñador, estratega y creador",
    },
    about: {
      intro: "Soy Matias Monzalvo",
      description:
        "Soy un design engineer de 22 años que vive en Buenos Aires. Convierto problemas complejos en productos digitales claros y útiles: avanzo desde la estrategia inicial hasta los detalles del lanzamiento y construyo los sistemas que mantienen cada experiencia coherente a medida que crece.\nEsta es la herramienta con la que trabajo todos los días.",
      facts: [
        { value: "6 años", label: "Diseñando productos" },
        { value: "40+", label: "Funcionalidades lanzadas" },
        { value: "Vivo en", label: "Buenos Aires, Argentina" },
      ],
    },
    work: {
      heading: "Proyectos destacados",
      description: (count: number) =>
        `Apps, sitios, productos y los sistemas que los sostienen: +${count} proyectos desarrollados de principio a fin.`,
      imageAlt: (title: string) => `Captura de pantalla de ${title}`,
    },
    formation:
      "Nada fue cuestión de suerte. Cada pantalla que viste es el resultado de lo que estudié, practiqué y reconstruí hasta que funcionó: la formación que transforma un archivo en blanco en un sistema, y un sistema en algo que vale la pena lanzar.",
    skills: {
      heading: "Habilidades y experiencia",
      description:
        "Estas son las herramientas, los lenguajes y los sistemas que uso en mi trabajo diario, junto con las experiencias que definieron mi manera de abordar cada proyecto.",
    },
    contact: {
      heading: "Contactame",
      description:
        "Estoy abierto a trabajar en proyectos innovadores y ambiciosos que generen un impacto significativo.",
    },
    theme: {
      light: "Cambiar al tema claro",
      dark: "Cambiar al tema oscuro",
    },
    visuals: {
      aiLabel:
        "Claude Code, Codex y Cursor aportan a un mismo proceso de trabajo que produce un único resultado",
      education: [
        "Universidad",
        "Flujos de apps",
        "Cambridge C1",
        "Hackatones",
        "Cursos",
        "Proyectos propios",
        "Ventas",
        "Atención al cliente",
      ],
    },
    footer: "Diseñado y desarrollado de manera abierta.",
    componentShowcase: {
      versionLabel: "Versión del componente",
      preview: "Vista previa",
      usage: "Uso",
      dependencies: "Dependencias",
      dependencyDescription: (name: string) =>
        `${name} importa estos archivos del proyecto. Copialos también si no tenés un equivalente.`,
      copy: "Copiar",
      copied: "Copiado",
    },
  },
} as const;
