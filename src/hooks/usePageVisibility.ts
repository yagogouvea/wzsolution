'use client';

import { useEffect, useRef, useState } from 'react';

interface PageVisibilityState {
  isVisible: boolean;
  wasHidden: boolean;
  hiddenAt: number | null;
}

/**
 * Hook para gerenciar visibilidade da página e persistência de estado
 * Resolve problemas de iOS que pausa JavaScript quando app vai para background
 */
export function usePageVisibility() {
  const [visibility, setVisibility] = useState<PageVisibilityState>({
    isVisible: typeof document !== 'undefined' ? !document.hidden : true,
    wasHidden: false,
    hiddenAt: null
  });

  const visibilityRef = useRef(visibility);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      const wasHidden = !isVisible && visibilityRef.current.isVisible;
      const hiddenAt = wasHidden ? Date.now() : null;

      const newState: PageVisibilityState = {
        isVisible,
        wasHidden,
        hiddenAt
      };

      visibilityRef.current = newState;
      setVisibility(newState);

      console.log('👁️ [PageVisibility] Mudança de visibilidade:', {
        isVisible,
        wasHidden,
        hiddenAt,
        visibilityState: document.visibilityState,
        timestamp: new Date().toISOString()
      });
    };

    // Verificar estado inicial
    handleVisibilityChange();

    // Adicionar listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return visibility;
}

/**
 * Hook para persistir e restaurar estado quando página volta ao foco
 */
export function useStatePersistence<T>(
  key: string,
  initialState: T,
  options?: {
    enabled?: boolean;
    storage?: 'localStorage' | 'sessionStorage';
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
) {
  const {
    enabled = true,
    storage = 'sessionStorage',
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options || {};

  const [state, setState] = useState<T>(() => {
    if (!enabled || typeof window === 'undefined') return initialState;

    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      const saved = storageObj.getItem(key);
      if (saved) {
        const parsed = deserialize(saved);
        console.log(`💾 [StatePersistence] Estado restaurado de ${storage}:`, key, parsed);
        return parsed;
      }
    } catch (error) {
      console.warn(`⚠️ [StatePersistence] Erro ao restaurar estado de ${storage}:`, error);
    }

    return initialState;
  });

  const visibility = usePageVisibility();

  // Salvar estado quando página fica invisível
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !visibility.wasHidden) return;

    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
      storageObj.setItem(key, serialize(state));
      console.log(`💾 [StatePersistence] Estado salvo em ${storage} quando página ficou invisível:`, key, state);
    } catch (error) {
      console.warn(`⚠️ [StatePersistence] Erro ao salvar estado em ${storage}:`, error);
    }
  }, [visibility.wasHidden, state, key, enabled, storage, serialize]);

  // Salvar estado periodicamente enquanto visível (backup)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !visibility.isVisible) return;

    const interval = setInterval(() => {
      try {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        storageObj.setItem(key, serialize(state));
      } catch (error) {
        console.warn(`⚠️ [StatePersistence] Erro ao salvar backup:`, error);
      }
    }, 5000); // Salvar a cada 5 segundos

    return () => clearInterval(interval);
  }, [visibility.isVisible, state, key, enabled, storage, serialize]);

  return [state, setState] as const;
}

/**
 * Hook para manter timer funcionando mesmo quando página está em background
 * Calcula tempo decorrido baseado em timestamps salvos
 */
export function useBackgroundTimer(
  startTime: Date | null,
  isActive: boolean
) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const visibility = usePageVisibility();
  const lastUpdateRef = useRef<number>(Date.now());
  const savedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!startTime || !isActive) {
      setElapsedTime(0);
      savedTimeRef.current = 0;
      return;
    }

    // Calcular tempo já decorrido
    const initialElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    savedTimeRef.current = initialElapsed;
    setElapsedTime(initialElapsed);

    // Salvar timestamp quando página fica invisível
    if (visibility.wasHidden && visibility.hiddenAt) {
      const elapsedWhenHidden = Math.floor((visibility.hiddenAt - startTime.getTime()) / 1000);
      savedTimeRef.current = elapsedWhenHidden;
      
      // Salvar no sessionStorage para recuperar depois
      try {
        sessionStorage.setItem('timer_startTime', startTime.getTime().toString());
        sessionStorage.setItem('timer_elapsedWhenHidden', elapsedWhenHidden.toString());
        sessionStorage.setItem('timer_hiddenAt', visibility.hiddenAt.toString());
        console.log('⏱️ [BackgroundTimer] Timer salvo quando página ficou invisível:', {
          elapsedWhenHidden,
          hiddenAt: new Date(visibility.hiddenAt).toISOString()
        });
      } catch (error) {
        console.warn('⚠️ [BackgroundTimer] Erro ao salvar timer:', error);
      }
    }

    // Quando página volta a ficar visível, calcular tempo decorrido
    if (visibility.isVisible && visibility.wasHidden && visibility.hiddenAt) {
      try {
        const savedStartTime = sessionStorage.getItem('timer_startTime');
        const savedElapsed = sessionStorage.getItem('timer_elapsedWhenHidden');
        const savedHiddenAt = sessionStorage.getItem('timer_hiddenAt');

        if (savedStartTime && savedElapsed && savedHiddenAt) {
          const startTimeMs = parseInt(savedStartTime, 10);
          const elapsedWhenHidden = parseInt(savedElapsed, 10);
          const hiddenAtMs = parseInt(savedHiddenAt, 10);
          const now = Date.now();
          
          // Tempo que passou enquanto estava escondido
          const timeHidden = Math.floor((now - hiddenAtMs) / 1000);
          
          // Tempo total = tempo decorrido antes + tempo que passou escondido
          const totalElapsed = elapsedWhenHidden + timeHidden;
          
          savedTimeRef.current = totalElapsed;
          setElapsedTime(totalElapsed);
          
          console.log('⏱️ [BackgroundTimer] Timer restaurado quando página voltou:', {
            elapsedWhenHidden,
            timeHidden,
            totalElapsed,
            now: new Date(now).toISOString(),
            hiddenAt: new Date(hiddenAtMs).toISOString()
          });
        }
      } catch (error) {
        console.warn('⚠️ [BackgroundTimer] Erro ao restaurar timer:', error);
      }
    }

    // Atualizar timer enquanto visível
    if (visibility.isVisible) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        lastUpdateRef.current = now;
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, isActive, visibility.isVisible, visibility.wasHidden, visibility.hiddenAt]);

  return elapsedTime;
}

