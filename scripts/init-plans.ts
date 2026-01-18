import { initializePricingPlans } from '@/lib/billing';

async function main() {
  try {
    console.log('Initializing pricing plans...');
    await initializePricingPlans();
    console.log('Pricing plans initialized successfully!');
  } catch (error) {
    console.error('Error initializing pricing plans:', error);
    process.exit(1);
  }
}

main();