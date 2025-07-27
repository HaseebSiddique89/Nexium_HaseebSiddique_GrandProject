/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {}
    for (const [name, values] of this.metrics) {
      result[name] = {
        average: this.getAverageMetric(name),
        count: values.length
      }
    }
    return result
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * Performance decorator for measuring function execution time
 */
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const stopTimer = performanceMonitor.startTimer(name)
      try {
        const result = await originalMethod.apply(this, args)
        stopTimer()
        return result
      } catch (error) {
        stopTimer()
        throw error
      }
    }

    return descriptor
  }
}

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  const stopTimer = performanceMonitor.startTimer(`${componentName} render`)
  
  // Stop timer after render
  setTimeout(stopTimer, 0)
} 