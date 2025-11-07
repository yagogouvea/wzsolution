'use client';

import { useState, useCallback } from 'react';
import type { 
  ProjectPrompt, 
  TemplateResult, 
  AIGeneratorState,
  GenerationStatus 
} from '../types/ai-generator.types';

export function useAIGenerator() {
  const [state, setState] = useState<AIGeneratorState>({
    isGenerating: false,
    status: {
      step: 'analyzing',
      progress: 0,
      message: 'Pronto para gerar'
    },
    result: null,
    error: null
  });

  const updateStatus = useCallback((status: Partial<GenerationStatus>) => {
    setState(prev => ({
      ...prev,
      status: { ...prev.status, ...status }
    }));
  }, []);

  const generateTemplate = useCallback(async (prompt: ProjectPrompt) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      result: null
    }));

    try {
      // Step 1: Analisar projeto
      updateStatus({
        step: 'analyzing',
        progress: 10,
        message: 'Analisando seu projeto...'
      });

      const analysisResponse = await fetch('/api/ai-dev/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });

      if (!analysisResponse.ok) {
        throw new Error('Erro na análise do projeto');
      }

      const analysisData = await analysisResponse.json();

      // Step 2: Gerar wireframes
      updateStatus({
        step: 'generating-wireframes',
        progress: 40,
        message: 'Criando wireframes...'
      });

      const wireframesResponse = await fetch('/api/ai-dev/generate-wireframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData.analysis)
      });

      if (!wireframesResponse.ok) {
        throw new Error('Erro na geração de wireframes');
      }

      const wireframesData = await wireframesResponse.json();

      // Step 3: Calcular estimativa
      updateStatus({
        step: 'calculating-estimate',
        progress: 70,
        message: 'Calculando estimativas...'
      });

      const estimateResponse = await fetch('/api/ai-dev/estimate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysisData.analysis,
          techStack: analysisData.techStack
        })
      });

      if (!estimateResponse.ok) {
        throw new Error('Erro no cálculo de estimativas');
      }

      const estimateData = await estimateResponse.json();

      // Consolidar resultado
      const result: TemplateResult = {
        id: `template_${Date.now()}`,
        timestamp: new Date().toISOString(),
        prompt,
        analysis: analysisData.analysis,
        wireframes: wireframesData.wireframes,
        techStack: analysisData.techStack,
        estimate: estimateData.estimate
      };

      updateStatus({
        step: 'completed',
        progress: 100,
        message: 'Template gerado com sucesso!'
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        result
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      updateStatus({
        step: 'error',
        progress: 0,
        message: errorMessage
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));
    }
  }, [updateStatus]);

  const clearResult = useCallback(() => {
    setState({
      isGenerating: false,
      status: {
        step: 'analyzing',
        progress: 0,
        message: 'Pronto para gerar'
      },
      result: null,
      error: null
    });
  }, []);

  return {
    ...state,
    generateTemplate,
    clearResult
  };
}








