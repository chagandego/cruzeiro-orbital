// Gera mundo.json para o globo do Cruzeiro Orbital a partir do Natural Earth 1:110m (world-atlas 2.0.2).
// Uso: node build-mundo.mjs <saida.json>
import { writeFileSync } from 'node:fs';

const URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
const out = process.argv[2];
if (!out) { console.error('uso: node build-mundo.mjs <saida.json>'); process.exit(1); }

const topo = await (await fetch(URL)).json();
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;

// Arcos: coordenadas quantizadas e codificadas em delta.
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const arcPts = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
const ring = (idx) => idx.flatMap((i, k) => (k ? arcPts(i).slice(1) : arcPts(i)));

const geoms = topo.objects.countries.geometries;
const polysOf = (gm) => (gm.type === 'Polygon' ? [gm.arcs] : gm.type === 'MultiPolygon' ? gm.arcs : []).map((p) => p.map(ring));
const countries = geoms.map((gm) => ({ name: gm.properties.name, polys: polysOf(gm) }))
  .filter((c) => c.polys.length)
  .map((c) => {
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const p of c.polys) for (const [x, y] of p[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { ...c, box: [x0, x1, y0, y1] };
  });

function inRing(x, y, r) {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inPoly = (x, y, p) => inRing(x, y, p[0]) && !p.slice(1).some((h) => inRing(x, y, h));
function countryAt(x, y) {
  for (const c of countries) {
    const [x0, x1, y0, y1] = c.box;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    if (c.polys.some((p) => inPoly(x, y, p))) return c.name;
  }
  return null;
}

const r1 = (n) => Math.round(n * 10) / 10;

// Pontos de terra com espaçamento de área igual (passo em longitude cresce com a latitude).
const land = [];
const STEP = 2;
for (let lat = -88; lat <= 88; lat += STEP) {
  const lonStep = STEP / Math.max(0.15, Math.cos(lat * Math.PI / 180));
  for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
    const name = countryAt(lon, lat);
    if (name && name !== 'Brazil') land.push(r1(lat), r1(lon));
  }
}

// Brasil na mesma grade de 1,4° que o globo já usava, agora com o contorno real.
const br = [];
for (let lat = -34; lat <= 6; lat += 1.4) for (let lon = -74; lon <= -34; lon += 1.4) {
  if (countryAt(lon, lat) === 'Brazil') br.push(r1(lat), r1(lon));
}

// Fronteiras e litorais: cada arco uma vez só. Corta os trechos artificiais no antimeridiano e no polo sul.
const borders = [];
for (const arc of arcs) {
  let cur = [];
  const flush = () => { if (cur.length >= 4) borders.push(cur); cur = []; };
  for (let k = 0; k < arc.length; k++) {
    const [x, y] = arc[k];
    const prev = arc[k - 1];
    const fake = prev && ((Math.abs(x) > 179.9 && Math.abs(prev[0]) > 179.9) || (y < -89.9 && prev[1] < -89.9));
    if (fake) flush();
    const lat = r1(y), lon = r1(x);
    if (cur.length && cur[cur.length - 2] === lat && cur[cur.length - 1] === lon) continue;
    cur.push(lat, lon);
  }
  flush();
}

const data = { fonte: 'Natural Earth 1:110m (domínio público), via world-atlas 2.0.2', land, br, borders };
writeFileSync(out, JSON.stringify(data));
console.log(`países: ${countries.length}, pontos de terra: ${land.length / 2}, Brasil: ${br.length / 2}, linhas: ${borders.length}, vértices: ${borders.reduce((s, b) => s + b.length / 2, 0)}`);
