"use strict";

import { renderPreview } from "./preview.js";

const STORAGE_KEY = "xmg-upcoming-events-generator-v1";
const MAX_EVENTS = 20;
const BASE_PAGE_TEMPLATE = "<style>\n@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');\n\n/* Hide Squarespace header on this page */\n#header {\n    display: none !important;\n}\n\n/* Hide footer */\n#footer-sections {\n    display: none !important;\n}\n\n/* Make the page full screen */\n#page {\n    padding: 0 !important;\n    margin: 0 !important;\n}\n\n.page-section {\n    padding: 0 !important;\n    min-height: 100vh !important;\n}\n\n:root {\n    --primary: #0099ff;\n    --secondary: #00ffff;\n    --darker: #000000;\n    --light: #ffffff;\n    --top-ui-height: 48px;\n}\n\n* {\n    font-family: 'Rajdhani', sans-serif;\n}\n\n#homepage-container h1,\n#homepage-container h2,\n#homepage-container h3,\n.tagline {\n    font-family: 'Rajdhani', sans-serif !important;\n}\n\n.tagline {\n    font-weight: 900 !important;\n}\n\n#threejs-bg {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 0;\n    background: #000000;\n    pointer-events: none;\n}\n\nbody {\n    overflow: hidden !important;\n    height: 100vh;\n}\n\n/* Navigation Dropdown */\n.nav-dropdown {\n    position: fixed;\n    top: 18px;\n    left: 18px;\n    z-index: 10000;\n}\n\n.nav-toggle {\n    background: rgba(26, 26, 26, 0.9);\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    border-radius: 12px;\n    height: 48px;\n    width: 52px;\n    padding: 0 14px;\n    color: #ffffff;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: all 0.3s ease;\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.nav-toggle:hover {\n    background: rgba(36, 36, 36, 0.9);\n    border-color: var(--primary);\n}\n\n.nav-toggle-icon {\n    position: relative;\n    width: 18px;\n    height: 2px;\n    background: currentColor;\n    border-radius: 2px;\n    transition: 0.3s;\n}\n\n.nav-toggle-icon::before,\n.nav-toggle-icon::after {\n    content: \"\";\n    position: absolute;\n    width: 18px;\n    height: 2px;\n    background: currentColor;\n    left: 0;\n    border-radius: 2px;\n    transition: 0.3s;\n}\n\n.nav-toggle-icon::before { top: -6px; }\n.nav-toggle-icon::after  { top:  6px; }\n.nav-dropdown.active .nav-toggle-icon { background: transparent; }\n.nav-dropdown.active .nav-toggle-icon::before { top: 0; transform: rotate(45deg); }\n.nav-dropdown.active .nav-toggle-icon::after  { top: 0; transform: rotate(-45deg); }\n\n.nav-menu {\n    position: absolute;\n    top: 60px;\n    left: 0;\n    background: rgba(26, 26, 26, 0.95);\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    border-radius: 12px;\n    overflow: hidden;\n    padding: 8px;\n    min-width: 200px;\n    opacity: 0;\n    visibility: hidden;\n    transform: translateY(-10px);\n    transition: all 0.3s ease;\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.nav-dropdown.active .nav-menu {\n    opacity: 1;\n    visibility: visible;\n    transform: translateY(0);\n}\n\n.nav-menu a {\n    display: block;\n    text-align: left;\n    padding: 12px 16px;\n    color: rgba(255, 255, 255, 0.8);\n    text-decoration: none;\n    font-size: 15px;\n    font-weight: 600;\n    border-radius: 8px;\n    transition: all 0.3s ease;\n}\n\n.nav-menu a:hover {\n    background: rgba(0, 153, 255, 0.12);\n    color: var(--primary);\n}\n\n/* Squarespace resets */\n#page,\n.page-section,\n.content-wrapper,\n.sqs-block,\n.sqs-block-content {\n    padding: 0 !important;\n    margin: 0 !important;\n}\n\n#homepage-container {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100vh;\n    background: rgba(0, 0, 0, 0.55);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: flex-start;\n    padding: 20px 24px 30px;\n    box-sizing: border-box;\n    overflow: hidden;\n    z-index: 10;\n}\n\n/* Page Logo */\n.page-logo {\n    height: var(--top-ui-height);\n    width: auto;\n    max-width: 85vw;\n    display: block;\n    margin: 10px 0 8px 0;\n    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.18));\n}\n\n/* Tagline */\n.tagline {\n    color: #ffffff;\n    font-size: 72px;\n    font-weight: 900;\n    text-align: center;\n    margin: 0 0 10px 0;\n    letter-spacing: 2px;\n    text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);\n}\n\n/* Subtitle */\n.subtitle {\n    color: rgba(255, 255, 255, 0.7);\n    font-size: 18px;\n    font-weight: 500;\n    text-align: center;\n    margin: 0 0 20px 0;\n    letter-spacing: 1px;\n}\n\n/* ── Events Grid — single row, all 5 cards ── */\n.events-grid {\n    width: 100%;\n    max-width: 1600px;\n    display: flex;\n    gap: 18px;\n    margin-bottom: 20px;\n    justify-content: center;\n    flex-wrap: nowrap;           /* single horizontal row */\n}\n\n/* ── Event Card — fluid, equal-width ── */\n.event-card {\n    flex: 1 1 0;                 /* share available width equally */\n    min-width: 0;                /* allow shrinking below content size */\n    background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 16px;\n    overflow: hidden;\n    position: relative;\n    text-decoration: none;\n    color: #ffffff;\n    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n    backdrop-filter: blur(10px);\n    display: flex;\n    flex-direction: column;\n}\n\n.event-card::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: -100%;\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(90deg, transparent 0%, rgba(0, 153, 255, 0.1) 50%, transparent 100%);\n    transition: left 0.6s ease;\n    z-index: 1;\n}\n\n.event-card:hover::before {\n    left: 100%;\n}\n\n.event-card-bg {\n    position: absolute;\n    top: 0; left: 0; right: 0; bottom: 0;\n    background: linear-gradient(135deg, #0099ff 0%, #00ffff 100%);\n    opacity: 0;\n    transition: opacity 0.4s ease;\n}\n\n.event-card:hover .event-card-bg {\n    opacity: 0.1;\n}\n\n.event-card:hover {\n    border-color: #0099ff;\n    transform: translateY(-6px);\n    box-shadow: 0 12px 32px rgba(0, 153, 255, 0.3), inset 0 1px 0 rgba(0, 153, 255, 0.5);\n}\n\n/* Flyer thumbnail */\n.event-flyer {\n    aspect-ratio: 1 / 1;\n    overflow: hidden;\n    position: relative;\n    z-index: 2;\n    border-radius: 10px;\n    margin: 8px;\n    width: calc(100% - 16px);\n}\n\n.event-flyer img {\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    transition: transform 0.4s ease;\n}\n\n.event-card:hover .event-flyer img {\n    transform: scale(1.05);\n}\n\n/* Event content */\n.event-content {\n    padding: 8px 12px 28px 12px;   /* extra bottom padding clears the arrow */\n    position: relative;\n    z-index: 2;\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n}\n\n.event-title {\n    font-size: clamp(13px, 1.3vw, 20px);\n    font-weight: 700;\n    margin: 0 0 3px 0;\n    color: #ffffff;\n    line-height: 1.2;\n    /* clamp to 2 lines */\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n}\n\n.event-venue {\n    font-size: clamp(11px, 1.05vw, 15px);\n    font-weight: 700;\n    color: rgba(255, 255, 255, 0.65);\n    margin: 0 0 4px 0;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n.event-description {\n    font-size: clamp(11px, 1vw, 14px);\n    color: rgba(255, 255, 255, 0.6);\n    line-height: 1.4;\n    margin: 0 0 6px 0;\n    flex: 1;\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n}\n\n.event-date {\n    font-size: clamp(10px, 0.95vw, 13px);\n    color: #0099ff;\n    font-weight: 600;\n    text-transform: uppercase;\n    letter-spacing: 0.4px;\n}\n\n.event-arrow {\n    position: absolute;\n    bottom: 8px;\n    right: 10px;\n    width: 22px;\n    height: 22px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: rgba(0, 153, 255, 0.1);\n    border-radius: 50%;\n    transition: all 0.3s ease;\n}\n\n.event-card:hover .event-arrow {\n    background: rgba(0, 153, 255, 0.2);\n    transform: translateX(3px);\n}\n\n.event-arrow-icon {\n    width: 13px;\n    height: 13px;\n    color: #0099ff;\n}\n\n.event-card-shine {\n    position: absolute;\n    top: 0; left: -100%;\n    width: 100%; height: 100%;\n    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);\n    z-index: 3;\n    pointer-events: none;\n}\n\n.event-card:hover .event-card-shine {\n    animation: cardShine 1.2s ease;\n}\n\n@keyframes cardShine {\n    0%   { left: -100%; }\n    100% { left: 100%;  }\n}\n\n/* Social Media Icons */\n.social-container {\n    margin-top: 0;\n    display: flex;\n    gap: 2rem;\n    justify-content: center;\n    align-items: center;\n}\n\n.social-icon {\n    color: rgba(255, 255, 255, 0.5);\n    transition: all 0.3s ease;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.social-icon:hover {\n    color: var(--primary);\n    transform: translateY(-3px);\n}\n\n/* ── Short desktop screens (e.g. 1366×768) ── */\n@media (max-height: 800px) {\n    #homepage-container {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch;\n        padding: 12px 20px 20px;\n    }\n    .page-logo  { margin: 4px 0 4px 0; }\n    .tagline    { font-size: 48px; margin: 0 0 6px 0; }\n    .subtitle   { margin: 0 0 14px 0; font-size: 15px; }\n    .events-grid { gap: 10px; margin-bottom: 14px; }\n    .social-container { gap: 1.5rem; }\n}\n\n/* ── Tablet: wrap to 2–3 columns ── */\n@media (max-width: 900px) {\n    .events-grid {\n        flex-wrap: wrap;\n        gap: 18px;\n    }\n    .event-card {\n        flex: 1 1 calc(50% - 18px);\n        min-width: 180px;\n        max-width: 300px;\n    }\n    .event-content { padding: 10px 16px 28px 16px; }\n    .event-title   { font-size: 16px; }\n    .event-venue   { font-size: 12px; }\n    .event-description { font-size: 12px; }\n    .event-date    { font-size: 11px; }\n}\n\n/* ── Mobile: single column ── */\n@media (max-width: 768px) {\n    #homepage-container {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch;\n        padding: 15px 20px 30px;\n    }\n    :root { --top-ui-height: 44px; }\n    .page-logo { margin: 8px 0 6px 0; }\n    .tagline   { font-size: 48px; margin: 0 0 8px 0; }\n    .subtitle  { font-size: 16px; margin-bottom: 20px; }\n\n    .events-grid {\n        flex-direction: column;\n        align-items: center;\n        flex-wrap: wrap;\n        gap: 20px;\n        margin-bottom: 20px;\n    }\n    .event-card {\n        flex: none;\n        width: 100%;\n        max-width: 320px;\n    }\n    .event-content     { padding: 12px 18px 32px 18px; }\n    .event-title       { font-size: 20px; -webkit-line-clamp: unset; }\n    .event-venue       { font-size: 13px; }\n    .event-description { font-size: 13px; -webkit-line-clamp: unset; }\n    .event-date        { font-size: 12px; }\n    .event-arrow       { bottom: 16px; right: 16px; width: 28px; height: 28px; }\n    .event-arrow-icon  { width: 16px; height: 16px; }\n\n    .social-container  { gap: 1.5rem; }\n    .social-icon svg   { width: 28px; height: 28px; }\n}\n\n@media (max-width: 480px) {\n    :root { --top-ui-height: 42px; }\n    .page-logo { margin: 6px 0 6px 0; }\n    .tagline   { font-size: 36px; margin: 0 0 6px 0; }\n    .subtitle  { font-size: 14px; margin-bottom: 15px; }\n    .event-card { max-width: 280px; }\n}\n\n\n/* Generator compatibility additions */\n#homepage-container { overflow-y: auto !important; overflow-x: hidden !important; }\n.event-card { cursor: default; }\n.events-grid.events-grid-many { flex-wrap: wrap; }\n.events-grid.events-grid-many .event-card {\n    flex: 1 1 calc(20% - 18px);\n    min-width: 220px;\n    max-width: 300px;\n}\n.events-empty {\n    width: 100%;\n    padding: 40px 24px;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 16px;\n    color: rgba(255, 255, 255, 0.65);\n    text-align: center;\n    font-size: 18px;\n    font-weight: 600;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    background: rgba(26, 26, 26, 0.72);\n}\n\n</style>\n\n<!-- Three.js Particle Background -->\n<canvas id=\"threejs-bg\"></canvas>\n\n<div id=\"homepage-container\">\n \n <!-- Navigation Dropdown -->\n <div class=\"nav-dropdown\" id=\"navDropdown\">\n  <button class=\"nav-toggle\" id=\"navToggle\" type=\"button\" aria-label=\"Menu\">\n   <span class=\"nav-toggle-icon\" aria-hidden=\"true\"></span>\n  </button>\n  <div class=\"nav-menu\" role=\"menu\" aria-label=\"Site navigation\">\n   <a href=\"https://www.xodiamediagroup.com/\" target=\"_top\" rel=\"noopener\">Home</a>\n   <a href=\"https://www.xodiamediagroup.com/upcoming-events\" target=\"_top\" rel=\"noopener\">Upcoming Events</a>\n   <a href=\"https://www.xodiamediagroup.com/contact\" target=\"_top\" rel=\"noopener\">Contact Us</a>\n   <a href=\"https://www.xodiamediagroup.com/tools\" target=\"_top\" rel=\"noopener\">Tools</a>\n  </div>\n </div>\n \n <!-- Tagline -->\n <img class=\"page-logo\" src=\"https://images.squarespace-cdn.com/content/v1/681ea18dd168a935c26295bd/c311da3d-6fbf-446a-858c-227fa011e7e3/Xodia+MEDIA+Group+%28TRANS%29+%281%29+%281%29.png?format=750w\" alt=\"Xodia MEDIA Group\" loading=\"eager\" />\n <h1 class=\"tagline\">UPCOMING EVENTS</h1>\n <p class=\"subtitle\">Check out our upcoming shows and grab your tickets now</p>\n \n <!-- Events Grid -->\n <div class=\"events-grid __XMG_GRID_CLASS__\">\n__XMG_EVENT_CARDS__\n\n</div>\n \n <!-- Social Media Icons -->\n <div class=\"social-container\">\n  <a class=\"social-icon\" href=\"https://instagram.com/xodiamg\" rel=\"noopener noreferrer\" target=\"_blank\">\n   <svg fill=\"none\" height=\"35\" viewBox=\"0 0 60 60\" width=\"35\" xmlns=\"http://www.w3.org/2000/svg\">\n    <rect height=\"44\" rx=\"12\" stroke=\"currentColor\" stroke-width=\"3\" width=\"44\" x=\"8\" y=\"8\"></rect>\n    <circle cx=\"30\" cy=\"30\" r=\"10\" stroke=\"currentColor\" stroke-width=\"3\"></circle>\n    <circle cx=\"43\" cy=\"17\" fill=\"currentColor\" r=\"2.5\"></circle>\n   </svg>\n  </a>\n  <a class=\"social-icon\" href=\"https://facebook.com/xodiamg\" rel=\"noopener noreferrer\" target=\"_blank\">\n   <svg fill=\"none\" height=\"35\" viewBox=\"0 0 60 60\" width=\"35\" xmlns=\"http://www.w3.org/2000/svg\">\n    <circle cx=\"30\" cy=\"30\" r=\"22\" stroke=\"currentColor\" stroke-width=\"3\"></circle>\n    <path d=\"M33 52V32H38L39 25H33V21C33 19 33.5 18 36 18H39V12C38 12 35.5 11.5 33 11.5C28 11.5 25 14 25 20V25H20V32H25V52H33Z\" fill=\"currentColor\"></path>\n   </svg>\n  </a>\n </div>\n</div>\n\n<script>\nconst navDropdown = document.getElementById('navDropdown');\nconst navToggle = document.getElementById('navToggle');\n\nnavToggle.addEventListener('click', function(e) {\n    e.stopPropagation();\n    navDropdown.classList.toggle('active');\n});\n\ndocument.addEventListener('click', function(e) {\n    if (!navDropdown.contains(e.target)) {\n        navDropdown.classList.remove('active');\n    }\n});\n\ndocument.addEventListener('keydown', function(e) {\n    if (e.key === 'Escape') navDropdown.classList.remove('active');\n});\n\ndocument.querySelectorAll('.nav-menu a').forEach(link => {\n    link.addEventListener('click', function() {\n        navDropdown.classList.remove('active');\n    });\n});\n</script>\n\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"></script>\n<script>\n(function () {\n    const canvas = document.getElementById('threejs-bg');\n    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });\n    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));\n    renderer.setSize(window.innerWidth, window.innerHeight);\n    renderer.setClearColor(0x000000, 1);\n\n    const scene = new THREE.Scene();\n    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);\n    camera.position.z = 500;\n\n    const PARTICLE_COUNT = 3500;\n    const positions = new Float32Array(PARTICLE_COUNT * 3);\n    const colors    = new Float32Array(PARTICLE_COUNT * 3);\n    const speeds    = new Float32Array(PARTICLE_COUNT);\n\n    const colorPalette = [\n        new THREE.Color(0x0099ff),\n        new THREE.Color(0x00ffff),\n        new THREE.Color(0xffffff),\n        new THREE.Color(0x66ccff),\n    ];\n\n    for (let i = 0; i < PARTICLE_COUNT; i++) {\n        positions[i * 3]     = (Math.random() - 0.5) * 2000;\n        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;\n        positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;\n\n        const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];\n        // White particles are dimmer; colored ones brighter\n        const brightness = c.equals(colorPalette[2]) ? 0.9 + Math.random() * 0.1 : 1.0;\n        colors[i * 3]     = c.r * brightness;\n        colors[i * 3 + 1] = c.g * brightness;\n        colors[i * 3 + 2] = c.b * brightness;\n\n        speeds[i] = 0.08 + Math.random() * 0.18;\n    }\n\n    const geometry = new THREE.BufferGeometry();\n    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));\n    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));\n\n    // Create a circular (sphere-like) canvas texture for particles\n    const spriteCanvas = document.createElement('canvas');\n    spriteCanvas.width = 64;\n    spriteCanvas.height = 64;\n    const ctx = spriteCanvas.getContext('2d');\n    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);\n    gradient.addColorStop(0,   'rgba(255,255,255,1)');\n    gradient.addColorStop(0.4, 'rgba(255,255,255,0.9)');\n    gradient.addColorStop(0.7, 'rgba(255,255,255,0.4)');\n    gradient.addColorStop(1,   'rgba(255,255,255,0)');\n    ctx.fillStyle = gradient;\n    ctx.beginPath();\n    ctx.arc(32, 32, 32, 0, Math.PI * 2);\n    ctx.fill();\n    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);\n\n    const material = new THREE.PointsMaterial({\n        size: 3.5,\n        vertexColors: true,\n        transparent: true,\n        opacity: 1.0,\n        sizeAttenuation: true,\n        depthWrite: false,\n        map: spriteTexture,\n        alphaTest: 0.01,\n    });\n\n    const particles = new THREE.Points(geometry, material);\n    scene.add(particles);\n\n    let mouseX = 0, mouseY = 0;\n    document.addEventListener('mousemove', (e) => {\n        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;\n        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;\n    });\n\n    window.addEventListener('resize', () => {\n        camera.aspect = window.innerWidth / window.innerHeight;\n        camera.updateProjectionMatrix();\n        renderer.setSize(window.innerWidth, window.innerHeight);\n    });\n\n    const pos = geometry.attributes.position.array;\n    let time = 0;\n\n    function animate() {\n        requestAnimationFrame(animate);\n        time += 0.001;\n\n        for (let i = 0; i < PARTICLE_COUNT; i++) {\n            pos[i * 3 + 1] += speeds[i];\n            pos[i * 3] += Math.sin(time + i * 0.5) * 0.04;\n            if (pos[i * 3 + 1] > 1000) pos[i * 3 + 1] = -1000;\n        }\n        geometry.attributes.position.needsUpdate = true;\n\n        camera.position.x += (mouseX * 40 - camera.position.x) * 0.03;\n        camera.position.y += (-mouseY * 40 - camera.position.y) * 0.03;\n\n        particles.rotation.y = time * 0.05;\n\n        renderer.render(scene, camera);\n    }\n\n    animate();\n})();\n</script>\n<script>\n(function () {\n    function easternDateKey() {\n        const parts = new Intl.DateTimeFormat('en-US', {\n            timeZone: 'America/New_York',\n            year: 'numeric',\n            month: '2-digit',\n            day: '2-digit'\n        }).formatToParts(new Date());\n        const values = {};\n        parts.forEach(function (part) {\n            if (part.type !== 'literal') values[part.type] = part.value;\n        });\n        return values.year + '-' + values.month + '-' + values.day;\n    }\n\n    const grid = document.querySelector('.events-grid');\n    if (!grid) return;\n\n    const today = easternDateKey();\n    const cards = Array.from(grid.querySelectorAll('.event-card'));\n    cards\n        .filter(function (card) { return (card.dataset.eventDate || '') < today; })\n        .forEach(function (card) { card.remove(); });\n\n    Array.from(grid.querySelectorAll('.event-card'))\n        .sort(function (a, b) {\n            return (a.dataset.eventDate || '').localeCompare(b.dataset.eventDate || '');\n        })\n        .forEach(function (card) { grid.appendChild(card); });\n\n    if (!grid.querySelector('.event-card')) {\n        grid.innerHTML = '<div class=\"events-empty\">No upcoming events are currently scheduled.</div>';\n    }\n})();\n</script>\n";

const REFERENCE_EVENTS = [
  {
    title: "Open Decks",
    venue: "Skully's Music Diner",
    description: "XODIA Media Group's open decks night!",
    date: "2026-08-01",
    flyer: "https://images.squarespace-cdn.com/content/v1/681ea18dd168a935c26295bd/e468c405-d0c2-4cfc-a269-71c257f0bab9/Square.jpg?format=500w",
    url: "/opendecks"
  },
  {
    title: "SPACE CAMP: STVSH w/ BROWNEE",
    venue: "Skully's Music Diner",
    description: "Get ready to groove to all your favorite hits from the 2000s!",
    date: "2026-08-28",
    flyer: "https://images.squarespace-cdn.com/content/v1/681ea18dd168a935c26295bd/ea6c3dbf-6f7b-489b-8d62-b1ef598777d9/STVSH+2026+%5Bsquare%5D.jpg?format=500w",
    url: "/stvsh"
  },
  {
    title: "SPACE CAMP: FREAKY",
    venue: "Skully's Music Diner",
    description: "FREAKY returns to Columbus with his RESURRECTION Tour on October 3rd!",
    date: "2026-10-03",
    flyer: "https://images.squarespace-cdn.com/content/v1/681ea18dd168a935c26295bd/12bcf334-737c-4772-b93f-3757852c6ca4/Freaky+-++Res+Tour+Admat+SQUARE.jpg?format=500w",
    url: "/freaky"
  }
];

const LEGACY_EVENT_URLS = {
  "Open Decks": "/opendecks",
  "SPACE CAMP: STVSH w/ BROWNEE": "/stvsh",
  "SPACE CAMP: FREAKY": "/freaky"
};

const eventCountInput = document.getElementById("eventCount");
const eventEditors = document.getElementById("eventEditors");
const copyCodeButton = document.getElementById("copyCodeButton");
const savePageButton = document.getElementById("savePageButton");
const saveIndicator = document.getElementById("saveIndicator");
const pageStatus = document.getElementById("pageStatus");

let events = loadEvents();
let generatedCode = "";
let updateTimer = 0;

function cloneEvent(event = {}) {
  return {
    title: String(event.title || ""),
    venue: String(event.venue || ""),
    description: String(event.description || ""),
    date: String(event.date || ""),
    flyer: String(event.flyer || ""),
    url: String(event.url || event.href || LEGACY_EVENT_URLS[String(event.title || "")] || "")
  };
}

function loadEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved.slice(0, MAX_EVENTS).map(cloneEvent);
    }
  } catch (error) {
    console.warn("Saved event data could not be loaded.", error);
  }
  return REFERENCE_EVENTS.map(cloneEvent);
}

function saveEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn("Event data could not be saved.", error);
  }
}

function clampCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(MAX_EVENTS, parsed));
}

function easternTodayKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = {};
  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });
  return `${values.year}-${values.month}-${values.day}`;
}

function formatEventDate(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateValue));
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date).toUpperCase();
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEventHref(value) {
  const href = String(value || "").trim();
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#")) return true;
  return isValidHttpUrl(href);
}

function eventIsComplete(event) {
  return Boolean(
    event.title.trim() &&
    event.venue.trim() &&
    event.description.trim() &&
    event.date &&
    event.flyer.trim() &&
    isValidHttpUrl(event.flyer.trim()) &&
    event.url.trim() &&
    isValidEventHref(event.url.trim())
  );
}

function eventIsPast(event) {
  return Boolean(event.date && event.date < easternTodayKey());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function editorMarkup(event, index) {
  const formattedDate = formatEventDate(event.date);
  return `
    <section class="event-editor" data-index="${index}">
      <div class="event-editor-header">
        <h2>Event ${index + 1}</h2>
        <span class="event-state">Incomplete</span>
      </div>

      <div class="field-group">
        <label for="event-title-${index}">Title of Event</label>
        <input id="event-title-${index}" data-field="title" type="text" value="${escapeHtml(event.title)}" placeholder="SPACE CAMP: ARTIST NAME" />
      </div>

      <div class="field-group">
        <label for="event-venue-${index}">Venue</label>
        <input id="event-venue-${index}" data-field="venue" type="text" value="${escapeHtml(event.venue)}" placeholder="Skully's Music Diner" />
      </div>

      <div class="field-group">
        <label for="event-description-${index}">Description</label>
        <textarea id="event-description-${index}" data-field="description" placeholder="Enter a short event description...">${escapeHtml(event.description)}</textarea>
      </div>

      <div class="field-group">
        <label for="event-date-${index}">Date</label>
        <div class="date-input-wrap">
          <input id="event-date-${index}" data-field="date" type="date" value="${escapeHtml(event.date)}" aria-label="Event ${index + 1} date" />
        </div>
        <div class="date-preview">${escapeHtml(formattedDate)}</div>
      </div>

      <div class="field-group">
        <label for="event-flyer-${index}">Flyer Link (Square Only)</label>
        <input id="event-flyer-${index}" data-field="flyer" type="url" value="${escapeHtml(event.flyer)}" placeholder="https://.../square-flyer.jpg" />
      </div>

      <div class="field-group">
        <label for="event-url-${index}">Event Page URL</label>
        <input id="event-url-${index}" data-field="url" type="text" inputmode="url" autocomplete="url" value="${escapeHtml(event.url)}" placeholder="/event-page or https://..." />
      </div>
    </section>`;
}

function renderEditors() {
  eventCountInput.value = String(events.length);
  eventEditors.innerHTML = events.map(editorMarkup).join("");
  eventEditors.querySelectorAll(".event-editor").forEach(updateEditorState);
}

function updateEditorState(editor) {
  const index = Number(editor.dataset.index);
  const event = events[index];
  const state = editor.querySelector(".event-state");
  const datePreview = editor.querySelector(".date-preview");

  editor.classList.remove("is-past");
  datePreview.textContent = formatEventDate(event.date);

  if (eventIsPast(event)) {
    editor.classList.add("is-past");
    state.textContent = "Past — Excluded";
  } else if (eventIsComplete(event)) {
    state.textContent = "";
  } else {
    state.textContent = "Incomplete";
  }
}

function resizeEventList(nextCount) {
  const count = clampCount(nextCount);
  if (count > events.length) {
    while (events.length < count) events.push(cloneEvent());
  } else if (count < events.length) {
    events = events.slice(0, count);
  }
  saveEvents();
  renderEditors();
  markUnsaved();
  updateGeneratedPage();
}

function usableEvents() {
  return events
    .map((event, originalIndex) => ({ ...cloneEvent(event), originalIndex }))
    .filter((event) => eventIsComplete(event) && !eventIsPast(event))
    .sort((a, b) => a.date.localeCompare(b.date) || a.originalIndex - b.originalIndex);
}

function eventCardMarkup(event) {
  const title = escapeHtml(event.title.trim());
  const venue = escapeHtml(event.venue.trim());
  const description = escapeHtml(event.description.trim());
  const date = escapeHtml(formatEventDate(event.date));
  const flyer = escapeHtml(event.flyer.trim());
  const href = escapeHtml(event.url.trim());
  const dateKey = escapeHtml(event.date);

  return `
  <a class="event-card" href="${href}" data-event-date="${dateKey}">
   <div class="event-card-bg"></div>
   <div class="event-flyer">
    <img src="${flyer}" alt="${title} flyer" />
   </div>
   <div class="event-content">
    <h3 class="event-title">${title}</h3>
    <p class="event-venue">${venue}</p>
    <p class="event-description">${description}</p>
    <div class="event-date">${date}</div>
    <div class="event-arrow" aria-hidden="true">
     <svg class="event-arrow-icon" focusable="false" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
     </svg>
    </div>
   </div>
   <div class="event-card-shine"></div>
  </a>`;
}

function buildGeneratedPage(validEvents) {
  const cards = validEvents.length
    ? validEvents.map(eventCardMarkup).join("\n")
    : '<div class="events-empty">No upcoming events are currently scheduled.</div>';
  const gridClass = validEvents.length > 5 ? "events-grid-many" : "";

  return BASE_PAGE_TEMPLATE
    .replace("__XMG_EVENT_CARDS__", cards)
    .replace("__XMG_GRID_CLASS__", gridClass);
}

function updateStatus(validEvents) {
  const pastCount = events.filter(eventIsPast).length;
  const incompleteCount = events.filter((event) => !eventIsPast(event) && !eventIsComplete(event)).length;
  const excluded = [];
  if (pastCount) excluded.push(`<span class="warning">${pastCount} past</span>`);
  if (incompleteCount) excluded.push(`<span class="warning">${incompleteCount} incomplete</span>`);

  pageStatus.innerHTML = `<strong>${validEvents.length}</strong> upcoming event${validEvents.length === 1 ? "" : "s"} included${excluded.length ? ` · ${excluded.join(" · ")} excluded` : ""}.`;
}

function updateGeneratedPage() {
  window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(() => {
    const validEvents = usableEvents();
    generatedCode = buildGeneratedPage(validEvents);
    renderPreview(generatedCode);
    updateStatus(validEvents);
  }, 80);
}

function handleEditorInput(event) {
  const input = event.target.closest("input[data-field], textarea[data-field]");
  if (!input) return;

  const editor = input.closest(".event-editor");
  const index = Number(editor.dataset.index);
  const field = input.dataset.field;
  events[index][field] = input.value;

  saveEvents();
  updateEditorState(editor);
  markUnsaved();
  updateGeneratedPage();
}

function setSaveIndicator(message, state = "") {
  saveIndicator.textContent = message;
  saveIndicator.className = "save-indicator";
  if (state) saveIndicator.classList.add(`is-${state}`);
}

function markUnsaved() {
  setSaveIndicator("Unsaved changes", "unsaved");
}

function refreshGeneratedPageNow() {
  window.clearTimeout(updateTimer);
  const validEvents = usableEvents();
  generatedCode = buildGeneratedPage(validEvents);
  renderPreview(generatedCode, { force: true });
  updateStatus(validEvents);
  return validEvents;
}

async function saveGeneratedPage() {
  refreshGeneratedPageNow();
  setSaveIndicator("Saving…", "saving");
  savePageButton.disabled = true;

  try {
    const response = await fetch("/api/save-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: events.map(cloneEvent),
        code: generatedCode
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "The server could not save the page.");
    }

    setSaveIndicator("Saved to server", "saved");
    savePageButton.textContent = "Saved";
    savePageButton.classList.add("saved");
    window.setTimeout(() => {
      savePageButton.textContent = "Save";
      savePageButton.classList.remove("saved");
    }, 1400);
  } catch (error) {
    console.error("The page could not be saved to the server.", error);
    setSaveIndicator("Save failed", "error");
  } finally {
    savePageButton.disabled = false;
  }
}

async function copyGeneratedCode() {
  if (!generatedCode) {
    generatedCode = buildGeneratedPage(usableEvents());
  }

  try {
    await navigator.clipboard.writeText(generatedCode);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = generatedCode;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }

  const originalText = copyCodeButton.textContent;
  copyCodeButton.textContent = "COPIED";
  copyCodeButton.classList.add("copied");
  window.setTimeout(() => {
    copyCodeButton.textContent = originalText;
    copyCodeButton.classList.remove("copied");
  }, 1400);
}


eventCountInput.addEventListener("change", () => resizeEventList(eventCountInput.value));
eventEditors.addEventListener("input", handleEditorInput);
eventEditors.addEventListener("change", handleEditorInput);
copyCodeButton.addEventListener("click", copyGeneratedCode);
savePageButton.addEventListener("click", saveGeneratedPage);

renderEditors();
updateGeneratedPage();


export function activateUpcomingEvents() {
  refreshGeneratedPageNow();
}

export function getUpcomingEventsCode() {
  if (!generatedCode) refreshGeneratedPageNow();
  return generatedCode;
}
