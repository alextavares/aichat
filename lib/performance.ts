import { z } from 'zod'

export interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  cacheHitRate: number
  queueLength: number
  memoryUsage: number
  cpuUsage: number
  timestamp: Date
}

export interface CacheConfig {
  ttl: number // Time to live in seconds
  maxSize: number // Maximum number of entries
  strategy: 'lru' | 'lfu' | 'fifo'
  compression: boolean
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
}

// Simple in-memory cache with LRU eviction
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number
  private ttl: number

  constructor(maxSize: number = 1000, ttl: number = 3600) {
    this.maxSize = maxSize
    this.ttl = ttl * 1000 // Convert to milliseconds
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key)
    if (item) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, item)
    }
    return item
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Request queue for managing concurrent API calls
class RequestQueue {
  private queue: Array<{
    id: string
    request: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
    priority: number
    timestamp: Date
  }> = []
  
  private processing = 0
  private maxConcurrent: number

  constructor(maxConcurrent: number = 10) {
    this.maxConcurrent = maxConcurrent
  }

  async add<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: crypto.randomUUID(),
        request,
        resolve,
        reject,
        priority,
        timestamp: new Date()
      })

      // Sort by priority (higher priority first)
      this.queue.sort((a, b) => b.priority - a.priority)
      
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()!
    this.processing++

    try {
      const result = await item.request()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.processing--
      this.processQueue() // Process next item
    }
  }

  getQueueLength(): number {
    return this.queue.length
  }

  getProcessingCount(): number {
    return this.processing
  }
}

// Rate limiter using sliding window
class RateLimiter {
  private windows = new Map<string, number[]>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    if (!this.windows.has(identifier)) {
      this.windows.set(identifier, [])
    }

    const requests = this.windows.get(identifier)!
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart)
    this.windows.set(identifier, validRequests)

    // Check if limit is exceeded
    if (validRequests.length >= this.config.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    if (!this.windows.has(identifier)) {
      return this.config.maxRequests
    }

    const requests = this.windows.get(identifier)!
    const validRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, this.config.maxRequests - validRequests.length)
  }

  getResetTime(identifier: string): Date {
    const now = Date.now()
    
    if (!this.windows.has(identifier)) {
      return new Date(now + this.config.windowMs)
    }

    const requests = this.windows.get(identifier)!
    const oldestRequest = Math.min(...requests, now)
    
    return new Date(oldestRequest + this.config.windowMs)
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private caches = new Map<string, LRUCache<string, any>>()
  private requestQueue: RequestQueue
  private rateLimiters = new Map<string, RateLimiter>()

  constructor() {
    this.requestQueue = new RequestQueue(20) // Max 20 concurrent requests
    this.startMetricsCollection()
  }

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  // Cache management
  createCache(
    name: string, 
    config: CacheConfig = {
      ttl: 3600,
      maxSize: 1000,
      strategy: 'lru',
      compression: false
    }
  ): void {
    this.caches.set(name, new LRUCache(config.maxSize, config.ttl))
  }

  getFromCache<T>(cacheName: string, key: string): T | undefined {
    const cache = this.caches.get(cacheName)
    return cache?.get(key)
  }

  setCache<T>(cacheName: string, key: string, value: T): void {
    const cache = this.caches.get(cacheName)
    cache?.set(key, value)
  }

  clearCache(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    cache?.clear()
  }

  getCacheStats(cacheName: string) {
    const cache = this.caches.get(cacheName)
    return {
      size: cache?.size() || 0,
      maxSize: 1000, // Would be stored in config
      hitRate: 0 // Would be calculated from hit/miss counters
    }
  }

  // Request queuing
  async queueRequest<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return this.requestQueue.add(request, priority)
  }

  getQueueStatus() {
    return {
      queueLength: this.requestQueue.getQueueLength(),
      processing: this.requestQueue.getProcessingCount()
    }
  }

  // Rate limiting
  createRateLimiter(name: string, config: RateLimitConfig): void {
    this.rateLimiters.set(name, new RateLimiter(config))
  }

  checkRateLimit(limiterName: string, identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: Date
  } {
    const limiter = this.rateLimiters.get(limiterName)
    if (!limiter) {
      throw new Error(`Rate limiter '${limiterName}' not found`)
    }

    return {
      allowed: limiter.isAllowed(identifier),
      remaining: limiter.getRemainingRequests(identifier),
      resetTime: limiter.getResetTime(identifier)
    }
  }

  // Performance metrics
  recordMetric(metric: Partial<PerformanceMetrics>): void {
    const fullMetric: PerformanceMetrics = {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0,
      queueLength: this.requestQueue.getQueueLength(),
      memoryUsage: 0,
      cpuUsage: 0,
      timestamp: new Date(),
      ...metric
    }

    this.metrics.push(fullMetric)
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift()
    }
  }

  getMetrics(period: { start: Date; end: Date }): PerformanceMetrics[] {
    return this.metrics.filter(m => 
      m.timestamp >= period.start && m.timestamp <= period.end
    )
  }

  getAverageMetrics(period: { start: Date; end: Date }) {
    const metrics = this.getMetrics(period)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => ({
      responseTime: acc.responseTime + m.responseTime,
      throughput: acc.throughput + m.throughput,
      errorRate: acc.errorRate + m.errorRate,
      cacheHitRate: acc.cacheHitRate + m.cacheHitRate,
      queueLength: acc.queueLength + m.queueLength,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      cpuUsage: acc.cpuUsage + m.cpuUsage
    }), {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0,
      queueLength: 0,
      memoryUsage: 0,
      cpuUsage: 0
    })

    const count = metrics.length
    return {
      responseTime: sum.responseTime / count,
      throughput: sum.throughput / count,
      errorRate: sum.errorRate / count,
      cacheHitRate: sum.cacheHitRate / count,
      queueLength: sum.queueLength / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count
    }
  }

  // System health check
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical'
    checks: Array<{
      name: string
      status: 'pass' | 'fail'
      message: string
    }>
  } {
    const checks = []
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Check queue length
    const queueLength = this.requestQueue.getQueueLength()
    if (queueLength > 100) {
      checks.push({
        name: 'Queue Length',
        status: 'fail' as const,
        message: `Queue too long: ${queueLength} requests`
      })
      overallStatus = 'critical'
    } else if (queueLength > 50) {
      checks.push({
        name: 'Queue Length',
        status: 'fail' as const,
        message: `Queue getting long: ${queueLength} requests`
      })
      if (overallStatus === 'healthy') overallStatus = 'warning'
    } else {
      checks.push({
        name: 'Queue Length',
        status: 'pass' as const,
        message: `Queue normal: ${queueLength} requests`
      })
    }

    // Check error rate
    const recentMetrics = this.getMetrics({
      start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      end: new Date()
    })

    if (recentMetrics.length > 0) {
      const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
      
      if (avgErrorRate > 0.1) { // >10% error rate
        checks.push({
          name: 'Error Rate',
          status: 'fail' as const,
          message: `High error rate: ${(avgErrorRate * 100).toFixed(1)}%`
        })
        overallStatus = 'critical'
      } else if (avgErrorRate > 0.05) { // >5% error rate
        checks.push({
          name: 'Error Rate',
          status: 'fail' as const,
          message: `Elevated error rate: ${(avgErrorRate * 100).toFixed(1)}%`
        })
        if (overallStatus === 'healthy') overallStatus = 'warning'
      } else {
        checks.push({
          name: 'Error Rate',
          status: 'pass' as const,
          message: `Error rate normal: ${(avgErrorRate * 100).toFixed(1)}%`
        })
      }
    }

    return { status: overallStatus, checks }
  }

  private startMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      // In a real implementation, this would collect actual system metrics
      this.recordMetric({
        responseTime: Math.random() * 1000 + 200,
        throughput: Math.random() * 100 + 50,
        errorRate: Math.random() * 0.05,
        cacheHitRate: 0.8 + Math.random() * 0.2,
        memoryUsage: 50 + Math.random() * 30,
        cpuUsage: 20 + Math.random() * 40
      })
    }, 30000)
  }

  // Request/response timing wrapper
  async measureRequest<T>(
    name: string,
    request: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    let error: Error | null = null

    try {
      const result = await request()
      return result
    } catch (err) {
      error = err as Error
      throw err
    } finally {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      this.recordMetric({
        responseTime,
        errorRate: error ? 1 : 0,
        timestamp: new Date(endTime)
      })
    }
  }

  // Optimization suggestions
  getOptimizationSuggestions(): Array<{
    type: 'cache' | 'queue' | 'ratelimit' | 'system'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    impact: string
  }> {
    const suggestions = []
    const queueLength = this.requestQueue.getQueueLength()
    const recentMetrics = this.getAverageMetrics({
      start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      end: new Date()
    })

    if (queueLength > 20) {
      suggestions.push({
        type: 'queue' as const,
        priority: 'high' as const,
        title: 'Increase Concurrent Request Limit',
        description: 'Queue is consistently long, consider increasing max concurrent requests',
        impact: 'Reduce user wait times by 20-30%'
      })
    }

    if (recentMetrics && recentMetrics.cacheHitRate < 0.6) {
      suggestions.push({
        type: 'cache' as const,
        priority: 'medium' as const,
        title: 'Improve Cache Strategy',
        description: 'Cache hit rate is low, review caching strategy and TTL settings',
        impact: 'Reduce response times by 40-50%'
      })
    }

    if (recentMetrics && recentMetrics.responseTime > 2000) {
      suggestions.push({
        type: 'system' as const,
        priority: 'high' as const,
        title: 'Optimize Response Times',
        description: 'Average response time is high, consider request optimization',
        impact: 'Improve user experience significantly'
      })
    }

    return suggestions
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Initialize common caches and rate limiters
performanceMonitor.createCache('responses', {
  ttl: 3600, // 1 hour
  maxSize: 10000,
  strategy: 'lru',
  compression: true
})

performanceMonitor.createCache('user-sessions', {
  ttl: 1800, // 30 minutes
  maxSize: 5000,
  strategy: 'lru',
  compression: false
})

performanceMonitor.createRateLimiter('api-calls', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

performanceMonitor.createRateLimiter('chat-messages', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  skipSuccessfulRequests: false,
  skipFailedRequests: true
})

export type { PerformanceMetrics, CacheConfig, RateLimitConfig }