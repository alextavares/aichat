#!/usr/bin/env node

/**
 * Digital Ocean Deployment Status Checker
 * 
 * This script checks the deployment status and helps diagnose issues
 */

const https = require('https')

const PRODUCTION_URL = 'https://seahorse-app-k5pag.ondigitalocean.app'
const HEALTH_ENDPOINT = `${PRODUCTION_URL}/api/health`

console.log('🔍 Checking Digital Ocean deployment status...\n')

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        })
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function checkDeploymentStatus() {
  console.log(`📡 Testing connection to: ${PRODUCTION_URL}`)
  
  try {
    // Test main URL
    console.log('\n1. Testing main application URL...')
    const mainResponse = await makeRequest(PRODUCTION_URL)
    console.log(`   Status: ${mainResponse.statusCode}`)
    
    if (mainResponse.statusCode === 200) {
      console.log('   ✅ Main application is accessible')
    } else {
      console.log(`   ⚠️  Unexpected status code: ${mainResponse.statusCode}`)
    }
    
    // Test health endpoint
    console.log('\n2. Testing health endpoint...')
    const healthResponse = await makeRequest(HEALTH_ENDPOINT)
    console.log(`   Status: ${healthResponse.statusCode}`)
    
    if (healthResponse.statusCode === 200) {
      console.log('   ✅ Health endpoint is working')
      
      try {
        const healthData = JSON.parse(healthResponse.body)
        console.log('\n📊 Deployment Information:')
        console.log(`   Environment: ${healthData.deployment?.environment || 'unknown'}`)
        console.log(`   Version: ${healthData.deployment?.version || 'unknown'}`)
        console.log(`   Commit: ${healthData.deployment?.commit || 'unknown'}`)
        console.log(`   Build Time: ${healthData.timestamp}`)
        
        console.log('\n🔧 Services Status:')
        console.log(`   Database: ${healthData.services?.database || 'unknown'}`)
        console.log(`   Auth: ${healthData.services?.auth || 'unknown'}`)
        console.log(`   MercadoPago: ${healthData.services?.payments?.mercadopago || 'unknown'}`)
        console.log(`   Stripe: ${healthData.services?.payments?.stripe || 'unknown'}`)
        console.log(`   OpenRouter: ${healthData.services?.ai?.openrouter || 'unknown'}`)
        
        // Check for issues
        const issues = []
        if (healthData.services?.database?.includes('error')) {
          issues.push('Database connection failed')
        }
        if (healthData.services?.auth === 'missing_secret') {
          issues.push('NextAuth secret not configured')
        }
        if (healthData.services?.payments?.mercadopago === 'missing_token') {
          issues.push('MercadoPago token not configured')
        }
        
        if (issues.length > 0) {
          console.log('\n⚠️  Issues detected:')
          issues.forEach(issue => console.log(`   - ${issue}`))
        } else {
          console.log('\n✅ All services appear to be configured correctly')
        }
        
      } catch (parseError) {
        console.log('   ⚠️  Could not parse health response:', parseError.message)
      }
    } else {
      console.log(`   ❌ Health endpoint returned status: ${healthResponse.statusCode}`)
    }
    
    console.log('\n🎯 Deployment Status: SUCCESS')
    console.log(`   Your application is deployed and accessible at: ${PRODUCTION_URL}`)
    
  } catch (error) {
    console.log('\n❌ Deployment Status: FAILED or NOT ACCESSIBLE')
    console.log(`   Error: ${error.message}`)
    
    console.log('\n🔧 Possible causes:')
    console.log('   - Deployment is still in progress')
    console.log('   - Build failed due to TypeScript errors')
    console.log('   - Environment variables not configured')
    console.log('   - Digital Ocean app not properly connected to GitHub')
    
    console.log('\n📋 Troubleshooting steps:')
    console.log('   1. Check Digital Ocean App Platform dashboard')
    console.log('   2. Verify GitHub repository connection')
    console.log('   3. Check build logs for errors')
    console.log('   4. Ensure all environment variables are set')
  }
}

// Additional checks
async function checkGitHubConnection() {
  console.log('\n🔗 Checking GitHub integration...')
  
  // Check if latest commit was pushed
  try {
    const { execSync } = require('child_process')
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim()
    
    console.log(`   Local commit:  ${localCommit.substring(0, 8)}`)
    console.log(`   Remote commit: ${remoteCommit.substring(0, 8)}`)
    
    if (localCommit === remoteCommit) {
      console.log('   ✅ Local and remote commits match')
    } else {
      console.log('   ⚠️  Local and remote commits differ - run git push')
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check git status: ${error.message}`)
  }
}

// Run checks
async function main() {
  await checkGitHubConnection()
  await checkDeploymentStatus()
  
  console.log('\n📍 Next steps if deployment failed:')
  console.log('   - Check Digital Ocean dashboard for build logs')
  console.log('   - Verify app.yaml configuration')
  console.log('   - Ensure environment variables are properly set')
  console.log('   - Run: npm run deploy-production locally to test build')
}

main().catch(console.error)