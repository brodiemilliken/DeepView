/**
 * Get the color for a given weight.
 * @param {number} weight - The weight value.
 * @returns {string} - The color corresponding to the weight.
 */
export const getColorForWeight = (weight) => {
  const alpha = Math.min(1, Math.abs(weight) * 4); // Alpha transparency based on weight
  return weight > 0 ? `rgba(0, 0, 255, ${alpha})` : `rgba(255, 0, 0, ${alpha})`; // Apply alpha transparency
};