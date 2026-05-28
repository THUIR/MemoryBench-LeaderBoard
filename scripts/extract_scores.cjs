const fs = require('fs');
const path = require('path');

const basePaths = [
  { model: '8B', root: path.join(__dirname, '../MemoryBench运行数据/off-policy') },
  { model: '32B', root: path.join(__dirname, '../MemoryBench运行数据/off-policy-32b') }
];

const benchmarkTypes = ['domain', 'task'];
const memorySystems = ['a_mem', 'bm25_dialog', 'bm25_message', 'embedder_dialog', 'embedder_message', 'mem0', 'memoryos', 'wo_memory'];

function findSummaryInDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const summaryPath = path.join(dir, entry.name, 'summary.json');
        if (fs.existsSync(summaryPath)) {
          return summaryPath;
        }
        const deeper = findSummaryInDir(path.join(dir, entry.name));
        if (deeper) return deeper;
      }
    }
  } catch (e) {}
  return null;
}

function extractScores(summaryPath) {
  try {
    const content = fs.readFileSync(summaryPath, 'utf-8');
    const data = JSON.parse(content);
    return {
      weighted_average: data.summary?.weighted_average ?? null,
      z_score: data.summary?.z_score ?? null
    };
  } catch (e) {
    return { weighted_average: null, z_score: null };
  }
}

const result = {};

for (const { model, root } of basePaths) {
  for (const benchType of benchmarkTypes) {
    const typeDir = path.join(root, benchType);
    if (!fs.existsSync(typeDir)) continue;

    const benchmarks = fs.readdirSync(typeDir);

    for (const benchmark of benchmarks) {
      const key = `${benchType}/${benchmark}`;
      if (!result[key]) {
        result[key] = {};
      }

      const benchDir = path.join(typeDir, benchmark);

      for (const msName of memorySystems) {
        const msDir = path.join(benchDir, msName);
        if (!fs.existsSync(msDir)) continue;

        const summaryPath = findSummaryInDir(msDir);
        if (!summaryPath) continue;

        const scores = extractScores(summaryPath);
        const systemKey = `${msName}-${model}`;
        result[key][systemKey] = {
          weighted_average: scores.weighted_average,
          z_score: scores.z_score
        };
      }
    }
  }
}

console.log(JSON.stringify(result, null, 2));