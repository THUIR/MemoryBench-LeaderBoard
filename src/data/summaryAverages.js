import summaryAverages from './summaryAverages.json';

export default summaryAverages;
export { summaryAverages };

export function getBenchmarkScores(benchmarkId, systemKey) {
  const benchData = summaryAverages[benchmarkId];
  if (!benchData) return null;
  const sysData = benchData[systemKey];
  if (!sysData) return null;
  return {
    weighted_average: sysData.weighted_average,
    z_score: sysData.z_score
  };
}

export function getAllBenchmarkSystems(benchmarkId) {
  return summaryAverages[benchmarkId] || {};
}