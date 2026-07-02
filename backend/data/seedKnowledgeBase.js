const dns=require("dns")
dns.setServers(["8.8.8.8","8.8.4.4"])
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const VectorDocument = require('../models/VectorDocument');
const geminiService = require('../services/geminiService');

dotenv.config({ path: path.join(__dirname, '../.env') });
console.log("GROQ Key:", process.env.GROQ_API_KEY);

const articles = [
  {
    title: "Managing Blood Sugar and Diabetes Prevention",
    category: "diabetes",
    content: "To manage blood sugar levels effectively, focus on consuming low-glycemic index (GI) foods such as oats, legumes, non-starchy vegetables, and lean proteins. Consistent daily walk routines (at least 30 minutes after meals) improve insulin sensitivity. Keep fasting blood sugar levels between 70-100 mg/dL. Elevated blood sugar over 126 mg/dL consistently suggests diabetes risk, requiring clinical consultation."
  },
  {
    title: "Hypertension, Sodium Intake, and Heart Health",
    category: "heart_health",
    content: "High blood pressure (Hypertension) is a significant risk factor for cardiovascular disease. Aim to keep blood pressure under 120/80 mmHg. Reduce daily sodium intake to less than 1,500 - 2,000 mg. Eat potassium-rich foods like bananas, spinach, and avocados to offset sodium. Weekly cardiovascular exercise (150 minutes of jogging, swimming, or cycling) strengthens the heart muscle and lowers resting heart rate."
  },
  {
    title: "Optimizing Sleep Quality and Circadian Rhythms",
    category: "sleep",
    content: "Adequate sleep (7 to 9 hours for adults) is vital for physical recovery and hormonal balance. To optimize sleep quality, maintain a cool, dark room, avoid screen exposure (blue light) at least 60 minutes before bed, and set a strict bedtime schedule. Logging low sleep quality (rating 1-2) consistently triggers elevated stress hormones, which disrupts morning blood sugar stability and cardiac resting rate."
  },
  {
    title: "Hydration Guidelines for Metabolic Performance",
    category: "nutrition",
    content: "Adequate daily water intake is necessary for cellular function, temperature regulation, and fat metabolism. Men should aim for approximately 3.2 liters and women 2.5 liters of clean water daily. Staying hydrated reduces blood viscosity, helps control blood sugar spikes, flushes cellular wastes, and supports muscle recovery following fitness workouts."
  },
  {
    title: "Macronutrient Balance and Healthy Diet Profiles",
    category: "nutrition",
    content: "A balanced diet relies on proper proportions of macronutrients: protein (for muscle retention and repair), carbohydrates (for primary fuel), and healthy fats (for hormonal synthesis). Focus on whole foods, lean poultry, fresh-caught fish, and complex carbs (quinoa, brown rice) while avoiding processed foods high in trans fats and simple refined sugars."
  },
  {
    title: "Stress Reduction, Box Breathing, and Anxiety Relief",
    category: "stress",
    content: "Chronic stress elevates cortisol, leading to weight gain, high blood pressure, and poor sleep. Combat anxiety using the 4-7-8 Box Breathing technique: inhale for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Practicing mindfulness meditation for 10-15 minutes daily helps lower blood pressure, reduce anxiety, and stabilize resting heart rate."
  }
];

const seedDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personalized_health';
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB for vector seeding...");

    // Clear existing vector articles
    await VectorDocument.deleteMany({});
    console.log("Cleared old knowledge base entries.");

    for (const article of articles) {
      console.log(`Generating embedding for article: "${article.title}"`);
      // Call embedding API
      const embedding = await geminiService.generateEmbeddings(article.content);
      
      await VectorDocument.create({
        title: article.title,
        category: article.category,
        content: article.content,
        embedding
      });
    }

    console.log("Successfully seeded knowledge base with AI embeddings!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed knowledge base:", error);
    process.exit(1);
  }
};

seedDB();
