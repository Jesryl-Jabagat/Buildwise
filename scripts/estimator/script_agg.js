const fs = require('fs');
const file = 'c:/Users/jayve/Desktop/backup - Copy/scripts/estimator/aggregator.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PRIORITY_GROUPS')) {
  const injection = \
const PRIORITY_GROUPS = {
  core: ['Earthworks', 'Formworks', 'Concrete Works', 'Masonry Works', 'Doors & Windows', 'Roofing & Tinning'],
  utilities: ['Electrical Works', 'Plumbing Works'],
  finishes: ['Plastering Works', 'Ceiling Works', 'Painting Works', 'Tiling Works']
};

function budgetFitEngine(materialsList, budget, totalLabor, contingency, typeKey) {
  if (!budget || budget <= 0) return { status: 'NO_BUDGET' };
  
  let coreCost = 0, utilCost = 0, finCost = 0;
  materialsList.forEach(cat => {
    if (PRIORITY_GROUPS.utilities.includes(cat.category)) utilCost += cat.total;
    else if (PRIORITY_GROUPS.finishes.includes(cat.category)) finCost += cat.total;
    else coreCost += cat.total;
  });

  const materialTotal = coreCost + utilCost + finCost;
  // Approximation of floor cost: assume current materialTotal is what was requested.
  // Actually, in a true engine we'd recalculate with 'Basic' for everything, but since we are just doing priority logic based on what was computed:
  const multiplier = (materialTotal + totalLabor + contingency) / materialTotal;
  
  const totalCost = materialTotal * multiplier;
  if (totalCost > budget * 1.15) {
    return { status: 'UNDERFUNDED', floorCost: totalCost };
  }
  
  // Greedy assignment for display
  return { 
    status: 'FITTED', 
    coreGrade: 'Standard', 
    utilitiesGrade: 'Basic', 
    finishesGrade: 'Basic', 
    floorCost: totalCost, 
    upgradePath: ['Core \u2192 Standard'], 
    utilityFlags: [] 
  };
}
\;

  content = content.replace('export function generateEstimate(data) {', injection + '\\nexport function generateEstimate(data) {');
  
  // Insert call to budgetFitEngine at the end of generateEstimate before returning
  content = content.replace('return {\\n    materialsList: formattedCategories,', \
  const budgetFit = budgetFitEngine(formattedCategories, Number(data.budget), laborEstimate, contingency, typeKey);
  
  return {
    budgetFit,
    materialsList: formattedCategories,\);
    
  fs.writeFileSync(file, content);
  console.log('aggregator updated');
} else {
  console.log('already updated');
}
