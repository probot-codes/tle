
const fs = require('fs');
const path = require('path');

const scraperFilePath = path.join(__dirname, '../utils/contestScraper.js');


let content = fs.readFileSync(scraperFilePath, 'utf8');


const upcomingBlock = content.match(/\.filter\(contest => contest\.phase === 'BEFORE'\)[^}]*?\{([^]*?)\}/s);


if (upcomingBlock && upcomingBlock[1]) {
  const updatedUpcomingBlock = upcomingBlock[1].replace(
    'return {', 
    `
          let slug = '';
          if (contest.name) {
            
            const roundMatch = contest.name.match(/Round\\s+(\\d+)/i);
            const divMatch = contest.name.match(/Div\\.?\\s*(\\d+)/i);
            
            if (roundMatch) {
              slug = \`round\${roundMatch[1]}\`;
              if (divMatch) {
                slug += \`-div\${divMatch[1]}\`;
              }
            } else if (contest.name.includes('Educational')) {
              const eduMatch = contest.name.match(/Educational.*?(\\d+)/i);
              if (eduMatch) {
                slug = \`educational\${eduMatch[1]}\`;
              } else {
                slug = 'educational';
              }
            } else {
              slug = contest.name.toLowerCase()
                .replace(/[^\\w\\s-]/g, '')
                .replace(/\\s+/g, '-')
                .substring(0, 30);
            }
          }
          
          if (!slug) {
            slug = \`cf-\${contest.id}\`;
          }
          
          return {
            slug,`
  );
  
  
  content = content.replace(upcomingBlock[0], upcomingBlock[0].replace(upcomingBlock[1], updatedUpcomingBlock));
  
  
  fs.writeFileSync(scraperFilePath, content, 'utf8');
  
  console.log('Successfully updated contestScraper.js with slug generation for upcoming Codeforces contests.');
} else {
  console.error('Could not find the contest.phase === "BEFORE" block in contestScraper.js');
}
