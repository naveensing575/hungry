import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all test users (using lower rounds for faster seeding)
  console.log('Hashing passwords...');
  const hashedPassword = await bcrypt.hash('password123', 5);
  console.log('Password hashed successfully');

  // Create test users
  console.log('Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      country: 'INDIA',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@test.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER',
      country: 'INDIA',
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@test.com',
      password: hashedPassword,
      name: 'Member User',
      role: 'MEMBER',
      country: 'AMERICA',
    },
  });

  console.log('✅ Created 3 test users');

  // Create restaurants in India
  const spiceGarden = await prisma.restaurant.create({
    data: {
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with traditional spices',
      country: 'INDIA',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    },
  });

  const curryHouse = await prisma.restaurant.create({
    data: {
      name: 'Curry House',
      description: 'Home-style Indian curries and breads',
      country: 'INDIA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    },
  });

  // Create restaurants in America
  const burgerPalace = await prisma.restaurant.create({
    data: {
      name: 'Burger Palace',
      description: 'Classic American burgers and fries',
      country: 'AMERICA',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    },
  });

  const pizzaParadise = await prisma.restaurant.create({
    data: {
      name: 'Pizza Paradise',
      description: 'New York style pizza and Italian classics',
      country: 'AMERICA',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    },
  });

  console.log('✅ Created 4 restaurants (2 in India, 2 in America)');

  // Create menu items for Spice Garden (India)
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato sauce',
        price: 350,
        category: 'Main Course',
        restaurantId: spiceGarden.id,
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with spices',
        price: 280,
        category: 'Appetizer',
        restaurantId: spiceGarden.id,
        imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300',
      },
      {
        name: 'Biryani',
        description: 'Fragrant basmati rice with aromatic spices',
        price: 320,
        category: 'Main Course',
        restaurantId: spiceGarden.id,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
      },
      {
        name: 'Garlic Naan',
        description: 'Soft flatbread with garlic and butter',
        price: 60,
        category: 'Bread',
        restaurantId: spiceGarden.id,
      },
    ],
  });

  // Create menu items for Curry House (India)
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Dal Makhani',
        description: 'Creamy black lentils slow-cooked overnight',
        price: 200,
        category: 'Main Course',
        restaurantId: curryHouse.id,
      },
      {
        name: 'Chicken Tikka Masala',
        description: 'Grilled chicken in spiced curry sauce',
        price: 340,
        category: 'Main Course',
        restaurantId: curryHouse.id,
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes',
        price: 80,
        category: 'Appetizer',
        restaurantId: curryHouse.id,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300',
      },
    ],
  });

  // Create menu items for Burger Palace (America)
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, and tomato',
        price: 12.99,
        category: 'Burgers',
        restaurantId: burgerPalace.id,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
      },
      {
        name: 'Bacon Deluxe',
        description: 'Double patty with crispy bacon and special sauce',
        price: 15.99,
        category: 'Burgers',
        restaurantId: burgerPalace.id,
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: 4.99,
        category: 'Sides',
        restaurantId: burgerPalace.id,
      },
      {
        name: 'Milkshake',
        description: 'Creamy vanilla milkshake',
        price: 5.99,
        category: 'Beverages',
        restaurantId: burgerPalace.id,
      },
    ],
  });

  // Create menu items for Pizza Paradise (America)
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        price: 14.99,
        category: 'Pizza',
        restaurantId: pizzaParadise.id,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
      },
      {
        name: 'Pepperoni Special',
        description: 'Loaded with pepperoni and extra cheese',
        price: 16.99,
        category: 'Pizza',
        restaurantId: pizzaParadise.id,
      },
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with caesar dressing',
        price: 8.99,
        category: 'Salads',
        restaurantId: pizzaParadise.id,
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 6.99,
        category: 'Appetizer',
        restaurantId: pizzaParadise.id,
      },
    ],
  });

  console.log('✅ Created 15 menu items across all restaurants');

  // Create a payment method for admin user
  await prisma.paymentMethod.create({
    data: {
      userId: adminUser.id,
      type: 'credit_card',
      cardLastFour: '4242',
      cardBrand: 'Visa',
      isDefault: true,
    },
  });

  await prisma.paymentMethod.create({
    data: {
      userId: managerUser.id,
      type: 'debit_card',
      cardLastFour: '5555',
      cardBrand: 'MasterCard',
      isDefault: true,
    },
  });

  console.log('✅ Created payment methods for admin and manager');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Test Users:');
  console.log('   Admin:   admin@test.com    (INDIA)');
  console.log('   Manager: manager@test.com  (INDIA)');
  console.log('   Member:  member@test.com   (AMERICA)');
  console.log('   Password for all: password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
