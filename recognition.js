// Screenshot matching adapted from Nightreign Seed Observer, commit 12c51ae.
const BamTiRecognition = (() => {
  const state = {mapImageCache: new Map(), mapSignatureCache: new Map()};
  const mapBackgrounds = {"Normal": "./Normal.webp", "Crater": "./Crater.webp", "Mountaintop": "./Mountaintop.webp", "Rotted": "./Rotted.webp", "Noklateo": "./Noklateo.webp", "Great Hollow": "./Hollow.webp"};
  function imageFromPath(path) {
    if (state.mapImageCache.has(path)) return state.mapImageCache.get(path);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`底图加载失败：${path}`));
      image.src = path;
    });
    state.mapImageCache.set(path, promise);
    return promise;
  }

  function squareCanvas(image, size = 256, crop = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { alpha: false });
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const scale = Math.max(0.35, Math.min(1, crop.scale || 1));
    const side = Math.min(width, height) * scale;
    const centerX = Number.isFinite(crop.centerX) ? crop.centerX : 0.5;
    const centerY = Number.isFinite(crop.centerY) ? crop.centerY : 0.5;
    const sx = Math.max(0, Math.min(width - side, width * centerX - side / 2));
    const sy = Math.max(0, Math.min(height - side, height * centerY - side / 2));
    context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
    canvas.dataset.crop = JSON.stringify({ sx, sy, side, width, height, centerX, centerY, scale });
    return canvas;
  }

  function normalizeFeature(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, values.length);
    const deviation = Math.max(0.025, Math.sqrt(variance));
    return Float32Array.from(values, (value) => (value - mean) / deviation);
  }

  function imageSignature(canvas, grid = 20) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const tone = [];
    const saturation = [];
    const warmth = [];
    const greenBalance = [];
    for (let gy = 0; gy < grid; gy += 1) {
      for (let gx = 0; gx < grid; gx += 1) {
        const left = Math.floor(gx * canvas.width / grid);
        const top = Math.floor(gy * canvas.height / grid);
        const right = Math.max(left + 1, Math.floor((gx + 1) * canvas.width / grid));
        const bottom = Math.max(top + 1, Math.floor((gy + 1) * canvas.height / grid));
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let y = top; y < bottom; y += 1) {
          for (let x = left; x < right; x += 1) {
            const index = (y * canvas.width + x) * 4;
            r += pixels[index];
            g += pixels[index + 1];
            b += pixels[index + 2];
            count += 1;
          }
        }
        r /= count * 255;
        g /= count * 255;
        b /= count * 255;
        const luminance = r * 0.299 + g * 0.587 + b * 0.114;
        tone.push(luminance);
        saturation.push(Math.max(r, g, b) - Math.min(r, g, b));
        warmth.push((r - b) / Math.max(0.08, luminance));
        greenBalance.push((g - (r + b) / 2) / Math.max(0.08, luminance));
      }
    }
    const edge = tone.map((value, index) => {
      const x = index % grid;
      const y = Math.floor(index / grid);
      const right = x + 1 < grid ? tone[index + 1] : value;
      const down = y + 1 < grid ? tone[index + grid] : value;
      return Math.hypot(right - value, down - value);
    });
    const meanTone = tone.reduce((sum, value) => sum + value, 0) / Math.max(1, tone.length);
    const meanSaturation = saturation.reduce((sum, value) => sum + value, 0) / Math.max(1, saturation.length);
    return {
      tone: normalizeFeature(tone),
      edge: normalizeFeature(edge),
      saturation: normalizeFeature(saturation),
      warmth: normalizeFeature(warmth),
      greenBalance: normalizeFeature(greenBalance),
      meanTone,
      meanSaturation,
    };
  }

  function featureCorrelation(left, right) {
    if (!left?.length || left.length !== right?.length) return -1;
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    for (let index = 0; index < left.length; index += 1) {
      dot += left[index] * right[index];
      leftNorm += left[index] ** 2;
      rightNorm += right[index] ** 2;
    }
    return dot / Math.max(0.0001, Math.sqrt(leftNorm * rightNorm));
  }

  function signatureDistance(left, right) {
    const tone = featureCorrelation(left.tone, right.tone);
    const edge = featureCorrelation(left.edge, right.edge);
    const saturation = featureCorrelation(left.saturation, right.saturation);
    const warmth = featureCorrelation(left.warmth, right.warmth);
    const greenBalance = featureCorrelation(left.greenBalance, right.greenBalance);
    const correlation = tone * 0.3 + edge * 0.38 + saturation * 0.08 + warmth * 0.12 + greenBalance * 0.12;
    const structureDistance = Math.max(0, Math.min(1, (1 - correlation) / 2));
    const appearanceDistance = Math.min(1,
      Math.abs(left.meanTone - right.meanTone) * 1.8
      + Math.abs(left.meanSaturation - right.meanSaturation) * 1.2);
    return structureDistance * 0.94 + appearanceDistance * 0.06;
  }

  function screenshotCropCandidates(image) {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const landscape = width / Math.max(1, height) > 1.2;
    const portrait = height / Math.max(1, width) > 1.2;
    // Nightreign keeps the map panel on the right in landscape screenshots.
    // Restricting the search avoids mistaking the dark 3D scene for Great Hollow.
    const centersX = landscape ? [0.72, 0.78] : [0.5];
    const centersY = portrait ? [0.25, 0.5, 0.75] : [0.5];
    const scales = [1, 0.9, 0.82];
    const candidates = [];
    centersX.forEach((centerX) => centersY.forEach((centerY) => scales.forEach((scale) => {
      candidates.push({
        canvas: squareCanvas(image, 256, { centerX, centerY, scale }),
        crop: { centerX, centerY, scale },
      });
    })));
    return candidates;
  }

  function templateViews() {
    const views = [{ scale: 1, centerX: 0.5, centerY: 0.5 }];
    [0.82, 0.66, 0.52].forEach((scale) => {
      const edge = scale / 2;
      const centers = [edge, 0.5, 1 - edge];
      centers.forEach((centerX) => centers.forEach((centerY) => {
        views.push({ scale, centerX, centerY });
      }));
    });
    return views;
  }

  async function classifyMapScreenshot(image) {
    const screenshotCandidates = screenshotCropCandidates(image).map((candidate) => ({
      ...candidate,
      signature: imageSignature(candidate.canvas),
    }));
    const bestByMap = [];
    for (const [mapType, path] of Object.entries(mapBackgrounds)) {
      try {
        const templateImage = await imageFromPath(path);
        let bestMatch = null;
        for (const view of templateViews()) {
          const cacheKey = `${path}|${view.scale}|${view.centerX}|${view.centerY}`;
          let signature = state.mapSignatureCache.get(cacheKey);
          if (!signature) {
            signature = imageSignature(squareCanvas(templateImage, 256, view));
            state.mapSignatureCache.set(cacheKey, signature);
          }
          for (const screenshot of screenshotCandidates) {
            const rawDistance = signatureDistance(screenshot.signature, signature);
            const variantPenalty = mapType !== "Normal" && mapType !== "Great Hollow" ? 0.025 : 0;
            const weakHollowPenalty = mapType === "Great Hollow"
              && screenshot.crop.centerX !== 0.5
              && rawDistance > 0.22
              ? 0.14
              : 0;
            const distance = rawDistance + variantPenalty + weakHollowPenalty;
            if (!bestMatch || distance < bestMatch.distance) {
              bestMatch = { mapType, distance, view, crop: screenshot.crop, canvas: screenshot.canvas };
            }
          }
        }
        if (bestMatch) bestByMap.push(bestMatch);
      } catch (error) {
        console.warn(error);
      }
    }
    bestByMap.sort((a, b) => a.distance - b.distance);
    const best = bestByMap[0];
    const second = bestByMap[1];
    const quality = best ? Math.max(0, Math.min(1, (0.58 - best.distance) / 0.38)) : 0;
    const margin = best && second ? Math.max(0, Math.min(1, (second.distance - best.distance) / 0.12)) : 0;
    const confidence = Math.max(0, Math.min(1, quality * 0.72 + margin * 0.28));
    return { best, second, confidence, scores: bestByMap, canvas: best?.canvas || screenshotCandidates[0]?.canvas };
  }

  function colorComponents(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const width = canvas.width;
    const height = canvas.height;
    const marked = new Uint8Array(width * height);
    const components = [];
    const interesting = (x, y) => {
      const index = (y * width + x) * 4;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const vivid = max > 105 && max - min > 45;
      const brightNeutral = max > 198 && min > 138 && max - min < 78;
      const gold = red > 145 && green > 105 && blue < 135 && red - blue > 32;
      return vivid || brightNeutral || gold;
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = y * width + x;
        if (marked[offset] || !interesting(x, y)) continue;
        marked[offset] = 1;
        const queue = [[x, y]];
        let totalX = 0;
        let totalY = 0;
        let count = 0;
        let redTotal = 0;
        let greenTotal = 0;
        let blueTotal = 0;
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        while (queue.length) {
          const [px, py] = queue.pop();
          const index = (py * width + px) * 4;
          totalX += px;
          totalY += py;
          redTotal += pixels[index];
          greenTotal += pixels[index + 1];
          blueTotal += pixels[index + 2];
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          minY = Math.min(minY, py);
          maxY = Math.max(maxY, py);
          count += 1;
          for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const next = ny * width + nx;
            if (!marked[next] && interesting(nx, ny)) {
              marked[next] = 1;
              queue.push([nx, ny]);
            }
          }
        }
        const boxWidth = maxX - minX + 1;
        const boxHeight = maxY - minY + 1;
        const aspect = Math.max(boxWidth, boxHeight) / Math.max(1, Math.min(boxWidth, boxHeight));
        const fill = count / Math.max(1, boxWidth * boxHeight);
        if (count >= 6 && count <= 2800 && boxWidth <= 56 && boxHeight <= 56 && aspect <= 4.5 && fill >= 0.06) {
          components.push({
            x: totalX / count / width * 1000,
            y: totalY / count / height * 1000,
            size: count,
            red: redTotal / count,
            green: greenTotal / count,
            blue: blueTotal / count,
            width: boxWidth,
            height: boxHeight,
            fill,
          });
        }
      }
    }
    return components;
  }

  function nearestCoordinate(x, y, coordinates) {
    let best = null;
    for (const point of coordinates) {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (!best || distance < best.distance) best = { point, distance };
    }
    return best;
  }

  function mapRegisteredComponent(component, registration) {
    const view = registration?.view || { scale: 1, centerX: 0.5, centerY: 0.5 };
    const startX = view.centerX - view.scale / 2;
    const startY = view.centerY - view.scale / 2;
    return {
      ...component,
      localX: component.x,
      localY: component.y,
      x: (startX + component.x / 1000 * view.scale) * 1000,
      y: (startY + component.y / 1000 * view.scale) * 1000,
    };
  }

  function analyzeScreenshot(canvas, coordinates, registration) {
    const components = colorComponents(canvas);
    const pointScores = new Map();
    let playerCount = 0;
    let enemyCount = 0;
    const playerPositions = [];
    const enemyPositions = [];
    components.forEach((rawComponent) => {
      const component = mapRegisteredComponent(rawComponent, registration);
      const nearest = nearestCoordinate(component.x, component.y, coordinates);
      const redDominant = component.red > component.blue * 1.2 && component.red > component.green * 1.1;
      const blueDominant = component.blue > component.red * 1.15 && component.blue > component.green * 1.08;
      if (blueDominant && component.size >= 12 && component.size <= 800) {
        playerCount += 1;
        playerPositions.push(component);
      }
      if (redDominant && component.size >= 12 && component.size <= 800) {
        enemyCount += 1;
        enemyPositions.push(component);
      }
      if (!nearest || nearest.distance > 58) return;
      const sizeScore = Math.min(1, component.size / 110);
      const distanceScore = Math.max(0, 1 - nearest.distance / 58);
      const compactnessScore = Math.min(1, component.fill / 0.38);
      const score = Math.min(0.99, 0.35 + sizeScore * 0.25 + distanceScore * 0.3 + compactnessScore * 0.1);
      const id = String(nearest.point.id);
      pointScores.set(id, Math.max(pointScores.get(id) || 0, score));
    });
    const points = [...pointScores.entries()]
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);
    return { points, playerCount, enemyCount, playerPositions, enemyPositions, componentCount: components.length };
  }

  return { classifyMapScreenshot, analyzeScreenshot, mapBackgrounds };
})();
