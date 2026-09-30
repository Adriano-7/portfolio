export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type ImageView = Point & { scale: number };
export const INITIAL_VIEW: ImageView = { scale: 1, x: 0, y: 0 };
export const MAX_SCALE = 4;

export function fitImage(image: Size, viewport: Size): Size {
  const ratio = Math.min(1, Math.max(1, viewport.width - 32) / image.width, Math.max(1, viewport.height - 32) / image.height);
  return { width: image.width * ratio, height: image.height * ratio };
}

export function constrainView(view: ImageView, image: Size, viewport: Size): ImageView {
  const scale = Math.min(MAX_SCALE, Math.max(1, view.scale));
  const limitX = Math.max(0, (image.width * scale - viewport.width) / 2);
  const limitY = Math.max(0, (image.height * scale - viewport.height) / 2);
  return { scale, x: Math.min(limitX, Math.max(-limitX, view.x)), y: Math.min(limitY, Math.max(-limitY, view.y)) };
}

// Anchors are relative to the viewport center. Moving the anchor also pans a pinch.
export function zoomView(view: ImageView, scale: number, from: Point, to: Point, image: Size, viewport: Size): ImageView {
  const nextScale = Math.min(MAX_SCALE, Math.max(1, scale));
  const ratio = nextScale / view.scale;
  return constrainView({ scale: nextScale, x: to.x - (from.x - view.x) * ratio, y: to.y - (from.y - view.y) * ratio }, image, viewport);
}
