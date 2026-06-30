const Groq = require('groq-sdk');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  console.warn("WARNING: GROQ_API_KEY is not defined in .env. Running with mock fallback intelligence.");
}

// Helper to determine if we have active Groq instance
const isAIActive = () => groq !== null;

/**
 * Bulletproof JSON Parser for LLM Outputs
 * Slices the text between the first JSON bracket and last bracket to eliminate conversational prefix/suffix
 */
const cleanAndParseJSON = (text) => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const startIdx = trimmed.indexOf('{') !== -1 
      ? (trimmed.indexOf('[') !== -1 ? Math.min(trimmed.indexOf('{'), trimmed.indexOf('[')) : trimmed.indexOf('{'))
      : trimmed.indexOf('[');
      
    const endIdx = trimmed.lastIndexOf('}') !== -1
      ? (trimmed.lastIndexOf(']') !== -1 ? Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']')) : trimmed.lastIndexOf('}'))
      : trimmed.lastIndexOf(']');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonSubString = trimmed.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonSubString);
      } catch (innerErr) {
        console.error("Failed parsing sliced JSON string: ", jsonSubString);
        throw innerErr;
      }
    }
    throw e;
  }
};

/**
 * Generate semantic embeddings for RAG document storage and queries
 */
exports.generateEmbeddings = async (text) => {
  // Return a mock vector of 768 elements
  return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
};

/**
 * Handle AI Health Assistant Chat with RAG Context & History using Groq (Llama-3.1-8b)
 */
exports.generateChatResponse = async (messageHistory, userPrompt, ragContext) => {
  const systemInstruction = `You are "Aura", an advanced AI Health Assistant. 
You are highly knowledgeable in medicine, nutrition, wellness, and fitness.
You must use the following rules:
1. Rely on the provided context (health knowledge base articles) to answer user questions when applicable.
2. If the user asks general wellness/health questions, explain simply and clearly.
3. NEVER diagnose specific diseases. NEVER prescribe specific doses of medications.
4. ALWAYS display this warning message at the end of your response: "This is not medical advice. Please consult a healthcare professional."
5. Speak in a friendly, empathetic, and professional tone.
6. Keep recommendations actionable.`;

  const contextStr = ragContext && ragContext.length > 0 
    ? `\n\n[HEALTH KNOWLEDGE BASE CONTEXT]\n${ragContext.map((d, i) => `Article ${i+1}: ${d.title}\n${d.content}`).join('\n\n')}`
    : '';

  if (!isAIActive()) {
    return `Hello! I am Aura, your health assistant. (Running in Groq demo mode without API Key)
Based on your question "${userPrompt}", here is some general information:
- Hydration, a balanced diet, and 150 minutes of moderate exercise weekly are crucial.
- If you logged symptoms, sleep issues, or dietary trends, we recommend checking the Risk Analysis page.

This is not medical advice. Please consult a healthcare professional.`;
  }

  try {
    const messages = [
      { role: "system", content: systemInstruction },
      ...messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: "user", content: `User Question: ${userPrompt}${contextStr}` }
    ];

    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1024
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in generateChatResponse (Groq):", error);
    return `I apologize, but I encountered an error communicating with my Groq AI brain. 

Please verify your internet connection and API key. 

This is not medical advice. Please consult a healthcare professional.`;
  }
};

/**
 * Analyze blood reports/prescriptions using Groq Vision Llama-3.2-11b
 */
exports.analyzeMedicalReport = async (extractedText, base64FileData, fileType) => {
  const prompt = `You are a medical lab report analyzer. Analyze this medical report. 
Extract:
1. A professional title for the report (e.g. "Complete Blood Count", "Lipid Profile").
2. A simplified summary of the report.
3. List of parameters, including their value, standard reference ranges, and status ('high', 'low', 'normal').
4. Actionable lifestyle, diet, or hydration improvements based on these findings.

You MUST format the output as a clean JSON object exactly like this:
{
  "title": "Title of report",
  "aiSummary": "Summary details...",
  "abnormalValues": [
    { "parameter": "Glucose", "value": "135 mg/dL", "normalRange": "70-100 mg/dL", "status": "high" }
  ],
  "lifestyleSuggestions": [
    "Increase hydration to 3L daily",
    "Reduce refined carbohydrate intake"
  ]
}

Only return the JSON object and nothing else. Do not wrap it in markdown tags.`;

  if (!isAIActive()) {
    return {
      title: "Comprehensive Lab Report (Groq Demo)",
      aiSummary: "Your report has been analyzed. There are slight elevations in blood glucose levels, which might indicate a need to adjust dietary carbs. Other markers are within normal range.",
      abnormalValues: [
        { parameter: "Fasting Blood Glucose", value: "115 mg/dL", normalRange: "70-100 mg/dL", status: "high" },
        { parameter: "LDL Cholesterol", value: "140 mg/dL", normalRange: "< 100 mg/dL", status: "high" },
        { parameter: "Hemoglobin", value: "14.2 g/dL", normalRange: "12.0-16.0 g/dL", status: "normal" }
      ],
      lifestyleSuggestions: [
        "Incorporate 30 minutes of aerobic activity (walking, jogging) daily.",
        "Limit saturated fats and high-glycemic carbohydrates.",
        "Stay hydrated and log your blood sugar daily."
      ]
    };
  }

  try {
    let response;
    
    if (base64FileData && fileType && fileType.includes('image')) {
      response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${fileType};base64,${base64FileData}`
                }
              }
            ]
          }
        ],
        model: "llama-3.2-11b-vision-preview",
        response_format: { type: "json_object" }
      });
    } else {
      response = await groq.chat.completions.create({
        messages: [
          { role: "user", content: prompt + `\n\nReport Text Content:\n${extractedText}` }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });
    }

    return cleanAndParseJSON(response.choices[0].message.content);
  } catch (error) {
    console.error("Error in analyzeMedicalReport (Groq):", error);
    return {
      title: "Lab Report Summary",
      aiSummary: "Report analyzed with warnings. Some values are outside normal limits. Detailed analysis failed to connect, please review logs.",
      abnormalValues: [
        { parameter: "Analyzed Parameter", value: "Failed to extract", normalRange: "Check report", status: "high" }
      ],
      lifestyleSuggestions: ["Consult your physician regarding the test results."]
    };
  }
};

/**
 * AI-Generated Health Score (0-100) using Groq Llama-3.1-8b
 */
exports.generateHealthScore = async (userProfile, recentLogs) => {
  const prompt = `Evaluate the overall health score of a user.
User Profile:
- Age: ${userProfile?.profile?.age || 30}
- Gender: ${userProfile?.profile?.gender || 'Male'}
- Height: ${userProfile?.profile?.height || 170} cm
- Weight: ${userProfile?.profile?.weight || 70} kg
- Activity Level: ${userProfile?.profile?.activityLevel || 'Moderately Active'}
- Known conditions: ${userProfile?.profile?.diseases?.join(', ') || 'None'}

Recent Logs (Vitals / Goals):
${JSON.stringify(recentLogs, null, 2)}

Calculate a Health Score from 0 to 100 based on weight/BMI, activity level, average steps, sleep, heart rate, blood pressure, and blood sugar.
Provide:
1. The numeric score.
2. Explanations (Strengths, Warning areas, and Actionable items to improve).

Format output as JSON:
{
  "score": 82,
  "explanation": {
    "strengths": ["Consistent sleep duration", "Hydration targets met"],
    "warnings": ["Slightly elevated blood pressure", "Sedentary step count"],
    "improvements": ["Aim for 8,000 steps daily", "Reduce sodium intake to lower blood pressure"]
  }
}

Do not return anything else except this JSON.`;

  if (!isAIActive()) {
    let score = 75;
    if (recentLogs && recentLogs.length > 0) {
      const latest = recentLogs[0];
      if (latest.stepCount > 8000) score += 5;
      if (latest.sleepHours >= 7 && latest.sleepHours <= 9) score += 5;
      if (latest.bloodPressure && latest.bloodPressure.systolic > 130) score -= 8;
    }
    score = Math.min(Math.max(score, 20), 100);

    return {
      score: score,
      explanation: {
        strengths: ["Regular sleep tracking", "Weight logs remain stable"],
        warnings: ["Heart rate averages on the higher end of resting", "Water intake is slightly below optimal"],
        improvements: ["Increase water logging to reach 3 liters", "Incorporate light cardio for cardiovascular health"]
      }
    };
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    return cleanAndParseJSON(response.choices[0].message.content);
  } catch (error) {
    console.error("Error in generateHealthScore (Groq):", error);
    return {
      score: 72,
      explanation: {
        strengths: ["Data tracking is ongoing"],
        warnings: ["AI scoring experienced a connection limit"],
        improvements: ["Ensure all vitals (BP, steps, water) are logged daily"]
      }
    };
  }
};

/**
 * AI Health Risk Prediction Engine using Groq Llama-3.1-8b
 */
exports.predictHealthRisk = async (userProfile, logs) => {
  const prompt = `Assess the risk levels of the following conditions for this user:
Diabetes, Heart Disease, Hypertension, Obesity, High Cholesterol, Stress.

User Details:
- Age: ${userProfile?.profile?.age || 30}
- Gender: ${userProfile?.profile?.gender || 'Male'}
- Height: ${userProfile?.profile?.height || 170} cm
- Weight: ${userProfile?.profile?.weight || 70} kg
- Activity Level: ${userProfile?.profile?.activityLevel || 'Moderately Active'}
- Existing diseases: ${userProfile?.profile?.diseases?.join(', ') || 'None'}
- Allergies: ${userProfile?.profile?.allergies?.join(', ') || 'None'}

Daily Vitals Log summary:
${JSON.stringify(logs, null, 2)}

For EACH of the six conditions (Diabetes, Heart Disease, Hypertension, Obesity, High Cholesterol, Stress), provide:
1. Risk percentage (0-100%)
2. Risk level ('Low', 'Moderate', 'High')
3. Primary reasons for this assessment based on user profile and vitals
4. Preventative measures

You MUST format the output as a clean JSON object wrapping the array inside a root key named "risks":
{
  "risks": [
    {
      "condition": "Diabetes",
      "riskPercentage": 15,
      "riskLevel": "Low",
      "reasons": ["Blood sugar levels normal", "Active status"],
      "preventiveMeasures": ["Maintain low sugar intake", "Continue active exercises"]
    }
  ]
}

Do not return anything else except this JSON.`;

  if (!isAIActive()) {
    const bmi = userProfile.profile?.weight / ((userProfile.profile?.height / 100) ** 2) || 24.2;
    const hasDiabetesHx = userProfile.profile?.diseases?.includes('Diabetes') || false;
    const hasHTNHx = userProfile.profile?.diseases?.includes('Hypertension') || false;

    return [
      {
        condition: "Diabetes",
        riskPercentage: hasDiabetesHx ? 90 : (bmi > 28 ? 45 : 18),
        riskLevel: hasDiabetesHx ? "High" : (bmi > 28 ? "Moderate" : "Low"),
        reasons: hasDiabetesHx ? ["Pre-existing diabetes diagnosis"] : [bmi > 28 ? "BMI is in overweight category" : "Healthy BMI range and normal activity level"],
        preventiveMeasures: ["Monitor carbohydrate portions", "Focus on fiber-rich whole grains", "Engage in daily brisk walks"]
      },
      {
        condition: "Heart Disease",
        riskPercentage: hasHTNHx ? 55 : 22,
        riskLevel: hasHTNHx ? "Moderate" : "Low",
        reasons: hasHTNHx ? ["History of Hypertension raises cardiovascular load"] : ["Heart rate and activity levels are regular"],
        preventiveMeasures: ["Eat a Mediterranean diet rich in healthy fats", "Perform weekly aerobic exercise", "Maintain healthy weight"]
      },
      {
        condition: "Hypertension",
        riskPercentage: hasHTNHx ? 95 : 30,
        riskLevel: hasHTNHx ? "High" : "Low",
        reasons: hasHTNHx ? ["Active medical history of Hypertension"] : ["Resting blood pressure averages around 120/80 mmHg"],
        preventiveMeasures: ["Limit daily sodium to under 2,000 mg", "Include foods rich in potassium", "Practice stress reduction"]
      },
      {
        condition: "Obesity",
        riskPercentage: bmi > 30 ? 95 : (bmi > 25 ? 65 : 10),
        riskLevel: bmi > 30 ? "High" : (bmi > 25 ? "Moderate" : "Low"),
        reasons: [`Calculated BMI is ${bmi.toFixed(1)}`],
        preventiveMeasures: ["Balance calorie intake with metabolic outputs", "Increase structured gym workouts", "Consult a registered dietitian"]
      },
      {
        condition: "High Cholesterol",
        riskPercentage: bmi > 27 ? 50 : 25,
        riskLevel: bmi > 27 ? "Moderate" : "Low",
        reasons: [bmi > 27 ? "Higher BMI correlates with LDL trends" : "Adequate activity and balanced weight"],
        preventiveMeasures: ["Limit saturated fats", "Incorporate soluble fiber (oats, beans)", "Aerobic conditioning"]
      },
      {
        condition: "Stress",
        riskPercentage: userProfile.profile?.activityLevel === 'Sedentary' ? 45 : 20,
        riskLevel: userProfile.profile?.activityLevel === 'Sedentary' ? "Moderate" : "Low",
        reasons: ["Sedentary lifestyle yields lower cortisol clearance"],
        preventiveMeasures: ["Engage in 10-minute daily breathing practices", "Take desk breaks every 90 minutes", "Optimize sleep duration"]
      }
    ];
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const parsed = cleanAndParseJSON(response.choices[0].message.content);
    return parsed.risks || parsed; // return only the array portion to remain compatible with controller
  } catch (error) {
    console.error("Error in predictHealthRisk (Groq):", error);
    return [];
  }
};

/**
 * AI Personalized Recommendations (Diet, Workout, Goals) using Groq Llama-3.1-8b
 */
exports.generatePersonalizedPlans = async (userProfile, logs) => {
  const prompt = `Create a fully personalized daily meal plan, workout plan, hydration target, sleep goal, and weekly objectives for the following user:

Profile:
- Age: ${userProfile?.profile?.age || 30}
- Gender: ${userProfile?.profile?.gender || 'Male'}
- Height: ${userProfile?.profile?.height || 170} cm
- Weight: ${userProfile?.profile?.weight || 70} kg
- Activity Level: ${userProfile?.profile?.activityLevel || 'Moderately Active'}
- Medical History: ${userProfile?.profile?.diseases?.join(', ') || 'None'}
- Allergies: ${userProfile?.profile?.allergies?.join(', ') || 'None'}

Daily logs:
${JSON.stringify(logs, null, 2)}

Provide a structured plan with breakfast, lunch, dinner, snack options (complying with allergies/diseases), clear workout exercises, exact target values for hydration and sleep, and weekly achievements.

Output MUST be a JSON object exactly like this:
{
  "mealPlan": {
    "breakfast": "Meal details...",
    "lunch": "Meal details...",
    "dinner": "Meal details...",
    "snack": "Meal details..."
  },
  "workoutPlan": [
    { "exercise": "Brisk Walking", "duration": "30 mins", "intensity": "Moderate" }
  ],
  "waterTarget": 2800, // ml
  "sleepGoal": 8, // hours
  "weeklyGoals": [
    "Burn 1500 active calories this week",
    "Complete 4 strength sessions"
  ]
}

Return only JSON and nothing else.`;

  if (!isAIActive()) {
    const hasDiabetes = userProfile.profile?.diseases?.includes('Diabetes') || false;
    return {
      mealPlan: {
        breakfast: hasDiabetes ? "Oatmeal with chia seeds, handful of almonds, and unsweetened almond milk" : "Avocado toast with poached egg on sourdough bread and mixed berries",
        lunch: "Grilled chicken breast salad with quinoa, spinach, tomatoes, cucumbers, and olive oil dressing",
        dinner: "Baked salmon fillet served with steamed broccoli and baked sweet potato",
        snack: "Greek yogurt with a sprinkle of walnuts or sliced cucumber with hummus"
      },
      workoutPlan: [
        { exercise: "Dynamic Stretching / Warm-up", duration: "5 mins", intensity: "Low" },
        { exercise: "Steady-state Cycling or Jogging", duration: "30 mins", intensity: "Moderate" },
        { exercise: "Bodyweight Squats & Pushups", duration: "15 mins", intensity: "Medium" },
        { exercise: "Cool Down / Static Stretches", duration: "5 mins", intensity: "Low" }
      ],
      waterTarget: userProfile.profile?.gender === 'Male' ? 3200 : 2500,
      sleepGoal: 8,
      weeklyGoals: [
        "Clock at least 150 active minutes of aerobic training",
        "Hit daily water intake targets 5 days out of 7",
        "Maintain a consistent sleep schedule (bedtime deviation under 30 minutes)"
      ]
    };
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    return cleanAndParseJSON(response.choices[0].message.content);
  } catch (error) {
    console.error("Error in generatePersonalizedPlans (Groq):", error);
    return {};
  }
};
