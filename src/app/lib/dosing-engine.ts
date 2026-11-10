import { analyzeWater } from './waterAnalysis';

interface AnalyzeParams {
  volume: number;
  ph?: number;
  chlorine?: number;
  alkalinity?: number;
  hardness?: number;
  temperature?: number;
  orp?: number;
}

export const dosingEngine = {
  analyze: (params: AnalyzeParams) => {
    const { volume, ...waterParams } = params;
    
    // Map chlorine to freeChlorine for waterAnalysis
    const analysisParams = {
      pH: waterParams.ph,
      freeChlorine: waterParams.chlorine,
      alkalinity: waterParams.alkalinity,
      hardness: waterParams.hardness,
      temperature: waterParams.temperature,
      orp: waterParams.orp,
    };
    
    return analyzeWater(analysisParams, volume);
  }
};
