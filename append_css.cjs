const fs = require('fs');
const css = `
/* Estilos para el Slider de Recién Llegados */
.slider-container { position: relative; width: 100%; margin-bottom: 4rem; }
.slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.slider-title { margin: 0; position: relative; display: inline-block; font-size: 2rem; }
.slider-title::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 60%; height: 4px; background: var(--primary); border-radius: 2px; }
.slider-controls { display: flex; gap: 0.8rem; }
.slider-btn { background: var(--surface); border: 1px solid var(--glass-border); border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: var(--text); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.slider-btn:hover { background: var(--primary); color: white; transform: scale(1.1); border-color: var(--primary); box-shadow: 0 8px 15px rgba(255, 65, 108, 0.3); }
.slider-btn:active { transform: scale(0.95); }
.slider-track-wrapper { overflow: hidden; position: relative; margin: -1rem -1rem; padding: 1rem 1rem; }
.slider-track { display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; scroll-snap-type: x mandatory; padding-bottom: 1.5rem; -ms-overflow-style: none; scrollbar-width: none; }
.slider-track::-webkit-scrollbar { display: none; }
.slider-item { scroll-snap-align: start; flex: 0 0 calc(33.333% - 1rem); min-width: 280px; }
@media (max-width: 900px) { .slider-item { flex: 0 0 calc(50% - 0.75rem); } }
@media (max-width: 600px) { .slider-item { flex: 0 0 100%; } }
.highlight-badge { position: absolute; top: -10px; right: -10px; background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%); color: white; font-size: 0.75rem; font-weight: bold; padding: 0.4rem 1rem; border-radius: 20px; animation: pulse-badge 2s infinite; z-index: 10; box-shadow: 0 4px 10px rgba(255, 65, 108, 0.4); letter-spacing: 1px; }
@keyframes pulse-badge { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 65, 108, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0); } }
.card-hover-effect { height: 100%; margin: 0; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; }
.card-hover-effect:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
`;
fs.appendFileSync('public/css/public.css', css);
console.log('CSS appended');
