// scripts/scrape.js
/**
 * Basketball Payment Manager MVP
 * Gameday Scraper Script
 * 
 * Instructions:
 * 1. Ensure you have installed cheerio: `npm i cheerio`
 * 2. Update the `GAMEDAY_URL` below with your team's specific URL.
 * 3. Inspect your Gameday HTML and update the selectors (e.g. `.match-row`, `.player-points`) to match the page's actual CSS classes.
 * 4. Run `node scripts/scrape.js`
 */

const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const GAMEDAY_URL = 'https://websites.mygameday.app/YOUR_TEAM_URL_HERE'; // <--- UPDATE THIS

async function scrapeGameday() {
    console.log('Fetching data from', GAMEDAY_URL);

    if (GAMEDAY_URL.includes('YOUR_TEAM_URL')) {
        console.log('Please update GAMEDAY_URL in the script to your actual team page URL.');
        return;
    }

    try {
        const response = await fetch(GAMEDAY_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        // This logic relies on the specific HTML structure of the Gameday page.
        // Replace `.match-row` and `.player-row` with the actual elements you inspect.

        const gamesScraped = [];

        // Example logic snippet:
        /*
        $('.match-row').each((_, element) => {
          const opponent = $(element).find('.opponent-name').text().trim();
          const date = $(element).find('.match-date').text().trim();
          const ourScore = parseInt($(element).find('.our-score').text().trim());
          const oppScore = parseInt($(element).find('.opp-score').text().trim());
          
          const playerStats = [];
          $(element).find('.player-row').each((_, row) => {
             const name = $(row).find('.player-name').text().trim();
             const points = parseInt($(row).find('.player-points').text().trim());
             playerStats.push({ name, points });
          });
    
          const result = ourScore > oppScore ? 'W' : ourScore < oppScore ? 'L' : 'D';
    
          gamesScraped.push({ opponent, date: new Date(date), teamScore: ourScore, opponentScore: oppScore, result, season: 'Imported', playerStats });
        });
        */

        console.log(`Scraped ${gamesScraped.length} games. Customize the traversal logic to map data.`);

        /* Example DB Insert Logic
        for (const game of gamesScraped) {
          // 1. Resolve players
          const dbPlayerStats = [];
          for (const stat of game.playerStats) {
            // Warning: This requires the Player model to have a unique constraint on 'name' or use findFirst
            let player = await prisma.player.findFirst({ where: { name: stat.name } });
            if (!player) {
              player = await prisma.player.create({ data: { name: stat.name, active: true } });
            }
            dbPlayerStats.push({ playerId: player.id, points: stat.points });
          }
          
          // 2. Insert Game
          await prisma.game.create({
            data: {
              opponent: game.opponent,
              date: game.date,
              teamScore: game.teamScore,
              opponentScore: game.opponentScore,
              result: game.result,
              season: game.season,
              GameStats: {
                create: dbPlayerStats
              }
            }
          });
          console.log('Inserted game vs', game.opponent);
        }
        */

    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

scrapeGameday();
