// src/binanceService.ts
import axios from 'axios';

type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
};
import moment from 'moment';
import { CONFIG } from './config.js';

// Detailed interface for Binance API response
interface CandlestickData {
    0: number;   // Open time
    1: string;   // Open price
    2: string;   // High price
    3: string;   // Low price
    4: string;   // Close price
    5: string;   // Volume
    // Other potential fields can be added as needed
}

export class BinanceService {
    private baseUrl = CONFIG.BINANCE_BASE_URL;

    async getMovingAverages(symbol: string, interval: string, periods: number) {
        try {
            const response: AxiosResponse<CandlestickData[]> = await axios.get(`${this.baseUrl}/api/v3/klines`, {
                params: {
                    symbol,
                    interval,
                    limit: periods
                }
            });

            // Type-safe data extraction
            const closes = response.data.map((candle: CandlestickData) => parseFloat(candle[4]));
            const movingAverage = this.calculateMovingAverage(closes);

            return {
                symbol,
                interval,
                movingAverage,
                timestamps: response.data.map((candle: CandlestickData) => 
                    moment(candle[0]).format('YYYY-MM-DD HH:mm:ss')
                )
            };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            throw error;
        }
    }

    private calculateMovingAverage(prices: number[]): number {
        const sum = prices.reduce((a, b) => a + b, 0);
        return sum / prices.length;
    }

    async getAllMovingAverages() {
        const results = [];
        for (const coin of CONFIG.COINS) {
            const shortTermMA = await this.getMovingAverages(coin, CONFIG.INTERVALS.SHORT, 20);
            const mediumTermMA = await this.getMovingAverages(coin, CONFIG.INTERVALS.MEDIUM, 20);
            const longTermMA = await this.getMovingAverages(coin, CONFIG.INTERVALS.LONG, 20);

            results.push({
                coin,
                shortTerm: shortTermMA,
                mediumTerm: mediumTermMA,
                longTerm: longTermMA
            });
        }
        return results;
    }
}
