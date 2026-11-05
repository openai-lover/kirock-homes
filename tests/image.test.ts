import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { pointInPhoto } from '../src/lib/image/normalize';
import { sanitizeImage } from '../src/lib/server/image';

test('photo coordinates use the image rectangle and clamp beyond its edges', () => {
  assert.deepEqual(pointInPhoto(230, 170, { left: 30, top: 20, width: 400, height: 300 }), { x: .5, y: .5 });
  assert.deepEqual(pointInPhoto(-20, 900, { left: 30, top: 20, width: 400, height: 300 }), { x: .04, y: .96 });
  assert.deepEqual(pointInPhoto(230, 320, { left: 30, top: 20, width: 400, height: 600 }), { x: .5, y: .5 });
});

test('shared image decoding applies EXIF orientation and removes EXIF metadata', async () => {
  const source = await sharp({ create: { width: 600, height: 400, channels: 3, background: '#284f91' } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer();
  assert.equal((await sharp(source).metadata()).orientation, 6);
  const output = await sanitizeImage(`data:image/jpeg;base64,${source.toString('base64')}`);
  assert.equal(output.width, 400);
  assert.equal(output.height, 600);
  const metadata = await sharp(output.bytes).metadata();
  assert.equal(metadata.orientation, undefined);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
});

test('server normalizes landscape and portrait images with bounded dimensions', async () => {
  for (const [width, height] of [[2400, 1200], [1200, 2400]]) {
    const source = await sharp({ create: { width, height, channels: 3, background: '#efc77d' } }).png().toBuffer();
    const image = await sanitizeImage(`data:image/png;base64,${source.toString('base64')}`);
    assert.equal(Math.max(image.width, image.height), 1600);
    assert.equal(Math.min(image.width, image.height), 800);
    assert.ok(image.bytes.length <= 1_048_576);
    assert.equal((await sharp(image.bytes).metadata()).format, 'jpeg');
  }
});

test('fake image bytes, unsupported data URLs and excessive bytes are rejected', async () => {
  await assert.rejects(sanitizeImage('data:image/jpeg;base64,bm90LWFuLWltYWdl'));
  await assert.rejects(sanitizeImage('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='));
  await assert.rejects(sanitizeImage(`data:image/jpeg;base64,${'A'.repeat(1_400_001)}`));
});
