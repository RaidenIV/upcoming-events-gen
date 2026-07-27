"use strict";

import { renderPreview } from "./preview.js";

const LAYLO_IMAGE_URL = new URL("../assets/laylo.png", import.meta.url).href;

const STORAGE_KEY = "xmg-upcoming-events-generator-v1";
const CARD_SIZE_STORAGE_KEY = "xmg-upcoming-events-card-size-v1";
const DISPLAY_STORAGE_KEY = "xmg-upcoming-events-display-v1";
const DEFAULT_CARD_SIZE = 100;
const MIN_CARD_SIZE = 60;
const MAX_CARD_SIZE = 140;
const CARD_SIZE_STEP = 5;
const DEFAULT_FLYER_BLUR = 10;
const MIN_FLYER_BLUR = 1;
const MAX_FLYER_BLUR = 20;
const DEFAULT_EVENTS_PER_ROW = 5;
const MIN_EVENTS_PER_ROW = 1;
const MAX_EVENTS_PER_ROW = 6;
const DEFAULT_CAROUSEL_VISIBLE_CARDS = 5;
const MIN_CAROUSEL_VISIBLE_CARDS = 1;
const MAX_CAROUSEL_VISIBLE_CARDS = 6;
const MAX_EVENTS = 20;
const BASE_PAGE_TEMPLATE = "<style>\n@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');\n\n/* Hide Squarespace header on this page */\n#header {\n    display: none !important;\n}\n\n/* Hide footer */\n#footer-sections {\n    display: none !important;\n}\n\n/* Make the page full screen */\n#page {\n    padding: 0 !important;\n    margin: 0 !important;\n}\n\n.page-section {\n    padding: 0 !important;\n    min-height: 100vh !important;\n}\n\n:root {\n    --primary: #0099ff;\n    --secondary: #00ffff;\n    --darker: #000000;\n    --light: #ffffff;\n    --top-ui-height: 48px;\n}\n\n* {\n    font-family: 'Rajdhani', sans-serif;\n}\n\n#homepage-container h1,\n#homepage-container h2,\n#homepage-container h3,\n.tagline {\n    font-family: 'Rajdhani', sans-serif !important;\n}\n\n.tagline {\n    font-weight: 900 !important;\n}\n\n#threejs-bg {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 0;\n    background: #000000;\n    pointer-events: none;\n}\n\nbody {\n    overflow: hidden !important;\n    height: 100vh;\n}\n\n/* Navigation Dropdown */\n.nav-dropdown {\n    position: fixed;\n    top: 18px;\n    left: 18px;\n    z-index: 10000;\n}\n\n.nav-toggle {\n    background: rgba(26, 26, 26, 0.9);\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    border-radius: 12px;\n    height: 48px;\n    width: 52px;\n    padding: 0 14px;\n    color: #ffffff;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: all 0.3s ease;\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.nav-toggle:hover {\n    background: rgba(36, 36, 36, 0.9);\n    border-color: var(--primary);\n}\n\n.nav-toggle-icon {\n    position: relative;\n    width: 18px;\n    height: 2px;\n    background: currentColor;\n    border-radius: 2px;\n    transition: 0.3s;\n}\n\n.nav-toggle-icon::before,\n.nav-toggle-icon::after {\n    content: \"\";\n    position: absolute;\n    width: 18px;\n    height: 2px;\n    background: currentColor;\n    left: 0;\n    border-radius: 2px;\n    transition: 0.3s;\n}\n\n.nav-toggle-icon::before { top: -6px; }\n.nav-toggle-icon::after  { top:  6px; }\n.nav-dropdown.active .nav-toggle-icon { background: transparent; }\n.nav-dropdown.active .nav-toggle-icon::before { top: 0; transform: rotate(45deg); }\n.nav-dropdown.active .nav-toggle-icon::after  { top: 0; transform: rotate(-45deg); }\n\n.nav-menu {\n    position: absolute;\n    top: 60px;\n    left: 0;\n    background: rgba(26, 26, 26, 0.95);\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    border-radius: 12px;\n    overflow: hidden;\n    padding: 8px;\n    min-width: 200px;\n    opacity: 0;\n    visibility: hidden;\n    transform: translateY(-10px);\n    transition: all 0.3s ease;\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.nav-dropdown.active .nav-menu {\n    opacity: 1;\n    visibility: visible;\n    transform: translateY(0);\n}\n\n.nav-menu a {\n    display: block;\n    text-align: left;\n    padding: 12px 16px;\n    color: rgba(255, 255, 255, 0.8);\n    text-decoration: none;\n    font-size: 15px;\n    font-weight: 600;\n    border-radius: 8px;\n    transition: all 0.3s ease;\n}\n\n.nav-menu a:hover {\n    background: rgba(0, 153, 255, 0.12);\n    color: var(--primary);\n}\n\n/* Squarespace resets */\n#page,\n.page-section,\n.content-wrapper,\n.sqs-block,\n.sqs-block-content {\n    padding: 0 !important;\n    margin: 0 !important;\n}\n\n#homepage-container {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100vh;\n    background: rgba(0, 0, 0, 0.55);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: flex-start;\n    padding: 20px 24px 30px;\n    box-sizing: border-box;\n    overflow: hidden;\n    z-index: 10;\n}\n\n/* Page Logo */\n.page-logo {\n    height: var(--top-ui-height);\n    width: auto;\n    max-width: 85vw;\n    display: block;\n    margin: 10px 0 8px 0;\n    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.18));\n}\n\n/* Tagline */\n.tagline {\n    color: #ffffff;\n    font-size: 72px;\n    font-weight: 900;\n    text-align: center;\n    margin: 0 0 10px 0;\n    letter-spacing: 2px;\n    text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);\n}\n\n/* Subtitle */\n.subtitle {\n    color: rgba(255, 255, 255, 0.7);\n    font-size: 18px;\n    font-weight: 500;\n    text-align: center;\n    margin: 0 0 20px 0;\n    letter-spacing: 1px;\n}\n\n/* ── Events Grid — single row, all 5 cards ── */\n.events-grid {\n    width: 100%;\n    max-width: 1600px;\n    display: flex;\n    gap: 18px;\n    margin-bottom: 20px;\n    justify-content: center;\n    align-items: center;\n    flex: 1 0 auto;\n    min-height: 0;\n    flex-wrap: nowrap;           /* single horizontal row */\n}\n\n/* ── Event Card — fluid, equal-width ── */\n.event-card {\n    flex: 1 1 0;                 /* share available width equally */\n    min-width: 0;                /* allow shrinking below content size */\n    background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 16px;\n    overflow: hidden;\n    position: relative;\n    text-decoration: none;\n    color: #ffffff;\n    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n    backdrop-filter: blur(10px);\n    display: flex;\n    flex-direction: column;\n}\n\n.event-card::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: -100%;\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(90deg, transparent 0%, rgba(0, 153, 255, 0.1) 50%, transparent 100%);\n    transition: left 0.6s ease;\n    z-index: 1;\n}\n\n.event-card:hover::before {\n    left: 100%;\n}\n\n.event-card-bg {\n    position: absolute;\n    top: 0; left: 0; right: 0; bottom: 0;\n    background: linear-gradient(135deg, #0099ff 0%, #00ffff 100%);\n    opacity: 0;\n    transition: opacity 0.4s ease;\n}\n\n.event-card:hover .event-card-bg {\n    opacity: 0.1;\n}\n\n.event-card:hover {\n    border-color: #0099ff;\n    transform: translateY(-6px);\n    box-shadow: 0 12px 32px rgba(0, 153, 255, 0.3), inset 0 1px 0 rgba(0, 153, 255, 0.5);\n}\n\n/* Flyer thumbnail */\n.event-flyer {\n    aspect-ratio: 1 / 1;\n    overflow: hidden;\n    position: relative;\n    z-index: 2;\n    border-radius: 10px;\n    margin: 8px;\n    width: calc(100% - 16px);\n}\n\n.event-flyer img {\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    transition: transform 0.4s ease;\n}\n\n.event-card:hover .event-flyer img {\n    transform: scale(1.05);\n}\n\n.event-card.is-mystery .event-flyer img {\n    filter: blur(var(--event-flyer-blur, 10px));\n    transform: scale(1.08);\n}\n\n.event-card.is-mystery:hover .event-flyer img {\n    transform: scale(1.13);\n}\n\n/* Event content */\n.event-content {\n    padding: 8px 12px;\n    position: relative;\n    z-index: 2;\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n}\n\n.event-title {\n    font-size: clamp(13px, 1.3vw, 20px);\n    font-weight: 700;\n    margin: 0 0 3px 0;\n    color: var(--primary);\n    line-height: 1.2;\n    min-height: 2.4em;\n    /* reserve two title lines so venue and description rows align */\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n}\n\n.event-venue {\n    display: flex;\n    align-items: center;\n    gap: 5px;\n    font-size: clamp(11px, 1.05vw, 15px);\n    font-weight: 700;\n    color: rgba(255, 255, 255, 0.65);\n    margin: 0 0 4px 0;\n    line-height: 1.2;\n    min-height: 1.2em;\n    overflow: hidden;\n}\n\n.event-venue-text {\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n\n.event-location-icon {\n    flex: 0 0 auto;\n    width: 14px;\n    height: 14px;\n    color: var(--primary);\n}\n\n.event-description {\n    font-size: clamp(11px, 1vw, 14px);\n    color: rgba(255, 255, 255, 0.6);\n    line-height: 1.4;\n    margin: 0 0 10px 0;\n    flex: 1;\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n}\n\n.event-footer {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 10px;\n    margin-top: auto;\n    min-height: 22px;\n}\n\n.event-date {\n    min-width: 0;\n    font-size: clamp(10px, 0.95vw, 13px);\n    color: #0099ff;\n    font-weight: 600;\n    line-height: 1.2;\n    text-transform: uppercase;\n    letter-spacing: 0.4px;\n}\n\n.event-arrow {\n    position: static;\n    flex: 0 0 auto;\n    width: 22px;\n    height: 22px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: rgba(0, 153, 255, 0.1);\n    border-radius: 50%;\n    transition: all 0.3s ease;\n}\n\n.event-card:hover .event-arrow {\n    background: rgba(0, 153, 255, 0.2);\n    transform: translateX(3px);\n}\n\n.event-arrow-icon {\n    width: 13px;\n    height: 13px;\n    color: #0099ff;\n}\n\n.event-card-shine {\n    position: absolute;\n    top: 0; left: -100%;\n    width: 100%; height: 100%;\n    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);\n    z-index: 3;\n    pointer-events: none;\n}\n\n.event-card:hover .event-card-shine {\n    animation: cardShine 1.2s ease;\n}\n\n@keyframes cardShine {\n    0%   { left: -100%; }\n    100% { left: 100%;  }\n}\n\n/* Laylo updates card */\n.laylo-updates-card {\n    width: clamp(240px, 24vw, 340px);\n    aspect-ratio: 4 / 3;\n    display: block;\n    flex: 0 0 auto;\n    background: rgba(255, 255, 255, 0.04);\n    border: 1px solid rgba(255, 255, 255, 0.08);\n    border-radius: 14px;\n    overflow: hidden;\n    text-decoration: none;\n    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.laylo-updates-card:hover {\n    border-color: var(--secondary);\n    transform: translateY(-4px);\n    box-shadow: 0 12px 40px rgba(0, 229, 255, 0.2);\n}\n\n.laylo-updates-card img {\n    display: block;\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    pointer-events: none;\n}\n\n@media (min-width: 901px) {\n    .laylo-updates-card {\n        position: fixed;\n        top: 18px;\n        right: 18px;\n        z-index: 9999;\n    }\n}\n\n@media (max-width: 900px) {\n    .laylo-updates-card {\n        position: relative;\n        align-self: flex-end;\n        width: min(240px, 60vw);\n        margin: 0 0 14px;\n        z-index: 9999;\n    }\n}\n\n/* Social Media Icons */\n.social-container {\n    margin-top: 0;\n    display: flex;\n    gap: 2rem;\n    justify-content: center;\n    align-items: center;\n}\n\n.social-icon {\n    color: rgba(255, 255, 255, 0.5);\n    transition: all 0.3s ease;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.social-icon:hover {\n    color: var(--primary);\n    transform: translateY(-3px);\n}\n\n/* ── Short desktop screens (e.g. 1366×768) ── */\n@media (max-height: 800px) {\n    #homepage-container {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch;\n        padding: 12px 20px 20px;\n    }\n    .page-logo  { margin: 4px 0 4px 0; }\n    .tagline    { font-size: 48px; margin: 0 0 6px 0; }\n    .subtitle   { margin: 0 0 14px 0; font-size: 15px; }\n    .events-grid { gap: 10px; margin-bottom: 14px; }\n    .social-container { gap: 1.5rem; }\n}\n\n/* ── Tablet: wrap to 2–3 columns ── */\n@media (max-width: 900px) {\n    .events-grid {\n        flex-wrap: wrap;\n        gap: 18px;\n    }\n    .event-card {\n        flex: 1 1 calc(50% - 18px);\n        min-width: __XMG_TABLET_CARD_MIN__px;\n        max-width: __XMG_TABLET_CARD_MAX__px;\n    }\n    .event-content { padding: 10px 16px 28px 16px; }\n    .event-title   { font-size: 16px; }\n    .event-venue   { font-size: 12px; }\n    .event-description { font-size: 12px; }\n    .event-date    { font-size: 11px; }\n}\n\n/* ── Mobile: single column ── */\n@media (max-width: 768px) {\n    #homepage-container {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch;\n        padding: 15px 20px 30px;\n    }\n    :root { --top-ui-height: 44px; }\n    .page-logo { margin: 8px 0 6px 0; }\n    .tagline   { font-size: 48px; margin: 0 0 8px 0; }\n    .subtitle  { font-size: 16px; margin-bottom: 20px; }\n\n    .events-grid {\n        flex-direction: column;\n        align-items: center;\n        flex-wrap: wrap;\n        gap: 20px;\n        margin-bottom: 20px;\n    }\n    .event-card {\n        flex: none;\n        width: 100%;\n        max-width: __XMG_MOBILE_CARD_MAX__px;\n        height: auto !important;\n    }\n    .event-content     { padding: 12px 18px; }\n    .event-title       { font-size: 20px; min-height: 0; display: block; overflow: visible; -webkit-line-clamp: unset; }\n    .event-venue       { font-size: 13px; }\n    .event-description { font-size: 13px; -webkit-line-clamp: unset; }\n    .event-footer      { min-height: 28px; }\n    .event-date        { font-size: 12px; }\n    .event-arrow       { width: 28px; height: 28px; }\n    .event-arrow-icon  { width: 16px; height: 16px; }\n\n    .social-container  { gap: 1.5rem; }\n    .social-icon svg   { width: 28px; height: 28px; }\n}\n\n@media (max-width: 480px) {\n    :root { --top-ui-height: 42px; }\n    .page-logo { margin: 6px 0 6px 0; }\n    .tagline   { font-size: 36px; margin: 0 0 6px 0; }\n    .subtitle  { font-size: 14px; margin-bottom: 15px; }\n    .event-card { max-width: __XMG_SMALL_MOBILE_CARD_MAX__px; }\n}\n\n\n/* Generator compatibility additions */\n#homepage-container { overflow-y: auto !important; overflow-x: hidden !important; }\n.event-card { cursor: default; }\n.events-grid.events-grid-many { flex-wrap: wrap; }\n.events-grid.events-grid-many .event-card {\n    flex: 1 1 calc(20% - 18px);\n    min-width: __XMG_MANY_CARD_MIN__px;\n    max-width: __XMG_MANY_CARD_MAX__px;\n}\n\n\n/* Desktop cards reduced by 20% while preserving the existing typography. */\n@media (min-width: 901px) {\n    .events-grid {\n        max-width: 1800px;\n        flex-wrap: wrap;\n    }\n\n    .event-card,\n    .events-grid.events-grid-many .event-card {\n        flex: 1 1 __XMG_DESKTOP_CARD_BASE__px;\n        min-width: __XMG_DESKTOP_CARD_BASE__px;\n        max-width: __XMG_DESKTOP_CARD_MAX__px;\n    }\n}\n.events-empty {\n    width: 100%;\n    padding: 40px 24px;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 16px;\n    color: rgba(255, 255, 255, 0.65);\n    text-align: center;\n    font-size: 18px;\n    font-weight: 600;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    background: rgba(26, 26, 26, 0.72);\n}\n\n\n/* Configurable event layout */\n.events-shell {\n    --events-per-row: 5;\n    --events-grid-max-width: 1800px;\n    --events-carousel-max-width: 1800px;\n    --carousel-visible-cards: 3;\n    --carousel-card-basis: calc((100% - 36px) / 3);\n    width: 100%;\n    max-width: min(1800px, var(--events-grid-max-width));\n    margin: 0 auto 20px;\n    position: relative;\n    flex: 1 0 auto;\n    min-height: 0;\n}\n\n.events-viewport {\n    width: 100%;\n    min-width: 0;\n    overflow: visible;\n}\n\n.events-shell .events-grid,\n.events-shell .events-grid.events-grid-many {\n    width: 100%;\n    max-width: none;\n    margin: 0;\n    display: grid;\n    grid-template-columns: repeat(var(--events-per-row), minmax(0, 1fr));\n    align-items: stretch;\n    justify-content: center;\n    flex: none;\n    flex-wrap: unset;\n}\n\n.events-shell .event-card,\n.events-shell .events-grid.events-grid-many .event-card {\n    width: 100%;\n    min-width: 0;\n    max-width: __XMG_DESKTOP_CARD_MAX__px;\n    justify-self: center;\n    flex: none;\n}\n\n.events-shell.is-carousel {\n    display: grid;\n    grid-template-columns: 42px minmax(0, 1fr) 42px;\n    align-items: center;\n    gap: 12px;\n    max-width: min(1800px, calc(var(--events-carousel-max-width) + 108px));\n}\n\n.events-shell.is-carousel .events-viewport {\n    overflow-x: auto;\n    overflow-y: hidden;\n    padding: 8px 0 14px;\n    margin: -8px 0 -14px;\n    scroll-behavior: smooth;\n    scroll-snap-type: x mandatory;\n    scroll-padding-inline: 0;\n    overscroll-behavior-inline: contain;\n    scrollbar-width: none;\n    -ms-overflow-style: none;\n}\n\n.events-shell.is-carousel .events-viewport::-webkit-scrollbar {\n    display: none;\n}\n\n.events-shell.is-carousel .events-grid,\n.events-shell.is-carousel .events-grid.events-grid-many {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    align-items: stretch;\n}\n\n.events-shell.is-carousel .event-card,\n.events-shell.is-carousel .events-grid.events-grid-many .event-card {\n    flex: 0 0 var(--carousel-card-basis);\n    width: var(--carousel-card-basis);\n    max-width: none;\n    box-sizing: border-box;\n    scroll-snap-align: start;\n    scroll-snap-stop: always;\n}\n\n.events-nav {\n    width: 42px;\n    height: 42px;\n    padding: 0;\n    border: 1px solid rgba(255, 255, 255, 0.18);\n    border-radius: 50%;\n    background: rgba(26, 26, 26, 0.9);\n    color: #ffffff;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    cursor: pointer;\n    transition: border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n}\n\n.events-nav:hover:not(:disabled),\n.events-nav:focus-visible:not(:disabled) {\n    border-color: var(--primary);\n    background: rgba(0, 153, 255, 0.16);\n}\n\n.events-nav:disabled {\n    opacity: 0.3;\n    cursor: default;\n}\n\n.events-nav svg {\n    width: 20px;\n    height: 20px;\n}\n\n.events-shell:not(.is-carousel) .events-nav {\n    display: none;\n}\n\n.events-shell .events-empty {\n    grid-column: 1 / -1;\n}\n\n@media (max-width: 900px) {\n    .events-shell .events-grid,\n    .events-shell .events-grid.events-grid-many {\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n    }\n\n    .events-shell.is-carousel {\n        --carousel-card-basis: calc((100% - 18px) / 2) !important;\n    }\n}\n\n@media (max-width: 768px) {\n    .events-shell {\n        max-width: __XMG_MOBILE_CARD_MAX__px;\n    }\n\n    .events-shell .events-grid,\n    .events-shell .events-grid.events-grid-many {\n        grid-template-columns: minmax(0, 1fr);\n    }\n\n    .events-shell.is-carousel {\n        --carousel-card-basis: 100% !important;\n        grid-template-columns: 34px minmax(0, 1fr) 34px;\n        gap: 8px;\n        max-width: calc(__XMG_MOBILE_CARD_MAX__px + 84px);\n    }\n\n    .events-shell.is-carousel .events-grid,\n    .events-shell.is-carousel .events-grid.events-grid-many {\n        flex-direction: row;\n        flex-wrap: nowrap;\n        align-items: stretch;\n        gap: 18px;\n    }\n\n    .events-shell.is-carousel .event-card,\n    .events-shell.is-carousel .events-grid.events-grid-many .event-card {\n        width: 100%;\n    }\n\n    .events-nav {\n        width: 34px;\n        height: 34px;\n    }\n}\n\n</style>\n\n<!-- Three.js Particle Background -->\n<canvas id=\"threejs-bg\"></canvas>\n\n<div id=\"homepage-container\">\n \n <!-- Navigation Dropdown -->\n <div class=\"nav-dropdown\" id=\"navDropdown\">\n  <button class=\"nav-toggle\" id=\"navToggle\" type=\"button\" aria-label=\"Menu\">\n   <span class=\"nav-toggle-icon\" aria-hidden=\"true\"></span>\n  </button>\n  <div class=\"nav-menu\" role=\"menu\" aria-label=\"Site navigation\">\n   <a href=\"https://www.xodiamediagroup.com/\" target=\"_top\" rel=\"noopener\">Home</a>\n   <a href=\"https://www.xodiamediagroup.com/upcoming-events\" target=\"_top\" rel=\"noopener\">Upcoming Events</a>\n   <a href=\"https://www.xodiamediagroup.com/contact\" target=\"_top\" rel=\"noopener\">Contact Us</a>\n   <a href=\"https://tools-dashboard-production-1c7c.up.railway.app/\" target=\"_top\" rel=\"noopener\">Tools</a>\n  </div>\n </div>\n\n <!-- Laylo Updates -->\n <a class=\"laylo-updates-card\" href=\"https://laylo.com/xodiamg\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Get XODIA updates on Laylo\">\n  <img src=\"__XMG_LAYLO_IMAGE_URL__\" alt=\"Stay updated — text ACCESS to 858-762-9399\" loading=\"eager\" />\n </a>\n\n <!-- Tagline -->\n <img class=\"page-logo\" src=\"https://images.squarespace-cdn.com/content/v1/681ea18dd168a935c26295bd/c311da3d-6fbf-446a-858c-227fa011e7e3/Xodia+MEDIA+Group+%28TRANS%29+%281%29+%281%29.png?format=750w\" alt=\"Xodia MEDIA Group\" loading=\"eager\" />\n <h1 class=\"tagline\">UPCOMING EVENTS</h1>\n <p class=\"subtitle\">Check out our upcoming shows and grab your tickets now</p>\n \n <!-- Events Grid -->\n <div class=\"events-shell __XMG_DISPLAY_CLASS__\" data-events-per-row=\"__XMG_EVENTS_PER_ROW__\" data-carousel-visible-cards=\"__XMG_CAROUSEL_VISIBLE_CARDS__\" data-single-row-navigation=\"__XMG_SINGLE_ROW_NAVIGATION__\" style=\"--events-per-row: __XMG_EVENTS_PER_ROW__; --carousel-visible-cards: __XMG_CAROUSEL_VISIBLE_CARDS__; --events-grid-max-width: __XMG_GRID_MAX_WIDTH__px; --events-carousel-max-width: __XMG_CAROUSEL_MAX_WIDTH__px; --carousel-card-basis: __XMG_CAROUSEL_CARD_BASIS__;\">\n  <button class=\"events-nav events-nav-prev\" type=\"button\" aria-label=\"Previous events\">\n   <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 24 24\"><path d=\"m15 18-6-6 6-6\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.5\"></path></svg>\n  </button>\n  <div class=\"events-viewport\">\n   <div class=\"events-grid __XMG_GRID_CLASS__\">\n__XMG_EVENT_CARDS__\n\n   </div>\n  </div>\n  <button class=\"events-nav events-nav-next\" type=\"button\" aria-label=\"Next events\">\n   <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 24 24\"><path d=\"m9 18 6-6-6-6\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.5\"></path></svg>\n  </button>\n </div>\n \n <!-- Social Media Icons -->\n <div class=\"social-container\">\n  <a class=\"social-icon\" href=\"https://instagram.com/xodiamg\" rel=\"noopener noreferrer\" target=\"_blank\">\n   <svg fill=\"none\" height=\"35\" viewBox=\"0 0 60 60\" width=\"35\" xmlns=\"http://www.w3.org/2000/svg\">\n    <rect height=\"44\" rx=\"12\" stroke=\"currentColor\" stroke-width=\"3\" width=\"44\" x=\"8\" y=\"8\"></rect>\n    <circle cx=\"30\" cy=\"30\" r=\"10\" stroke=\"currentColor\" stroke-width=\"3\"></circle>\n    <circle cx=\"43\" cy=\"17\" fill=\"currentColor\" r=\"2.5\"></circle>\n   </svg>\n  </a>\n  <a class=\"social-icon\" href=\"https://facebook.com/xodiamg\" rel=\"noopener noreferrer\" target=\"_blank\">\n   <svg fill=\"none\" height=\"35\" viewBox=\"0 0 60 60\" width=\"35\" xmlns=\"http://www.w3.org/2000/svg\">\n    <circle cx=\"30\" cy=\"30\" r=\"22\" stroke=\"currentColor\" stroke-width=\"3\"></circle>\n    <path d=\"M33 52V32H38L39 25H33V21C33 19 33.5 18 36 18H39V12C38 12 35.5 11.5 33 11.5C28 11.5 25 14 25 20V25H20V32H25V52H33Z\" fill=\"currentColor\"></path>\n   </svg>\n  </a>\n </div>\n</div>\n\n<script>\nconst navDropdown = document.getElementById('navDropdown');\nconst navToggle = document.getElementById('navToggle');\n\nnavToggle.addEventListener('click', function(e) {\n    e.stopPropagation();\n    navDropdown.classList.toggle('active');\n});\n\ndocument.addEventListener('click', function(e) {\n    if (!navDropdown.contains(e.target)) {\n        navDropdown.classList.remove('active');\n    }\n});\n\ndocument.addEventListener('keydown', function(e) {\n    if (e.key === 'Escape') navDropdown.classList.remove('active');\n});\n\ndocument.querySelectorAll('.nav-menu a').forEach(link => {\n    link.addEventListener('click', function() {\n        navDropdown.classList.remove('active');\n    });\n});\n</script>\n\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js\"></script>\n<script>\n(function () {\n    const canvas = document.getElementById('threejs-bg');\n    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });\n    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));\n    renderer.setSize(window.innerWidth, window.innerHeight);\n    renderer.setClearColor(0x000000, 1);\n\n    const scene = new THREE.Scene();\n    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);\n    camera.position.z = 500;\n\n    const PARTICLE_COUNT = 3500;\n    const positions = new Float32Array(PARTICLE_COUNT * 3);\n    const colors    = new Float32Array(PARTICLE_COUNT * 3);\n    const speeds    = new Float32Array(PARTICLE_COUNT);\n\n    const colorPalette = [\n        new THREE.Color(0x0099ff),\n        new THREE.Color(0x00ffff),\n        new THREE.Color(0xffffff),\n        new THREE.Color(0x66ccff),\n    ];\n\n    for (let i = 0; i < PARTICLE_COUNT; i++) {\n        positions[i * 3]     = (Math.random() - 0.5) * 2000;\n        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;\n        positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;\n\n        const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];\n        // White particles are dimmer; colored ones brighter\n        const brightness = c.equals(colorPalette[2]) ? 0.9 + Math.random() * 0.1 : 1.0;\n        colors[i * 3]     = c.r * brightness;\n        colors[i * 3 + 1] = c.g * brightness;\n        colors[i * 3 + 2] = c.b * brightness;\n\n        speeds[i] = 0.08 + Math.random() * 0.18;\n    }\n\n    const geometry = new THREE.BufferGeometry();\n    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));\n    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));\n\n    // Create a circular (sphere-like) canvas texture for particles\n    const spriteCanvas = document.createElement('canvas');\n    spriteCanvas.width = 64;\n    spriteCanvas.height = 64;\n    const ctx = spriteCanvas.getContext('2d');\n    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);\n    gradient.addColorStop(0,   'rgba(255,255,255,1)');\n    gradient.addColorStop(0.4, 'rgba(255,255,255,0.9)');\n    gradient.addColorStop(0.7, 'rgba(255,255,255,0.4)');\n    gradient.addColorStop(1,   'rgba(255,255,255,0)');\n    ctx.fillStyle = gradient;\n    ctx.beginPath();\n    ctx.arc(32, 32, 32, 0, Math.PI * 2);\n    ctx.fill();\n    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);\n\n    const material = new THREE.PointsMaterial({\n        size: 3.5,\n        vertexColors: true,\n        transparent: true,\n        opacity: 1.0,\n        sizeAttenuation: true,\n        depthWrite: false,\n        map: spriteTexture,\n        alphaTest: 0.01,\n    });\n\n    const particles = new THREE.Points(geometry, material);\n    scene.add(particles);\n\n    let mouseX = 0, mouseY = 0;\n    document.addEventListener('mousemove', (e) => {\n        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;\n        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;\n    });\n\n    window.addEventListener('resize', () => {\n        camera.aspect = window.innerWidth / window.innerHeight;\n        camera.updateProjectionMatrix();\n        renderer.setSize(window.innerWidth, window.innerHeight);\n    });\n\n    const pos = geometry.attributes.position.array;\n    let time = 0;\n\n    function animate() {\n        requestAnimationFrame(animate);\n        time += 0.001;\n\n        for (let i = 0; i < PARTICLE_COUNT; i++) {\n            pos[i * 3 + 1] += speeds[i];\n            pos[i * 3] += Math.sin(time + i * 0.5) * 0.04;\n            if (pos[i * 3 + 1] > 1000) pos[i * 3 + 1] = -1000;\n        }\n        geometry.attributes.position.needsUpdate = true;\n\n        camera.position.x += (mouseX * 40 - camera.position.x) * 0.03;\n        camera.position.y += (-mouseY * 40 - camera.position.y) * 0.03;\n\n        particles.rotation.y = time * 0.05;\n\n        renderer.render(scene, camera);\n    }\n\n    animate();\n})();\n</script>\n<script>\n(function () {\n    function easternDateKey() {\n        const parts = new Intl.DateTimeFormat('en-US', {\n            timeZone: 'America/New_York',\n            year: 'numeric',\n            month: '2-digit',\n            day: '2-digit'\n        }).formatToParts(new Date());\n        const values = {};\n        parts.forEach(function (part) {\n            if (part.type !== 'literal') values[part.type] = part.value;\n        });\n        return values.year + '-' + values.month + '-' + values.day;\n    }\n\n    const grid = document.querySelector('.events-grid');\n    if (!grid) return;\n\n    const today = easternDateKey();\n    const cards = Array.from(grid.querySelectorAll('.event-card'));\n    cards\n        .filter(function (card) { return (card.dataset.eventDate || '') < today; })\n        .forEach(function (card) { card.remove(); });\n\n    Array.from(grid.querySelectorAll('.event-card'))\n        .sort(function (a, b) {\n            return (a.dataset.eventDate || '').localeCompare(b.dataset.eventDate || '');\n        })\n        .forEach(function (card) { grid.appendChild(card); });\n\n    const shell = grid.closest('.events-shell');\n    const viewport = shell ? shell.querySelector('.events-viewport') : null;\n    const previousButton = shell ? shell.querySelector('.events-nav-prev') : null;\n    const nextButton = shell ? shell.querySelector('.events-nav-next') : null;\n\n    let carouselStartIndex = 0;\n    let navigationFrame = 0;\n\n    function carouselCards() {\n        return Array.from(grid.querySelectorAll('.event-card'));\n    }\n\n    function configuredVisibleCards() {\n        const configured = Number.parseInt(shell?.dataset.carouselVisibleCards || '1', 10);\n        if (window.matchMedia('(max-width: 768px)').matches) return 1;\n        if (window.matchMedia('(max-width: 900px)').matches) return Math.min(2, configured || 1);\n        return Math.max(1, configured || 1);\n    }\n\n    function maximumCarouselStart() {\n        return Math.max(0, carouselCards().length - configuredVisibleCards());\n    }\n\n    function nearestCarouselIndex() {\n        const cards = carouselCards();\n        if (!cards.length || !viewport) return 0;\n        let nearestIndex = 0;\n        let nearestDistance = Infinity;\n        cards.forEach(function (card, index) {\n            const distance = Math.abs(card.offsetLeft - viewport.scrollLeft);\n            if (distance < nearestDistance) {\n                nearestDistance = distance;\n                nearestIndex = index;\n            }\n        });\n        return Math.min(nearestIndex, maximumCarouselStart());\n    }\n\n    function updateNavigationState() {\n        if (!shell || !shell.classList.contains('is-carousel') || !viewport || !previousButton || !nextButton) return;\n        carouselStartIndex = nearestCarouselIndex();\n        previousButton.disabled = carouselStartIndex <= 0;\n        nextButton.disabled = carouselStartIndex >= maximumCarouselStart();\n    }\n\n    function scrollToCarouselIndex(index, behavior) {\n        if (!viewport) return;\n        const cards = carouselCards();\n        if (!cards.length) return;\n        carouselStartIndex = Math.max(0, Math.min(maximumCarouselStart(), index));\n        const targetCard = cards[carouselStartIndex];\n        previousButton.disabled = carouselStartIndex <= 0;\n        nextButton.disabled = carouselStartIndex >= maximumCarouselStart();\n        viewport.scrollTo({ left: targetCard.offsetLeft, behavior: behavior || 'smooth' });\n    }\n\n    function moveCarousel(direction) {\n        const step = configuredVisibleCards();\n        scrollToCarouselIndex(carouselStartIndex + direction * step, 'smooth');\n    }\n\n    if (shell && shell.classList.contains('is-carousel') && viewport && previousButton && nextButton) {\n        previousButton.addEventListener('click', function () { moveCarousel(-1); });\n        nextButton.addEventListener('click', function () { moveCarousel(1); });\n        viewport.addEventListener('scroll', function () {\n            window.cancelAnimationFrame(navigationFrame);\n            navigationFrame = window.requestAnimationFrame(updateNavigationState);\n        }, { passive: true });\n        window.addEventListener('resize', function () {\n            scrollToCarouselIndex(Math.min(carouselStartIndex, maximumCarouselStart()), 'auto');\n        });\n        window.requestAnimationFrame(function () { scrollToCarouselIndex(0, 'auto'); });\n    }\n\n    function equalizeEventCardSizes() {\n        const activeCards = Array.from(grid.querySelectorAll('.event-card'));\n        if (!activeCards.length) return;\n\n        activeCards.forEach(function (card) {\n            card.style.height = 'auto';\n        });\n\n        if (window.matchMedia('(max-width: 768px)').matches) return;\n\n        const maxHeight = activeCards.reduce(function (height, card) {\n            return Math.max(height, Math.ceil(card.getBoundingClientRect().height));\n        }, 0);\n\n        activeCards.forEach(function (card) {\n            card.style.height = maxHeight + 'px';\n        });\n    }\n\n    let equalizeTimer = 0;\n    function scheduleEventCardEqualize() {\n        window.clearTimeout(equalizeTimer);\n        equalizeTimer = window.setTimeout(function () {\n            window.requestAnimationFrame(equalizeEventCardSizes);\n        }, 40);\n    }\n\n    scheduleEventCardEqualize();\n    window.addEventListener('resize', scheduleEventCardEqualize);\n    Array.from(grid.querySelectorAll('.event-flyer img')).forEach(function (image) {\n        if (!image.complete) image.addEventListener('load', scheduleEventCardEqualize, { once: true });\n    });\n    if (document.fonts && document.fonts.ready) {\n        document.fonts.ready.then(scheduleEventCardEqualize);\n    }\n\n    if (!grid.querySelector('.event-card')) {\n        grid.innerHTML = '<div class=\"events-empty\">No upcoming events are currently scheduled.</div>';\n    }\n})();\n</script>\n";

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
const downloadUpcomingHtmlButton = document.getElementById("downloadUpcomingHtmlButton");
const saveIndicator = document.getElementById("saveIndicator");
const pageStatus = document.getElementById("pageStatus");
const importUpcomingCodeInput = document.getElementById("importUpcomingCode");
const importUpcomingCodeButton = document.getElementById("importUpcomingCodeButton");
const upcomingImportStatus = document.getElementById("upcomingImportStatus");
const cardSizeControl = document.getElementById("cardSizeControl");
const cardSizeValue = document.getElementById("cardSizeValue");
const eventsPerRowControl = document.getElementById("eventsPerRow");
const singleRowNavigationControl = document.getElementById("singleRowNavigation");
const carouselVisibleCardsField = document.getElementById("carouselVisibleCardsField");
const carouselVisibleCardsControl = document.getElementById("carouselVisibleCards");

let events = loadEvents();
let cardSizePercent = loadCardSize();
let { eventsPerRow, singleRowNavigation, carouselVisibleCards } = loadDisplaySettings();
let generatedCode = "";
let updateTimer = 0;

function cloneEvent(event = {}) {
  return {
    title: String(event.title || ""),
    venue: String(event.venue || ""),
    description: String(event.description || ""),
    date: String(event.date || ""),
    flyer: String(event.flyer || ""),
    url: String(event.url || event.href || LEGACY_EVENT_URLS[String(event.title || "")] || ""),
    blurFlyer: event.blurFlyer === true || event.blurFlyer === "true",
    flyerBlur: clampFlyerBlur(event.flyerBlur)
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

function clampCardSize(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CARD_SIZE;
  const bounded = Math.max(MIN_CARD_SIZE, Math.min(MAX_CARD_SIZE, parsed));
  return Math.round(bounded / CARD_SIZE_STEP) * CARD_SIZE_STEP;
}

function clampEventsPerRow(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_EVENTS_PER_ROW;
  return Math.max(MIN_EVENTS_PER_ROW, Math.min(MAX_EVENTS_PER_ROW, parsed));
}

function clampCarouselVisibleCards(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CAROUSEL_VISIBLE_CARDS;
  return Math.max(MIN_CAROUSEL_VISIBLE_CARDS, Math.min(MAX_CAROUSEL_VISIBLE_CARDS, parsed));
}

function clampFlyerBlur(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_FLYER_BLUR;
  return Math.max(MIN_FLYER_BLUR, Math.min(MAX_FLYER_BLUR, parsed));
}

function loadCardSize() {
  try {
    return clampCardSize(localStorage.getItem(CARD_SIZE_STORAGE_KEY));
  } catch (error) {
    console.warn("Card size preference could not be loaded.", error);
    return DEFAULT_CARD_SIZE;
  }
}

function saveCardSize() {
  try {
    localStorage.setItem(CARD_SIZE_STORAGE_KEY, String(cardSizePercent));
  } catch (error) {
    console.warn("Card size preference could not be saved.", error);
  }
}

function loadDisplaySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(DISPLAY_STORAGE_KEY));
    return {
      eventsPerRow: clampEventsPerRow(saved?.eventsPerRow),
      singleRowNavigation: saved?.singleRowNavigation === true,
      carouselVisibleCards: clampCarouselVisibleCards(saved?.carouselVisibleCards)
    };
  } catch (error) {
    console.warn("Event display preferences could not be loaded.", error);
    return {
      eventsPerRow: DEFAULT_EVENTS_PER_ROW,
      singleRowNavigation: false,
      carouselVisibleCards: DEFAULT_CAROUSEL_VISIBLE_CARDS
    };
  }
}

function saveDisplaySettings() {
  try {
    localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify({
      eventsPerRow,
      singleRowNavigation,
      carouselVisibleCards
    }));
  } catch (error) {
    console.warn("Event display preferences could not be saved.", error);
  }
}

function scaledCardSize(baseSize) {
  return Number((baseSize * (cardSizePercent / 100)).toFixed(2));
}

function syncCardSizeControl() {
  cardSizeControl.value = String(cardSizePercent);
  cardSizeValue.value = `${cardSizePercent}%`;
  cardSizeValue.textContent = `${cardSizePercent}%`;
}

function syncDisplayControls() {
  eventsPerRowControl.value = String(eventsPerRow);
  singleRowNavigationControl.checked = singleRowNavigation;
  carouselVisibleCardsControl.value = String(carouselVisibleCards);
  carouselVisibleCardsField.hidden = !singleRowNavigation;
  carouselVisibleCardsControl.disabled = !singleRowNavigation;
  singleRowNavigationControl.setAttribute("aria-expanded", String(singleRowNavigation));
}

function generatedGridMaxWidth() {
  return Number((eventsPerRow * scaledCardSize(448) + Math.max(0, eventsPerRow - 1) * 18).toFixed(2));
}

function generatedCarouselMaxWidth() {
  return Number((carouselVisibleCards * scaledCardSize(448) + Math.max(0, carouselVisibleCards - 1) * 18).toFixed(2));
}

function generatedCarouselCardBasis() {
  const totalGap = Math.max(0, carouselVisibleCards - 1) * 18;
  return carouselVisibleCards === 1 ? "100%" : `calc((100% - ${totalGap}px) / ${carouselVisibleCards})`;
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

      <div class="field-group event-mystery-controls">
        <div class="event-mystery-toggle-row">
          <label class="event-mystery-toggle-label" for="event-blur-toggle-${index}">Blur Flyer &amp; Hide Details</label>
          <input id="event-blur-toggle-${index}" class="event-mystery-toggle" data-field="blurFlyer" type="checkbox" ${event.blurFlyer ? "checked" : ""} aria-controls="event-blur-control-${index}" />
        </div>
        <div id="event-blur-control-${index}" class="event-blur-control" ${event.blurFlyer ? "" : "hidden"}>
          <div class="card-size-control-header">
            <label for="event-blur-${index}">Flyer Blur</label>
            <output class="event-blur-value" for="event-blur-${index}">${event.flyerBlur}px</output>
          </div>
          <input id="event-blur-${index}" class="event-blur-range" data-field="flyerBlur" type="range" min="${MIN_FLYER_BLUR}" max="${MAX_FLYER_BLUR}" step="1" value="${event.flyerBlur}" />
        </div>
      </div>

      <div class="field-group">
        <label for="event-url-${index}">Event Page URL</label>
        <input id="event-url-${index}" data-field="url" type="text" inputmode="url" autocomplete="url" value="${escapeHtml(event.url)}" placeholder="/event-page or https://..." />
      </div>
    </section>`;
}

function renderEditors() {
  eventCountInput.value = String(events.length);
  eventEditors.innerHTML = events
    .map((event, index) => ({ event, index }))
    .reverse()
    .map(({ event, index }) => editorMarkup(event, index))
    .join("");
  eventEditors.querySelectorAll(".event-editor").forEach(updateEditorState);
}

function parseImportedDate(dateText) {
  const value = String(dateText || "").trim();
  if (!value) return "";

  const directMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (directMatch) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(parsed.getUTCDate()).padStart(2, "0")}`;
}

function parseGeneratedUpcomingEventsCode(code) {
  const documentFromCode = new DOMParser().parseFromString(code, "text/html");
  const cards = Array.from(documentFromCode.querySelectorAll(".event-card"));
  const displayShell = documentFromCode.querySelector(".events-shell");

  if (!cards.length) {
    throw new Error("No generated upcoming-event cards were found in the pasted code.");
  }

  const importedEvents = cards.slice(0, MAX_EVENTS).map((card, index) => {
    const flyerImage = card.querySelector(".event-flyer img");
    const dateValue = card.getAttribute("data-event-date") || card.dataset.eventDate || card.querySelector(".event-date")?.textContent;
    const blurFlyer = card.classList.contains("is-mystery") || card.dataset.mysteryEvent === "true";
    const importedEvent = cloneEvent({
      title: card.dataset.sourceTitle || card.querySelector(".event-title")?.textContent.trim() || "",
      venue: card.dataset.sourceVenue || card.querySelector(".event-venue-text")?.textContent.trim() || card.querySelector(".event-venue")?.textContent.trim() || "",
      description: card.dataset.sourceDescription || card.querySelector(".event-description")?.textContent.trim() || "",
      date: parseImportedDate(dateValue),
      flyer: flyerImage?.getAttribute("src") || "",
      url: card.getAttribute("href") || "",
      blurFlyer,
      flyerBlur: card.dataset.flyerBlur || card.style.getPropertyValue("--event-flyer-blur")
    });

    if (!importedEvent.title && !importedEvent.venue && !importedEvent.date) {
      throw new Error(`Event ${index + 1} could not be read from the pasted code.`);
    }

    return importedEvent;
  });

  return {
    events: importedEvents,
    eventsPerRow: clampEventsPerRow(displayShell?.dataset.eventsPerRow || DEFAULT_EVENTS_PER_ROW),
    singleRowNavigation: displayShell?.dataset.singleRowNavigation === "true",
    carouselVisibleCards: clampCarouselVisibleCards(
      displayShell?.dataset.carouselVisibleCards || displayShell?.dataset.eventsPerRow || DEFAULT_CAROUSEL_VISIBLE_CARDS
    )
  };
}

function importPastedUpcomingCode() {
  const pastedCode = importUpcomingCodeInput.value.trim();
  if (!pastedCode) {
    upcomingImportStatus.textContent = "Paste previously generated upcoming-events code first.";
    importUpcomingCodeInput.focus();
    return;
  }

  try {
    const imported = parseGeneratedUpcomingEventsCode(pastedCode);
    events = imported.events;
    eventsPerRow = imported.eventsPerRow;
    singleRowNavigation = imported.singleRowNavigation;
    carouselVisibleCards = imported.carouselVisibleCards;
    saveEvents();
    saveDisplaySettings();
    syncDisplayControls();
    renderEditors();
    markUnsaved();
    refreshGeneratedPageNow();
    importUpcomingCodeInput.value = "";
    upcomingImportStatus.textContent = `Imported ${events.length} event${events.length === 1 ? "" : "s"} and regenerated the preview.`;
  } catch (error) {
    console.error("The pasted upcoming-events code could not be imported.", error);
    upcomingImportStatus.textContent = error.message;
  }
}

function updateEditorState(editor) {
  const index = Number(editor.dataset.index);
  const event = events[index];
  const state = editor.querySelector(".event-state");
  const datePreview = editor.querySelector(".date-preview");
  const blurToggle = editor.querySelector('[data-field="blurFlyer"]');
  const blurControl = editor.querySelector(".event-blur-control");
  const blurValue = editor.querySelector(".event-blur-value");

  editor.classList.remove("is-past");
  datePreview.textContent = formatEventDate(event.date);
  blurToggle.checked = event.blurFlyer;
  blurControl.hidden = !event.blurFlyer;
  blurToggle.setAttribute("aria-expanded", String(event.blurFlyer));
  blurValue.value = `${event.flyerBlur}px`;
  blurValue.textContent = `${event.flyerBlur}px`;

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
  const sourceTitle = escapeHtml(event.title.trim());
  const sourceVenue = escapeHtml(event.venue.trim());
  const sourceDescription = escapeHtml(event.description.trim());
  const mysteryText = "???";
  const title = event.blurFlyer ? mysteryText : sourceTitle;
  const venue = event.blurFlyer ? mysteryText : sourceVenue;
  const description = event.blurFlyer ? mysteryText : sourceDescription;
  const date = escapeHtml(formatEventDate(event.date));
  const flyer = escapeHtml(event.flyer.trim());
  const href = escapeHtml(event.url.trim());
  const dateKey = escapeHtml(event.date);
  const mysteryClass = event.blurFlyer ? " is-mystery" : "";
  const mysteryAttributes = event.blurFlyer
    ? ` data-mystery-event="true" data-flyer-blur="${event.flyerBlur}" data-source-title="${sourceTitle}" data-source-venue="${sourceVenue}" data-source-description="${sourceDescription}" style="--event-flyer-blur: ${event.flyerBlur}px"`
    : "";
  const flyerAlt = event.blurFlyer ? "Mystery event flyer" : `${sourceTitle} flyer`;

  return `
  <a class="event-card${mysteryClass}" href="${href}" data-event-date="${dateKey}"${mysteryAttributes}>
   <div class="event-card-bg"></div>
   <div class="event-flyer">
    <img src="${flyer}" alt="${flyerAlt}" />
   </div>
   <div class="event-content">
    <h3 class="event-title">${title}</h3>
    <p class="event-venue"><span class="event-venue-text">${venue}</span><svg class="event-location-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg></p>
    <p class="event-description">${description}</p>
    <div class="event-footer">
     <div class="event-date">${date}</div>
     <div class="event-arrow" aria-hidden="true">
      <svg class="event-arrow-icon" focusable="false" viewBox="0 0 24 24">
       <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
      </svg>
     </div>
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
  const displayClass = singleRowNavigation ? "is-carousel" : "is-grid";

  return BASE_PAGE_TEMPLATE
    .replace("__XMG_EVENT_CARDS__", cards)
    .replace("__XMG_GRID_CLASS__", gridClass)
    .replace("__XMG_DISPLAY_CLASS__", displayClass)
    .replaceAll("__XMG_EVENTS_PER_ROW__", String(eventsPerRow))
    .replaceAll("__XMG_CAROUSEL_VISIBLE_CARDS__", String(carouselVisibleCards))
    .replace("__XMG_SINGLE_ROW_NAVIGATION__", String(singleRowNavigation))
    .replace("__XMG_GRID_MAX_WIDTH__", String(generatedGridMaxWidth()))
    .replace("__XMG_CAROUSEL_MAX_WIDTH__", String(generatedCarouselMaxWidth()))
    .replace("__XMG_CAROUSEL_CARD_BASIS__", generatedCarouselCardBasis())
    .replaceAll("__XMG_LAYLO_IMAGE_URL__", LAYLO_IMAGE_URL)
    .replaceAll("__XMG_DESKTOP_CARD_BASE__", String(scaledCardSize(448)))
    .replaceAll("__XMG_DESKTOP_CARD_MAX__", String(scaledCardSize(544)))
    .replaceAll("__XMG_TABLET_CARD_MIN__", String(scaledCardSize(180)))
    .replaceAll("__XMG_TABLET_CARD_MAX__", String(scaledCardSize(300)))
    .replaceAll("__XMG_MOBILE_CARD_MAX__", String(scaledCardSize(360)))
    .replaceAll("__XMG_SMALL_MOBILE_CARD_MAX__", String(scaledCardSize(340)))
    .replaceAll("__XMG_MANY_CARD_MIN__", String(scaledCardSize(220)))
    .replaceAll("__XMG_MANY_CARD_MAX__", String(scaledCardSize(300)));
}

function updateStatus(validEvents) {
  const pastCount = events.filter(eventIsPast).length;
  const incompleteCount = events.filter((event) => !eventIsPast(event) && !eventIsComplete(event)).length;
  const excluded = [];
  if (pastCount) excluded.push(`<span class="warning">${pastCount} past</span>`);
  if (incompleteCount) excluded.push(`<span class="warning">${incompleteCount} incomplete</span>`);

  pageStatus.innerHTML = `<strong>${validEvents.length}</strong> upcoming event${validEvents.length === 1 ? "" : "s"} included${excluded.length ? ` · ${excluded.join(" · ")} excluded` : ""}.`;
}

function updateGeneratedPage({ immediate = false } = {}) {
  window.clearTimeout(updateTimer);

  const renderGeneratedPage = () => {
    const validEvents = usableEvents();
    generatedCode = buildGeneratedPage(validEvents);
    renderPreview(generatedCode);
    updateStatus(validEvents);
  };

  if (immediate) {
    renderGeneratedPage();
    return;
  }

  updateTimer = window.setTimeout(renderGeneratedPage, 80);
}

function handleEditorInput(event) {
  const input = event.target.closest("input[data-field], textarea[data-field]");
  if (!input) return;

  const editor = input.closest(".event-editor");
  const index = Number(editor.dataset.index);
  const field = input.dataset.field;
  if (input.type === "checkbox") {
    events[index][field] = input.checked;
  } else if (field === "flyerBlur") {
    events[index][field] = clampFlyerBlur(input.value);
    input.value = String(events[index][field]);
  } else {
    events[index][field] = input.value;
  }

  saveEvents();
  updateEditorState(editor);
  markUnsaved();
  updateGeneratedPage();
}

function handleCardSizeInput() {
  cardSizePercent = clampCardSize(cardSizeControl.value);
  syncCardSizeControl();
  saveCardSize();
  markUnsaved();
  updateGeneratedPage({ immediate: true });
}

function handleDisplayInput() {
  eventsPerRow = clampEventsPerRow(eventsPerRowControl.value);
  singleRowNavigation = singleRowNavigationControl.checked;
  carouselVisibleCards = clampCarouselVisibleCards(carouselVisibleCardsControl.value);
  syncDisplayControls();
  saveDisplaySettings();
  markUnsaved();
  updateGeneratedPage({ immediate: true });
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
        display: { eventsPerRow, singleRowNavigation, carouselVisibleCards },
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

function downloadGeneratedHtml() {
  refreshGeneratedPageNow();
  const blob = new Blob([generatedCode], { type: "text/html;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = "upcoming-events.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function copyWithSelectionFallback(text) {
  const activeElement = document.activeElement;
  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("aria-hidden", "true");
  fallback.style.position = "fixed";
  fallback.style.top = "0";
  fallback.style.left = "-9999px";
  fallback.style.width = "1px";
  fallback.style.height = "1px";
  fallback.style.fontSize = "16px";
  fallback.style.opacity = "0";
  document.body.appendChild(fallback);

  let copied = false;
  try {
    fallback.focus({ preventScroll: true });
    fallback.select();
    fallback.setSelectionRange(0, fallback.value.length);
    copied = document.execCommand("copy");
  } catch (error) {
    console.warn("The selection-based clipboard fallback failed.", error);
  } finally {
    fallback.remove();
    if (activeElement instanceof HTMLElement) {
      activeElement.focus({ preventScroll: true });
    }
  }

  return copied;
}

async function writeGeneratedCodeToClipboard(text) {
  // Run the synchronous path first so browsers that restrict clipboard access
  // retain the button click's user activation for the fallback copy operation.
  if (copyWithSelectionFallback(text)) return;

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error("Clipboard access is unavailable in this browser context.");
}

async function copyGeneratedCode() {
  refreshGeneratedPageNow();

  const originalText = copyCodeButton.textContent;
  copyCodeButton.disabled = true;

  try {
    await writeGeneratedCodeToClipboard(generatedCode);
    copyCodeButton.textContent = "COPIED";
    copyCodeButton.classList.add("copied");
  } catch (error) {
    console.error("The generated upcoming-events code could not be copied.", error);
    copyCodeButton.textContent = "COPY FAILED";
    copyCodeButton.classList.remove("copied");
  }

  window.setTimeout(() => {
    copyCodeButton.textContent = originalText;
    copyCodeButton.classList.remove("copied");
    copyCodeButton.disabled = false;
  }, 1400);
}


eventCountInput.addEventListener("change", () => resizeEventList(eventCountInput.value));
eventEditors.addEventListener("input", handleEditorInput);
eventEditors.addEventListener("change", handleEditorInput);
copyCodeButton.addEventListener("click", copyGeneratedCode);
downloadUpcomingHtmlButton.addEventListener("click", downloadGeneratedHtml);
savePageButton.addEventListener("click", saveGeneratedPage);
importUpcomingCodeButton.addEventListener("click", importPastedUpcomingCode);
importUpcomingCodeInput.addEventListener("paste", () => {
  window.setTimeout(importPastedUpcomingCode, 0);
});
cardSizeControl.addEventListener("input", handleCardSizeInput);
cardSizeControl.addEventListener("change", handleCardSizeInput);
eventsPerRowControl.addEventListener("change", handleDisplayInput);
singleRowNavigationControl.addEventListener("change", handleDisplayInput);
carouselVisibleCardsControl.addEventListener("change", handleDisplayInput);

syncCardSizeControl();
syncDisplayControls();
renderEditors();
updateGeneratedPage();


export function activateUpcomingEvents() {
  refreshGeneratedPageNow();
}

export function getUpcomingEventsCode() {
  if (!generatedCode) refreshGeneratedPageNow();
  return generatedCode;
}
