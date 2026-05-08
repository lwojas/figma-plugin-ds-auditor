export function calculateScore(data: any, targetCoverage = 0.5) {
  const componentScore = calculateComponentScore(data); // 0–1
  const textScore = calculateTextScore(data); // 0–1
  const colorScore = calculateColorScore(data); // 0–1

  // Apply weights: Components 50%, Text 30%, Colors 20%
  let weightedScore = componentScore * 0.5 + textScore * 0.3 + colorScore * 0.2;
  console.log("Weighted score before penalty: ", weightedScore);
  // Penalty: If any category is 0%, apply a 10% penalty to the total
  // if (componentScore === 0 || textScore === 0 || colorScore === 0) {
  //   weightedScore *= 0.5;
  // }
  return Math.round(weightedScore * 100);
}

export function calculateComponentScore(data: any) {
  const {
    uniqueDsysComponents,
    uniqueNonDsysComponents,
    nonDsysComponents,
    totalComponents,
  } = data;

  if (totalComponents === 0) return 0; // No components = score 0

  const instanceScore = 1 - nonDsysComponents.length / totalComponents;
  const uniqueDsys = Object.keys(uniqueDsysComponents).length;
  const uniqueTotal = uniqueDsys + Object.keys(uniqueNonDsysComponents).length;
  console.log(uniqueTotal);
  const uniqueScore = uniqueTotal > 0 ? uniqueDsys / uniqueTotal : 0;

  // Weight: instanceScore (70%), uniqueScore (30%)
  return instanceScore * 0.7 + uniqueScore * 0.3;
}

export function normalizeScore(rawScore: number, targetCoverage: number = 0.5) {
  // Scale relative to target, but also cap by the absolute raw score
  const scaled = rawScore * targetCoverage;
  // Instead of multiplying to 100 immediately, we rescale and clamp
  const normalized = Math.min(scaled, 1) * 100;

  return Math.round(normalized);
}

export function calculateTextScore(data: any) {
  const totalTextNodes = Math.max(data.totalTextNodes, 1); // avoid /0

  // Score based on proportion of DSYS styled text nodes
  const styledScore = data.dsysStyledTextCount / totalTextNodes;

  // Unique style diversity score
  const uniqueDsysTextStyleCount = Object.keys(data.dsysTextStyles).length;
  const uniqueNonDsysTextStyleCount = Object.keys(
    data.nonDsysTextStyles,
  ).length;
  const uniqueTotal = uniqueDsysTextStyleCount + uniqueNonDsysTextStyleCount;

  const uniqueScore = uniqueDsysTextStyleCount / Math.max(uniqueTotal, 1);

  // Blend: style usage (70%) + unique styles used (30%)
  return styledScore * 0.7 + uniqueScore * 0.3;
}

export function calculateColorScore(data: any) {
  // Instance-level score (per assignment)
  const instanceScore =
    1 - data.nonDsysColorFills.length / Math.max(data.totalColors, 1);

  // Unique token coverage
  const uniqueDsysCount = Object.keys(data.dsysColorTokens).length;
  const uniqueNonDsysCount = Object.keys(data.nonDsysColorTokens).length;
  const uniqueTotal = uniqueDsysCount + uniqueNonDsysCount;

  const uniqueScore = uniqueDsysCount / Math.max(uniqueTotal, 1);

  // Weight instance score (70%) and unique score (30%)
  return instanceScore * 0.7 + uniqueScore * 0.3;
}
