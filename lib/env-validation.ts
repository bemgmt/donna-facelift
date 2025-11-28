/**
 * Environment validation utilities
 * Part of WS1 Phase 1 Security Hardening
 */

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  config: Record<string, unknown>
}

const REQUIRED_PRODUCTION_VARS = [
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const RECOMMENDED_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'ALLOWED_ORIGINS',
  'PRODUCTION_DOMAIN'
]

const SECURITY_VARS = [
  'JWT_SECRET',
  'ENABLE_API_SECURITY',
  'AUTH_DISABLE_CLERK'
]

function validateEnvVar(name: string, value: string | undefined, required: boolean = false): {
  valid: boolean
  error?: string
  warning?: string
} {
  if (!value) {
    return required
      ? { valid: false, error: `${name} is required but not set` }
      : { valid: true, warning: `${name} is not set (optional)` }
  }

  switch (name) {
    case 'OPENAI_API_KEY':
      if (!value.startsWith('sk-')) return { valid: false, error: `${name} should start with 'sk-'` }
      if (value.length < 20) return { valid: false, error: `${name} appears to be too short` }
      break
    case 'NEXT_PUBLIC_SUPABASE_URL':
    case 'SENTRY_DSN':
    case 'NEXT_PUBLIC_SENTRY_DSN':
      try { new URL(value) } catch { return { valid: false, error: `${name} must be a valid URL` } }
      break
    case 'SUPABASE_SERVICE_ROLE_KEY':
    case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
      if (value.length < 100) return { valid: false, error: `${name} appears to be too short for a Supabase key` }
      break
    case 'CLERK_PUBLISHABLE_KEY':
    case 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY':
      if (!value.startsWith('pk_')) return { valid: false, error: `${name} should start with 'pk_'` }
      break
    case 'CLERK_SECRET_KEY':
      if (!value.startsWith('sk_')) return { valid: false, error: `${name} should start with 'sk_'` }
      break
    case 'ALLOWED_ORIGINS': {
      const origins = value.split(',').map(o => o.trim())
      for (const origin of origins) {
        if (origin !== 'localhost' && origin !== '*') {
          try { new URL(origin) } catch { return { valid: false, error: `Invalid origin in ${name}: ${origin}` } }
        }
      }
      break
    }
    case 'ENABLE_API_SECURITY':
    case 'AUTH_DISABLE_CLERK':
      if (!['true', 'false'].includes(value.toLowerCase())) return { valid: false, error: `${name} must be 'true' or 'false'` }
      break
  }
  return { valid: true }
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const config: Record<string, unknown> = {}

  const isProduction = process.env.NODE_ENV === 'production'

  const requiredVars = isProduction ? REQUIRED_PRODUCTION_VARS : []
  for (const varName of requiredVars) {
    const result = validateEnvVar(varName, process.env[varName], true)
    if (!result.valid && result.error) errors.push(result.error)
    else if (result.warning) warnings.push(result.warning)
    config[varName] = process.env[varName] || null
  }

  for (const varName of RECOMMENDED_VARS) {
    const result = validateEnvVar(varName, process.env[varName], false)
    if (!result.valid && result.error) errors.push(result.error)
    else if (result.warning) warnings.push(result.warning)
    config[varName] = process.env[varName] || null
  }

  for (const varName of SECURITY_VARS) {
    const result = validateEnvVar(varName, process.env[varName], false)
    if (!result.valid && result.error) errors.push(result.error)
    else if (result.warning) warnings.push(result.warning)
    config[varName] = process.env[varName] || null
  }

  if (isProduction) {
    const hasClerk = (process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && process.env.CLERK_SECRET_KEY
    const hasJWT = process.env.JWT_SECRET
    const clerkDisabled = process.env.AUTH_DISABLE_CLERK?.toLowerCase() === 'true'
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY
    if (publishableKey && publishableKey.includes('_test_')) errors.push('Clerk publishable key must use production credentials')
    if (process.env.CLERK_SECRET_KEY?.includes('_test_')) errors.push('Clerk secret key must use production credentials')
    if (clerkDisabled) errors.push('AUTH_DISABLE_CLERK must be false in production')
    if (!hasClerk && !hasJWT && !clerkDisabled) warnings.push('No authentication method configured (Clerk or JWT)')

    const securityEnabled = process.env.ENABLE_API_SECURITY?.toLowerCase() === 'true'
    if (!securityEnabled) warnings.push('API security is not explicitly enabled in production')

    if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) warnings.push('No Sentry monitoring configured for production')
  }

  return { valid: errors.length === 0, errors, warnings, config }
}

export function getSecurityConfig() {
  return {
    securityEnabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_API_SECURITY === 'true',
    clerkEnabled: !!((process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && process.env.CLERK_SECRET_KEY) && process.env.AUTH_DISABLE_CLERK?.toLowerCase() !== 'true',
    jwtEnabled: !!process.env.JWT_SECRET,
    sentryEnabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://donna-interactive.vercel.app'
    ]
  }
}

export function logEnvironmentValidation() {
  const result = validateEnvironment()
  if (result.errors.length > 0) {
    console.error('Environment validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
  }
  if (result.warnings.length > 0) {
    console.warn('Environment warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  if (result.valid && result.warnings.length === 0) {
    console.log('Environment validation passed')
  }

  const config = getSecurityConfig()
  console.log('Security configuration:', {
    securityEnabled: config.securityEnabled,
    clerkEnabled: config.clerkEnabled,
    jwtEnabled: config.jwtEnabled,
    sentryEnabled: config.sentryEnabled,
    allowedOrigins: (config.allowedOrigins || []).length
  })

  return result
}
