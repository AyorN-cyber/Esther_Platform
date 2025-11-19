/**
 * PWA Installation Debug Tool
 * Run this in browser console to diagnose PWA installation issues
 */

(async function debugPWA() {
  console.log('='.repeat(60));
  console.log('PWA INSTALLATION DEBUG TOOL');
  console.log('='.repeat(60));
  console.log('');

  // 1. Check HTTPS
  console.log('1️⃣ CHECKING HTTPS...');
  if (location.protocol === 'https:' || location.hostname === 'localhost') {
    console.log('✅ HTTPS: OK');
  } else {
    console.log('❌ HTTPS: FAILED - PWA requires HTTPS');
  }
  console.log('');

  // 2. Check Service Worker Support
  console.log('2️⃣ CHECKING SERVICE WORKER SUPPORT...');
  if ('serviceWorker' in navigator) {
    console.log('✅ Service Worker: Supported');
    
    // Check if registered
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      console.log(`✅ Service Worker: ${registrations.length} registered`);
      registrations.forEach((reg, i) => {
        console.log(`   ${i + 1}. Scope: ${reg.scope}`);
        console.log(`      State: ${reg.active ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('⚠️ Service Worker: Not registered yet');
    }
  } else {
    console.log('❌ Service Worker: Not supported');
  }
  console.log('');

  // 3. Check Manifest
  console.log('3️⃣ CHECKING MANIFEST...');
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log('✅ Manifest link found:', manifestLink.href);
    
    try {
      const response = await fetch(manifestLink.href);
      if (response.ok) {
        const manifest = await response.json();
        console.log('✅ Manifest loaded successfully');
        console.log('   Name:', manifest.name);
        console.log('   Short name:', manifest.short_name);
        console.log('   Start URL:', manifest.start_url);
        console.log('   Display:', manifest.display);
        console.log('   Icons:', manifest.icons?.length || 0);
        
        // Check required icons
        const has192 = manifest.icons?.some(i => i.sizes === '192x192');
        const has512 = manifest.icons?.some(i => i.sizes === '512x512');
        if (has192 && has512) {
          console.log('✅ Required icons (192x192, 512x512): Present');
        } else {
          console.log('⚠️ Required icons: Missing');
          if (!has192) console.log('   Missing: 192x192');
          if (!has512) console.log('   Missing: 512x512');
        }
      } else {
        console.log('❌ Manifest: Failed to load (HTTP', response.status + ')');
      }
    } catch (error) {
      console.log('❌ Manifest: Error loading', error.message);
    }
  } else {
    console.log('❌ Manifest: Link not found in HTML');
  }
  console.log('');

  // 4. Check if already installed
  console.log('4️⃣ CHECKING INSTALLATION STATUS...');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  if (isStandalone || isIOSStandalone) {
    console.log('✅ App is INSTALLED (running in standalone mode)');
  } else {
    console.log('⚠️ App is NOT installed (running in browser)');
  }
  console.log('');

  // 5. Check install prompt availability
  console.log('5️⃣ CHECKING INSTALL PROMPT...');
  console.log('⏳ Waiting for beforeinstallprompt event...');
  
  let promptReceived = false;
  const promptTimeout = setTimeout(() => {
    if (!promptReceived) {
      console.log('⚠️ Install prompt NOT received after 3 seconds');
      console.log('');
      console.log('POSSIBLE REASONS:');
      console.log('  • App is already installed');
      console.log('  • User previously dismissed prompt (Chrome blocks for 3 months)');
      console.log('  • Browser doesn\'t support PWA install (Firefox desktop)');
      console.log('  • Not enough user engagement (need 30+ seconds)');
      console.log('  • PWA requirements not fully met');
      console.log('');
      printSummary();
    }
  }, 3000);

  window.addEventListener('beforeinstallprompt', (e) => {
    promptReceived = true;
    clearTimeout(promptTimeout);
    console.log('✅ Install prompt AVAILABLE!');
    console.log('   App can be installed');
    console.log('');
    printSummary();
  });

  // 6. Browser info
  console.log('6️⃣ BROWSER INFORMATION...');
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  console.log('Browser:', browser);
  console.log('Platform:', navigator.platform);
  console.log('Mobile:', /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Yes' : 'No');
  console.log('');

  function printSummary() {
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    if (isStandalone || isIOSStandalone) {
      console.log('✅ App is already installed!');
      console.log('   You\'re running in standalone mode.');
    } else if (promptReceived) {
      console.log('✅ App can be installed!');
      console.log('   Look for:');
      console.log('   • Install icon in address bar');
      console.log('   • Floating "Install App" button');
      console.log('   • Browser menu → "Install app"');
    } else {
      console.log('⚠️ App cannot be installed right now');
      console.log('');
      console.log('TROUBLESHOOTING:');
      console.log('1. Make sure you\'re on HTTPS');
      console.log('2. Wait 30+ seconds and interact with page');
      console.log('3. Check if already installed');
      console.log('4. Try incognito/private mode');
      console.log('5. Use Chrome or Edge (best support)');
      console.log('6. Check browser console for errors');
    }
    
    console.log('');
    console.log('='.repeat(60));
  }
})();
