import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/lightbox-geometry.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { fitImage, constrainView, zoomView, INITIAL_VIEW } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const viewport = { width: 800, height: 600 };
const image = { width: 768, height: 568 };

test('fit respects both viewport dimensions and never enlarges small originals', () => {
  assert.deepEqual(fitImage({ width: 100, height: 50 }, viewport), { width: 100, height: 50 });
  const tall = fitImage({ width: 1000, height: 2000 }, viewport);
  assert.equal(tall.height, 568);
  assert.equal(tall.width, 284);
});
test('zoom preserves the image point under an off-center pointer', () => {
  const anchor = { x: 100, y: -80 };
  const result = zoomView(INITIAL_VIEW, 2, anchor, anchor, image, viewport);
  assert.equal((anchor.x - result.x) / result.scale, anchor.x);
  assert.equal((anchor.y - result.y) / result.scale, anchor.y);
});
test('pinch can zoom and translate its midpoint simultaneously', () => {
  const result = zoomView(INITIAL_VIEW, 2, { x: 20, y: 30 }, { x: 60, y: 80 }, image, viewport);
  assert.deepEqual(result, { scale: 2, x: 20, y: 20 });
});
test('pan is bounded and axes smaller than the viewport remain centered', () => {
  assert.deepEqual(constrainView({ scale: 2, x: 9999, y: -9999 }, image, viewport), { scale: 2, x: 368, y: -268 });
  assert.deepEqual(constrainView({ scale: 2, x: 50, y: 50 }, { width: 100, height: 100 }, viewport), { scale: 2, x: 0, y: 0 });
});
test('reset returns to centered fit and every input shares the same scale limits', () => {
  assert.deepEqual(zoomView({ scale: 3, x: 200, y: -200 }, 0, { x: 100, y: 100 }, { x: 100, y: 100 }, image, viewport), INITIAL_VIEW);
  assert.equal(zoomView(INITIAL_VIEW, 99, { x: 0, y: 0 }, { x: 0, y: 0 }, image, viewport).scale, 4);
});
