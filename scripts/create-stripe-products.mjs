import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

async function createProducts() {
  console.log("🛍️  Creating Stripe products and prices...\n");

  try {
    // Create Premium Monthly Product
    const monthlyProduct = await stripe.products.create({
      name: "AWS AI Tutor Pro - Premium Monthly",
      description: "Premium subscription with full access to all AWS exam questions, AI tutor, and advanced analytics",
    });
    console.log(`✓ Created product: ${monthlyProduct.id} (${monthlyProduct.name})`);

    // Create Monthly Price
    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 999, // $9.99
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });
    console.log(`✓ Created price: ${monthlyPrice.id} ($9.99/month)`);

    // Create Premium Annual Product
    const annualProduct = await stripe.products.create({
      name: "AWS AI Tutor Pro - Premium Annual",
      description: "Premium subscription with full access - save 17% with annual billing",
    });
    console.log(`✓ Created product: ${annualProduct.id} (${annualProduct.name})`);

    // Create Annual Price
    const annualPrice = await stripe.prices.create({
      product: annualProduct.id,
      unit_amount: 9999, // $99.99
      currency: "usd",
      recurring: {
        interval: "year",
      },
    });
    console.log(`✓ Created price: ${annualPrice.id} ($99.99/year)`);

    console.log("\n📋 Summary - Add these IDs to server/products.ts:");
    console.log(`   Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`   Annual Price ID: ${annualPrice.id}`);
    console.log("\n✅ Successfully created Stripe products and prices!");

    return {
      monthly: { productId: monthlyProduct.id, priceId: monthlyPrice.id },
      annual: { productId: annualProduct.id, priceId: annualPrice.id },
    };
  } catch (error) {
    console.error("❌ Error creating Stripe products:", error.message);
    process.exit(1);
  }
}

createProducts();
