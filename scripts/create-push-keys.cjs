// Run locally once; enter the values in Netlify's environment settings.
const webpush=require('web-push');
const keys=webpush.generateVAPIDKeys();
console.log('PLANNING_PUSH_PUBLIC_KEY='+keys.publicKey);
console.log('PLANNING_PUSH_PRIVATE_KEY='+keys.privateKey);
console.log('PLANNING_PUSH_SUBJECT=https://tcboden.se');
