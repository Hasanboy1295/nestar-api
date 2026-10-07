import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI env variable is required");
  process.exit(1);
}

const properties = [
  {
    title: "Skyline Villa with Panorama View",
    type: "VILLA",
    purpose: "SALE",
    price: 850000,
    city: "Tashkent",
    district: "Chilonzor",
    address: "Bunyodkor ko'chasi 12",
    beds: 6,
    baths: 5,
    area: 520,
    description:
      "Premium two-floor villa with a private garden, floor-to-ceiling windows and a breathtaking city panorama. Smart-home system, heated floors and a double garage included.",
    features: ["Smart home", "Private garden", "Double garage", "Panorama view", "Heated floors"],
    isFeatured: true,
    agentName: "Dilnoza Karimova",
    agentNick: "dilnoza",
    agentPhone: "+998 90 123 45 67",
  },
  {
    title: "Modern Apartment in Tashkent City",
    type: "APARTMENT",
    purpose: "SALE",
    price: 320000,
    city: "Tashkent",
    district: "Shayxontohur",
    address: "Tashkent City Park, bino 4",
    beds: 3,
    baths: 2,
    area: 148,
    description:
      "Bright corner apartment in the heart of Tashkent City. European renovation, fully furnished, walking distance to parks, malls and business district.",
    features: ["Furnished", "Corner unit", "Concierge", "Parking", "New build"],
    isFeatured: true,
    agentName: "Sardor Rahimov",
    agentNick: "sardor",
    agentPhone: "+998 90 987 65 43",
  },
  {
    title: "Cozy 2-Room Apartment, Yunusobod",
    type: "APARTMENT",
    purpose: "SALE",
    price: 145000,
    city: "Tashkent",
    district: "Yunusobod",
    address: "Amir Temur ko'chasi 108",
    beds: 2,
    baths: 1,
    area: 74,
    description:
      "Warm and quiet apartment near the metro. Renovated in 2024, new kitchen, built-in wardrobes, ideal for a small family or investment.",
    features: ["Near metro", "Renovated 2024", "Balcony", "Security"],
    isFeatured: false,
    agentName: "Aziza Tursunova",
    agentNick: "aziza",
    agentPhone: "+998 93 555 44 33",
  },
  {
    title: "Business Loft for Rent — Mirzo Ulug'bek",
    type: "COMMERCIAL",
    purpose: "RENT",
    price: 1800,
    city: "Tashkent",
    district: "Mirzo Ulug'bek",
    address: "Buyuk Ipak Yuli 15",
    beds: 0,
    baths: 2,
    area: 210,
    description:
      "Open-space loft ideal for a startup, studio or showroom. Two meeting rooms, high-speed internet, central AC and 24/7 access.",
    features: ["24/7 access", "Meeting rooms", "High-speed internet", "Central AC"],
    isFeatured: false,
    agentName: "Sardor Rahimov",
    agentNick: "sardor",
    agentPhone: "+998 90 987 65 43",
  },
  {
    title: "Family House with Big Yard — Sergeli",
    type: "HOUSE",
    purpose: "SALE",
    price: 265000,
    city: "Tashkent",
    district: "Sergeli",
    address: "Yangi Sergeli 7-mavze",
    beds: 5,
    baths: 3,
    area: 310,
    description:
      "Spacious family house on a quiet street with a fruit garden, summer kitchen and garage. Everything is connected: gas, water, electricity.",
    features: ["Fruit garden", "Summer kitchen", "Garage", "Quiet street"],
    isFeatured: false,
    agentName: "Dilnoza Karimova",
    agentNick: "dilnoza",
    agentPhone: "+998 90 123 45 67",
  },
  {
    title: "Premium Studio for Rent — Amir Temur",
    type: "APARTMENT",
    purpose: "RENT",
    price: 650,
    city: "Tashkent",
    district: "Shayxontohur",
    address: "Amir Temur shoh ko'chasi 15",
    beds: 1,
    baths: 1,
    area: 46,
    description:
      "Fully furnished studio with city view, ideal for a single professional. Weekly cleaning included in the price.",
    features: ["Furnished", "City view", "Weekly cleaning", "Pets allowed"],
    isFeatured: false,
    agentName: "Aziza Tursunova",
    agentNick: "aziza",
    agentPhone: "+998 93 555 44 33",
  },
  {
    title: "Land Plot 10 ares — Qibray",
    type: "LAND",
    purpose: "SALE",
    price: 48000,
    city: "Tashkent",
    district: "Qibray",
    address: "Qibray tumani, 4-mavze",
    beds: 0,
    baths: 0,
    area: 1000,
    description:
      "Clean titled land plot on a paved road, perfect for a private house or small warehouse. All utilities at the border.",
    features: ["Paved road", "Utilities ready", "Clean title"],
    isFeatured: false,
    agentName: "Jasur Ochilov",
    agentNick: "jasur",
    agentPhone: "+998 97 222 33 44",
  },
  {
    title: "Penthouse with Terrace — Tashkent City",
    type: "APARTMENT",
    purpose: "SALE",
    price: 690000,
    city: "Tashkent",
    district: "Shayxontohur",
    address: "Tashkent City, bino 1",
    beds: 4,
    baths: 3,
    area: 260,
    description:
      "Two-level penthouse with a private terrace, fireplace and skyline views. Premium materials, home cinema and private elevator access.",
    features: ["Terrace", "Private elevator", "Home cinema", "Fireplace"],
    isFeatured: true,
    agentName: "Dilnoza Karimova",
    agentNick: "dilnoza",
    agentPhone: "+998 90 123 45 67",
  },
  {
    title: "Renovated 3-Room Apartment — Olmazar",
    type: "APARTMENT",
    purpose: "SALE",
    price: 175000,
    city: "Tashkent",
    district: "Olmazar",
    address: "Universitet ko'chasi 42",
    beds: 3,
    baths: 1,
    area: 96,
    description:
      "Bright apartment in a courtyard building, close to universities and the metro. New plumbing and electrical, ready to move in.",
    features: ["Near metro", "Courtyard", "New renovation"],
    isFeatured: false,
    agentName: "Aziza Tursunova",
    agentNick: "aziza",
    agentPhone: "+998 93 555 44 33",
  },
  {
    title: "Warehouse 800 m² — Yashnobod",
    type: "COMMERCIAL",
    purpose: "RENT",
    price: 4200,
    city: "Tashkent",
    district: "Yashnobod",
    address: "Farg'ona yo'li 210",
    beds: 0,
    baths: 1,
    area: 800,
    description:
      "Modern warehouse with loading docks, 6-meter ceilings and security. Direct truck access, office space included.",
    features: ["Loading docks", "6m ceilings", "Security", "Office included"],
    isFeatured: false,
    agentName: "Jasur Ochilov",
    agentNick: "jasur",
    agentPhone: "+998 97 222 33 44",
  },
  {
    title: "Townhouse near Charvak Lake",
    type: "HOUSE",
    purpose: "SALE",
    price: 395000,
    city: "Tashkent",
    district: "Bo'stonliq",
    address: "Charvak suv bo'yi",
    beds: 4,
    baths: 3,
    area: 240,
    description:
      "Weekend townhouse 40 minutes from the city with a lake view, barbecue area and private beach access.",
    features: ["Lake view", "BBQ area", "Private beach", "Parking"],
    isFeatured: true,
    agentName: "Jasur Ochilov",
    agentNick: "jasur",
    agentPhone: "+998 97 222 33 44",
  },
  {
    title: "1-Room Apartment for Rent — Chilonzor",
    type: "APARTMENT",
    purpose: "RENT",
    price: 420,
    city: "Tashkent",
    district: "Chilonzor",
    address: "Chilonzor 19-kvartal",
    beds: 1,
    baths: 1,
    area: 38,
    description:
      "Neat one-room apartment with new furniture, near metro and supermarkets. Long-term rent preferred.",
    features: ["Furnished", "Near metro", "Long-term"],
    isFeatured: false,
    agentName: "Sardor Rahimov",
    agentNick: "sardor",
    agentPhone: "+998 90 987 65 43",
  },
];

async function run() {
  try {
    await mongoose.connect(uri);
    const collection = mongoose.connection.db.collection("listings");
    const existing = await collection.countDocuments({
      title: { $exists: true },
      status: "ACTIVE",
    });

    if (existing > 0) {
      console.log(`Seed skipped — ${existing} properties already exist`);
    } else {
      const now = new Date();
      const docs = properties.map((property, index) => ({
        ...property,
        currency: "USD",
        views: 120 + index * 37,
        status: "ACTIVE",
        createdAt: new Date(now.getTime() - index * 86_400_000),
        updatedAt: now,
      }));
      const result = await collection.insertMany(docs);
      console.log(`Seeded ${result.length} properties`);
    }

    const total = await collection.countDocuments({
      title: { $exists: true },
      status: "ACTIVE",
    });
    console.log(`Total active properties in DB: ${total}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

run();
