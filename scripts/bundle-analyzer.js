#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

const extensions = (file) =>
  (file.endsWith('.js') || file.endsWith('.cjs')) && !file.endsWith('.map');

const analyzeFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath) || !extensions(filePath)) return null;

    const content = fs.readFileSync(filePath);
    const rawSize = content.length;
    const gzippedSize = gzipSync(content).length;
    const compressionRatio = ((1 - gzippedSize / rawSize) * 100).toFixed(1);

    return {
      raw: (rawSize / 1024).toFixed(1) + 'kB',
      gzip: (gzippedSize / 1024).toFixed(1) + 'kB',
      compress: compressionRatio + '%',
    };
  } catch (error) {
    console.error(`[Error] Analyzing file "${filePath}": ${error.message}`);
  }
};

const getPlugin = () => {
  const pluginDir = 'dist/plugin';

  try {
    if (!fs.existsSync(pluginDir) || !fs.statSync(pluginDir).isDirectory())
      return [];

    return fs
      .readdirSync(pluginDir)
      .filter(extensions)
      .map((f) => ({
        name: f.replace(/\.(js|cjs)$/, ''),
        format: f.endsWith('.js') ? 'esm' : 'cjs',
        path: path.join(pluginDir, f),
      }));
  } catch (error) {
    console.error(
      `[Error] Reading plugin directory "${pluginDir}": ${error.message}`,
    );
  }
};

const runAnalyzer = () => {
  const result = {};
  const esmGzipped = analyzeFile('dist/index.js');
  const cjsGzipped = analyzeFile('dist/index.cjs');

  try {
    if (esmGzipped && cjsGzipped) {
      const esmCompressed = parseFloat(esmGzipped.compress.replace('%', ''));
      const cjsCompressed = parseFloat(cjsGzipped.compress.replace('%', ''));
      const avgCompression =
        ((esmCompressed + cjsCompressed) / 2).toFixed(1) + '%';

      result['waktos'] = {
        ESM: esmGzipped.gzip,
        CJS: cjsGzipped.gzip,
        Ratio: avgCompression,
      };
    }

    const plugins = getPlugin() || [];
    const pluginData = plugins.reduce((acc, { name, format, path }) => {
      const analysis = analyzeFile(path);

      if (analysis) {
        acc[name] = acc[name] || {
          ESM: '-',
          CJS: '-',
          Ratio: '-',
        };
        acc[name][format.toUpperCase()] = analysis.gzip;

        if (!acc[name].compressionRatio) acc[name].compressionRatio = [];

        acc[name].compressionRatio.push(
          parseFloat(analysis.compress.replace('%', '')),
        );
      }

      return acc;
    }, {});

    Object.entries(pluginData).forEach(([name, data]) => {
      if (data.compressionRatio && data.compressionRatio.length > 0) {
        const avgCompression =
          data.compressionRatio.reduce((sum, comp) => sum + comp, 0) /
          data.compressionRatio.length;

        data['Ratio'] = avgCompression.toFixed(1) + '%';
      }

      delete data.compressionRatio;

      result[`├─ ${name}`] = data;
    });

    console.table(result);
  } catch (error) {
    console.error(`[Error] Analyzing: ${error.message}`);
  }
};

runAnalyzer();
