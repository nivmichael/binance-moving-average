import { BinanceService } from './binanceService.js';

async function main() {
    const binanceService = new BinanceService();
    
    try {
        const movingAverages = await binanceService.getAllMovingAverages();
        console.log(JSON.stringify(movingAverages, null, 2));
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main().catch(console.error);