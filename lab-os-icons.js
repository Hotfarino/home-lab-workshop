// Small original interface glyphs. Ubuntu app artwork is the attributed Yaru theme.
const paths={
 lab:'<rect x="2" y="2" width="20" height="20" rx="5" fill="#176fd0"/><path d="M6 7h5v5H6zm7 0h5v5h-5zM6 14h5v4H6zm7 0h5v4h-5z" fill="#fff"/>',
 start:'<path fill="#087cdb" d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>',
 repos:'<path fill="#e9a918" d="M2 5a2 2 0 0 1 2-2h5l3 3h8a2 2 0 0 1 2 2v11H2z"/><path fill="#ffd76c" d="M2 8h20v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path fill="#e9ad30" d="M2 15h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>',
 terminal:'<rect x="1" y="3" width="22" height="18" rx="3" fill="#282a30"/><path d="m5 8 4 4-4 4m7 0h6" stroke="#eee" stroke-width="1.8" fill="none"/>',
 powershell:'<path d="M5 3h18l-4 18H1z" fill="#2584cc"/><path d="m8 7 4 4-6 5m7 0h4" stroke="#fff" stroke-width="1.7" fill="none"/>',
 cmd:'<rect x="1" y="3" width="22" height="18" rx="2" fill="#202020"/><path d="m5 9 4 3-4 3m7 0h5" stroke="#fff" stroke-width="1.5" fill="none"/>',
 settings:'<path fill="#788494" d="m10 1 4 0 .7 3 2 .9L20 4l2 3-2.2 2.3.2 2.2 3 1v4l-3 .7-1 2 1 2.6-3 2-2.3-2.2-2.2.2-1 3-4-1-.7-3-2-1L2 19l-2-3 2.2-2.3-.2-2.2L0 10l1-4 3-.7 1-2L8 4z" transform="translate(2 0) scale(.85)"/><circle cx="12" cy="12" r="5" fill="#beddfa"/><circle cx="12" cy="12" r="3" fill="#137bd5"/>',
 browser:'<circle cx="12" cy="12" r="11" fill="#fff"/><path d="M12 1a11 11 0 0 1 9.5 5.5H12a5.5 5.5 0 0 0-4.76 8.25L2.5 6.5A11 11 0 0 1 12 1" fill="#ea4335"/><path d="M21.5 6.5a11 11 0 0 1-9.5 16.5l4.76-8.25A5.5 5.5 0 0 0 12 6.5" fill="#fbbc05"/><path d="M12 23A11 11 0 0 1 2.5 6.5l4.74 8.25a5.5 5.5 0 0 0 9.52 0" fill="#34a853"/><circle cx="12" cy="12" r="5.4" fill="#fff"/><circle cx="12" cy="12" r="4.45" fill="#4285f4"/>',
 firefox:'<circle cx="12" cy="13" r="9" fill="#713cbd"/><path d="M18 1c1 4 4 5 5 10 1 6-3 12-10 12C5 24 0 18 1 11c0-3 2-6 3-7l1 4 4-2 3 3-3 2 2 3-5-1c0 4 5 7 9 4 3-2 3-5 1-7 5 2 6 6 3 9 6-6 1-12-1-18Z" fill="#ff8a22"/><path d="m4 4 1 4 4-2 3 3-3 2-4-1-2 3c-1-4 0-6 1-9m14-3c-3 4-2 6 1 9 2 2 2 5 1 7 4-5 1-10-2-16" fill="#ffca36"/><path d="M2 15c4 9 15 10 20 1-2 9-17 12-20-1" fill="#ff4b3b"/>',
 vms:'<rect x="1" y="2" width="15" height="13" rx="2" fill="#1977c3"/><rect x="3" y="4" width="11" height="8" fill="#c2e9ff"/><rect x="8" y="9" width="15" height="13" rx="2" fill="#764ebc"/><rect x="10" y="11" width="11" height="8" fill="#dccbff"/>',
 cloud:'<path d="M6 20a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12Z" fill="#289cde"/>',
 tools:'<rect x="2" y="2" width="20" height="15" rx="2" fill="#62768c"/><path fill="#b5e5ff" d="M4 4h16v10H4z"/><path stroke="#62768c" stroke-width="2" d="M12 17v4m-5 0h10"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 network:'<rect x="3" y="3" width="18" height="13" rx="1"/><path d="M12 16v5m-4 0h8"/>',
 volume:'<path d="M4 9h4l5-4v14l-5-4H4zm12-1c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
 power:'<path d="M12 2v10m-5-7a9 9 0 1 0 10 0"/>',
 home:'<path d="m2 11 10-9 10 9M5 9v12h5v-7h4v7h5V9"/>'
};
export function appIcon(k,os='windows'){
 if(os==='ubuntu'&&['repos','terminal','settings'].includes(k))return `<img class="os-app-icon" src="lab-yaru-${k==='repos'?'files':k}.png" alt="" draggable="false">`;
 if(os==='ubuntu'&&k==='start')return '<svg class="os-app-icon" viewBox="0 0 24 24" aria-hidden="true">'+[4,12,20].flatMap(x=>[4,12,20].map(y=>`<circle cx="${x}" cy="${y}" r="2" fill="currentColor"/>`)).join('')+'</svg>';
 const line=['search','network','volume','power','home'].includes(k);
 return `<svg class="os-app-icon" viewBox="0 0 24 24" aria-hidden="true" style="stroke:${line?'currentColor':'none'};stroke-width:1.6;fill:none">${paths[k]||paths.repos}</svg>`;
}
