import fs from 'fs';

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((cx + r * Math.cos(angleInRadians)).toFixed(2)),
    y: Number((cy + r * Math.sin(angleInRadians)).toFixed(2))
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;
  const largeArcFlag = diff <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function buildRingSegments(cx, cy, r, strokeWidth, slots) {
  const N = slots.length;
  const step = 360 / N;
  const capAngle = (strokeWidth / r) * (180 / Math.PI);
  const visualGapPx = 4.2;
  const gapAngle = capAngle + (visualGapPx / r) * (180 / Math.PI);

  const segments = [];
  let i = 0;
  while (i < N) {
    const val = slots[i];
    if (val === 0) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < N && slots[j + 1] === val) {
      j++;
    }
    const count = j - i + 1;
    const centerStart = i * step;
    const centerEnd = (i + count) * step;
    const startAngle = centerStart + gapAngle / 2;
    const endAngle = centerEnd - gapAngle / 2;

    if (endAngle > startAngle) {
      segments.push({
        type: val === 1 ? 'black' : 'grey',
        path: describeArc(cx, cy, r, startAngle, endAngle),
        strokeWidth
      });
    }
    i = j + 1;
  }
  return segments;
}

const ringConfigs = [
  // Ring 1 (r=59, stroke=7.5): 18 slots
  { r: 59, stroke: 7.5, slots: [1, 2, 0, 1, 1, 0, 2, 1, 0, 2, 2, 0, 1, 0, 2, 1, 1, 0] },
  // Ring 2 (r=79, stroke=8.0): 24 slots
  { r: 79, stroke: 8.0, slots: [1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 2, 1, 0] },
  // Ring 3 (r=99, stroke=8.5): 30 slots
  { r: 99, stroke: 8.5, slots: [2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 2, 1, 0, 1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 0] },
  // Ring 4 (r=119, stroke=9.0): 36 slots
  { r: 119, stroke: 9.0, slots: [1, 2, 0, 1, 1, 2, 0, 2, 0, 1, 1, 0, 2, 1, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 2, 0, 1, 1, 2, 0, 2, 0] },
  // Ring 5 (r=139, stroke=9.5): 42 slots
  { r: 139, stroke: 9.5, slots: [2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 2, 0, 1, 1, 0, 2, 0, 1, 2, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0] }
];

let pathsSvg = '';
ringConfigs.forEach(rc => {
  const segs = buildRingSegments(160, 160, rc.r, rc.stroke, rc.slots);
  segs.forEach(s => {
    const color = s.type === 'black' ? '#090B10' : '#8E95A2';
    pathsSvg += `    <path d="${s.path}" fill="none" stroke="${color}" stroke-width="${s.strokeWidth}" stroke-linecap="round" />\n`;
  });
});

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <!-- Outer Circular Card Disc -->
  <circle cx="160" cy="160" r="156" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1.5" />

  <!-- 5 Concentric Apple Pay Style Barcode Tracks -->
  <g id="tracks">
${pathsSvg}  </g>

  <!-- Central Solid Black Disc -->
  <circle cx="160" cy="160" r="42" fill="#000000" />

  <!-- Center Apple Pay Style Brand Lockup: [CopyM Symbol] + Pay -->
  <g id="brandLockup" transform="translate(160, 160)">
    <!-- CopyM Minimal Monogram / Vault Emblem -->
    <g transform="translate(-25, -10)">
      <rect x="0" y="0" width="19" height="19" rx="5.5" fill="#FFFFFF" />
      <path d="M5.5 9.5 L9.5 5.5 L13.5 9.5 L9.5 13.5 Z" fill="#000000" />
      <circle cx="9.5" cy="9.5" r="1.8" fill="#FFFFFF" />
    </g>
    <!-- Crisp White "Pay" Typography (Matches Pay SF Pro font) -->
    <text x="-1" y="5" fill="#FFFFFF" font-size="17" font-weight="700" letter-spacing="-0.2" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif">Pay</text>
  </g>
</svg>
`;

fs.writeFileSync('public/copym-pay-radial.svg', svgContent);
console.log('Successfully generated public/copym-pay-radial.svg');
