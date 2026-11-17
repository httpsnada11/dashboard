import fs from 'fs';

const svgTracks = fs.readFileSync('public/copym-pay-radial.svg', 'utf8');

// Extract paths from <g id="tracks">...</g>
const tracksMatch = svgTracks.match(/<g id="tracks">([\s\S]*?)<\/g>/);
if (!tracksMatch) {
  console.error('Could not find tracks in public/copym-pay-radial.svg');
  process.exit(1);
}

let tracksContent = tracksMatch[1];
// Tag classes for theme switcher
tracksContent = tracksContent.replace(/stroke="#090B10"/g, 'class="segment-dark" stroke="#090B10"');
tracksContent = tracksContent.replace(/stroke="#8E95A2"/g, 'class="segment-gray" stroke="#8E95A2"');

const masterSvg = `
          <!-- Master SVG Radial Scanner (1:1 Apple Pay App Clip Architecture) -->
          <svg id="radialSvg" viewBox="0 0 320 320" class="w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] relative z-10 select-none">
            <defs>
              <linearGradient id="studioRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00C076" stop-opacity="0.45" />
                <stop offset="50%" stop-color="#00C076" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#00C076" stop-opacity="0" />
              </linearGradient>

              <filter id="studioGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#00C076" flood-opacity="0.7" />
              </filter>
            </defs>

            <!-- White Base Circle Disc -->
            <circle id="baseDisc" cx="160" cy="160" r="156" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1.5" />

            <!-- 5 Concentric Apple Pay Style Barcode Tracks -->
            <g id="tracks">
${tracksContent}            </g>

            <!-- Optional Animated Radar Sweep (Can be toggled in Studio) -->
            <g id="radarGroup" style="display: none;" class="pointer-events-none">
              <path d="M160 160 L160 12 A148 148 0 0 1 264 56 Z" fill="url(#studioRadarGrad)" />
              <line x1="160" y1="160" x2="264" y2="56" stroke="#00C076" stroke-width="2.5" stroke-linecap="round" filter="url(#studioGlow)" />
              <circle cx="264" cy="56" r="4.5" fill="#FFFFFF" stroke="#00C076" stroke-width="2" />
            </g>

            <!-- Central Solid Black Disc (Matches Apple Pay center badge) -->
            <circle cx="160" cy="160" r="42" fill="#000000" />

            <!-- Center Brand Lockup: [CopyM Emblem] + Pay -->
            <g id="brandLockup" transform="translate(160, 160)">
              <g transform="translate(-25, -10)">
                <rect x="0" y="0" width="19" height="19" rx="5.5" fill="#FFFFFF" />
                <path d="M5.5 9.5 L9.5 5.5 L13.5 9.5 L9.5 13.5 Z" fill="#000000" />
                <circle cx="9.5" cy="9.5" r="1.8" fill="#FFFFFF" />
              </g>
              <text x="-1" y="5" fill="#FFFFFF" font-size="17" font-weight="700" letter-spacing="-0.2" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif">Pay</text>
            </g>

            <!-- Success Checkmark Overlay (Hidden by Default) -->
            <g id="scanSuccessIcon" class="hidden" transform="translate(160, 160)">
              <circle cx="0" cy="0" r="32" fill="#00C076" />
              <path d="M-10 0 L-3 8 L12 -8" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
          </svg>`;

let html = fs.readFileSync('copym-radial-scanner.html', 'utf8');

// Replace the old SVG with the masterSvg
const svgRegex = /<!-- Master SVG Radial Scanner -->[\s\S]*?<\/svg>/;
if (svgRegex.test(html)) {
  html = html.replace(svgRegex, masterSvg.trim());
  fs.writeFileSync('copym-radial-scanner.html', html);
  fs.writeFileSync('public/copym-radial-scanner.html', html);
  console.log('Successfully updated copym-radial-scanner.html and public/copym-radial-scanner.html');
} else {
  console.error('Could not find <!-- Master SVG Radial Scanner --> in copym-radial-scanner.html');
}
