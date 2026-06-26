import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Category, Issue, ServiceProvider, Review } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-Memory Database
let issues: Issue[] = [
  {
    id: "1",
    title: "Deep pothole near Metro Station",
    description: "Huge pothole right at the exit of Road 36 Metro station. Extremely dangerous for two-wheelers especially during evening hours.",
    category: "Pothole",
    priorityScore: 92,
    location: "Road No 36, Near Metro Exit",
    gps: { x: 35, y: 45 },
    confirmations: 45,
    status: "Pending",
    timestamp: "2h ago",
    photoUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80",
    reporterName: "Rajeev Mehta",
    isUserReport: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: "2",
    title: "Broken streetlights on Lane 5",
    description: "An entire stretch of 3 streetlights is completely dead. The lane is pitch dark after 7 PM, making it unsafe to walk.",
    category: "Streetlight",
    priorityScore: 55,
    location: "Lane 5, Jubilee Hills",
    gps: { x: 65, y: 25 },
    confirmations: 12,
    status: "Resolved",
    timestamp: "1d ago",
    photoUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400&q=80",
    reporterName: "Meera Reddy",
    isUserReport: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "3",
    title: "Overflowing garbage bin at park entrance",
    description: "The commercial garbage bin at the gate of KBR Park is overflowing. Dogs and stray cows are scattering waste on the main road.",
    category: "Garbage",
    priorityScore: 78,
    location: "KBR Park Gate Corner",
    gps: { x: 48, y: 62 },
    confirmations: 23,
    status: "In progress",
    timestamp: "5h ago",
    photoUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80",
    reporterName: "Dr. Srinivas",
    isUserReport: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: "4",
    title: "Major pipeline burst near Peddamma Temple",
    description: "Main drinking water pipeline is leaking and flooding the Peddamma Temple road. Thousands of liters of water are being wasted.",
    category: "Water leakage",
    priorityScore: 94,
    location: "Peddamma Temple Arch Road",
    gps: { x: 72, y: 55 },
    confirmations: 89,
    status: "In progress",
    timestamp: "45m ago",
    photoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    reporterName: "Amit Paul",
    isUserReport: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: "5",
    title: "Delivery truck blocking gate",
    description: "A delivery van is parked directly blocking the driveway. The driver has been away for an hour, and we cannot take our car out.",
    category: "Blocked parking",
    blockedDetails: "My driveway",
    priorityScore: 82,
    location: "Plot No 124, Road No 10",
    gps: { x: 22, y: 35 },
    confirmations: 1,
    status: "Pending",
    timestamp: "1h ago",
    photoUrl: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80",
    reporterName: "User (You)",
    isUserReport: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    parkingTimerExpires: new Date(Date.now() + 3 * 3600000).toISOString(),
    userConfirmed: true
  }
];

let serviceProviders: ServiceProvider[] = [
  {
    id: "p1",
    name: "Sunita Kumari",
    role: "Cook",
    avatar: "SK",
    rating: 4.8,
    reviewsCount: 3,
    neighboursUsed: 18,
    availability: "Available now",
    phone: "+91 98765 43210",
    reviews: [
      {
        id: "r1",
        providerId: "p1",
        reviewerName: "Ananya R.",
        rating: 5,
        comment: "Excellent home-cooked food. Super hygienic, extremely professional, and adapts to spicy/mild requests beautifully.",
        timestamp: "Yesterday",
        chips: ["On time", "Good work", "Polite"]
      },
      {
        id: "r2",
        providerId: "p1",
        reviewerName: "Vikram K.",
        rating: 4,
        comment: "Very polite, specializes in North and South Indian home cooking. Highly recommended.",
        timestamp: "3 days ago",
        chips: ["Good work", "Polite"]
      },
      {
        id: "r3",
        providerId: "p1",
        reviewerName: "Aditi S.",
        rating: 5,
        comment: "Absolutely delightful meals. She is extremely punctual and cleans up perfectly after cooking.",
        timestamp: "1 week ago",
        chips: ["On time", "Fair price"]
      }
    ]
  },
  {
    id: "p2",
    name: "Rajesh Sharma",
    role: "Plumber",
    avatar: "RS",
    rating: 4.6,
    reviewsCount: 2,
    neighboursUsed: 11,
    availability: "Available today",
    phone: "+91 98765 43211",
    reviews: [
      {
        id: "r4",
        providerId: "p2",
        reviewerName: "Pankaj M.",
        rating: 5,
        comment: "Identified a hidden pipe leakage within 10 minutes. Clean job and charged a very fair price.",
        timestamp: "2 days ago",
        chips: ["Good work", "Fair price"]
      },
      {
        id: "r5",
        providerId: "p2",
        reviewerName: "Siddharth J.",
        rating: 4,
        comment: "Punctual plumber. Fixed multiple bathroom taps with precision.",
        timestamp: "5 days ago",
        chips: ["On time", "Good work"]
      }
    ]
  },
  {
    id: "p3",
    name: "Ramesh Patel",
    role: "Electrician",
    avatar: "RP",
    rating: 4.9,
    reviewsCount: 2,
    neighboursUsed: 22,
    availability: "Busy, book for tomorrow",
    phone: "+91 98765 43212",
    reviews: [
      {
        id: "r6",
        providerId: "p3",
        reviewerName: "Karan Johar",
        rating: 5,
        comment: "Replaced our main distribution board and installed smart switches. Knows modern automation systems very well.",
        timestamp: "4 days ago",
        chips: ["Good work", "Polite"]
      },
      {
        id: "r7",
        providerId: "p3",
        reviewerName: "Shruti G.",
        rating: 5,
        comment: "He is a master of electrical troubleshooting. Extremely polite, clean, and highly skilled.",
        timestamp: "Last week",
        chips: ["On time", "Good work", "Polite"]
      }
    ]
  },
  {
    id: "p4",
    name: "Lakshmi Bai",
    role: "Maid",
    avatar: "LB",
    rating: 4.7,
    reviewsCount: 2,
    neighboursUsed: 29,
    availability: "Available today",
    phone: "+91 98765 43213",
    reviews: [
      {
        id: "r8",
        providerId: "p4",
        reviewerName: "Sneha Reddy",
        rating: 5,
        comment: "Extremely reliable maid. Cleans floors and utensils thoroughly. Never takes unplanned leaves.",
        timestamp: "Yesterday",
        chips: ["On time", "Good work"]
      },
      {
        id: "r9",
        providerId: "p4",
        reviewerName: "Preeti V.",
        rating: 4,
        comment: "Very polite and hard working. Does a stellar job cleaning windows and dusting too.",
        timestamp: "4 days ago",
        chips: ["Polite", "Good work"]
      }
    ]
  },
  {
    id: "p5",
    name: "Wash & Fold",
    role: "Laundry",
    avatar: "WF",
    rating: 4.5,
    reviewsCount: 1,
    neighboursUsed: 14,
    availability: "Pickup available",
    phone: "+91 98765 43214",
    reviews: [
      {
        id: "r10",
        providerId: "p5",
        reviewerName: "Nikhil T.",
        rating: 5,
        comment: "Amazing steam ironing and fast 24-hour turnaround for dry cleaning. Pickup from doorstep is seamless.",
        timestamp: "Last week",
        chips: ["Good work", "Fair price"]
      }
    ]
  }
];

// Helper to calculate AI priority score based on requirements
function updatePriorityScores() {
  issues = issues.map(issue => {
    if (issue.status === "Resolved") {
      return issue;
    }

    // Baseline priority weight by category
    let weight = 40;
    if (issue.category === "Water leakage" || issue.category === "Pothole") weight = 60;
    else if (issue.category === "Blocked parking") weight = 50;
    else if (issue.category === "Streetlight") weight = 35;
    else if (issue.category === "Garbage") weight = 30;

    // Confirmations impact (+1.5 points per confirmation, capped at +30)
    const confBonus = Math.min(issue.confirmations * 1.5, 30);

    // Days open bonus: parse ISO string or relative
    let hoursOpen = 2; // default fallback
    try {
      const created = new Date(issue.createdAt).getTime();
      hoursOpen = Math.max((Date.now() - created) / 3600000, 0);
    } catch (e) {}
    const timeBonus = Math.min(hoursOpen * 0.5, 10); // older issues get up to +10 bonus

    // Cluster bonus: search for unresolved issues of same category within 10% distance
    let clusterCount = 0;
    issues.forEach(other => {
      if (other.id !== issue.id && other.category === issue.category && other.status !== "Resolved") {
        const dist = Math.sqrt(Math.pow(other.gps.x - issue.gps.x, 2) + Math.pow(other.gps.y - issue.gps.y, 2));
        if (dist < 15) {
          clusterCount++;
        }
      }
    });
    const clusterBonus = Math.min(clusterCount * 5, 10);

    const calculatedScore = Math.min(Math.round(weight + confBonus + timeBonus + clusterBonus), 100);

    return {
      ...issue,
      priorityScore: calculatedScore
    };
  });
}

// Run initial calculation
updatePriorityScores();

// ------------------- API ROUTES -------------------

// Issues List
app.get("/api/issues", (req, res) => {
  // Check auto-resolution of Blocked Parking issues
  let changed = false;
  issues = issues.map(issue => {
    if (issue.category === "Blocked parking" && issue.status === "Pending" && issue.parkingTimerExpires) {
      if (new Date() > new Date(issue.parkingTimerExpires)) {
        changed = true;
        return {
          ...issue,
          status: "Resolved",
          description: issue.description + " (Auto-resolved after 4 hours of inactivity)"
        };
      }
    }
    return issue;
  });

  if (changed) {
    updatePriorityScores();
  }

  res.json(issues);
});

// Single Issue Details
app.get("/api/issues/:id", (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }
  res.json(issue);
});

// Confirm Issue (Normal Issues)
app.post("/api/issues/:id/confirm", (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  if (issue.category === "Blocked parking") {
    // For parking, "Still there" refreshes the 4-hour timer
    issue.parkingTimerExpires = new Date(Date.now() + 4 * 3600000).toISOString();
    issue.confirmations += 1;
    issue.userConfirmed = true;
    issue.timestamp = "Just now";
  } else {
    if (!issue.userConfirmed) {
      issue.confirmations += 1;
      issue.userConfirmed = true;
    } else {
      issue.confirmations = Math.max(issue.confirmations - 1, 0);
      issue.userConfirmed = false;
    }
  }

  updatePriorityScores();
  res.json(issue);
});

// "It Moved" button (Blocked parking only) - immediately resolves
app.post("/api/issues/:id/move", (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  issue.status = "Resolved";
  issue.userConfirmed = false;
  updatePriorityScores();
  res.json(issue);
});

// Submit New Issue
app.post("/api/issues", (req, res) => {
  const { title, description, category, location, photoUrl, blockedDetails } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Create random GPS within bounds for the custom map
  const gps = {
    x: Math.floor(Math.random() * 60) + 20,
    y: Math.floor(Math.random() * 50) + 25
  };

  const newIssue: Issue = {
    id: String(issues.length + 1),
    title,
    description,
    category,
    priorityScore: 50, // Initial default score, re-evaluated in updatePriorityScores()
    location: location || "Jubilee Hills, Road No 10",
    gps,
    confirmations: 1,
    status: "Pending",
    timestamp: "Just now",
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1599740831419-b5ce14bd5f94?auto=format&fit=crop&w=400&q=80",
    reporterName: "User (You)",
    isUserReport: true,
    createdAt: new Date().toISOString(),
    blockedDetails: category === "Blocked parking" ? blockedDetails : undefined,
    parkingTimerExpires: category === "Blocked parking" ? new Date(Date.now() + 4 * 3600000).toISOString() : undefined,
    userConfirmed: true
  };

  issues.unshift(newIssue);
  updatePriorityScores();

  res.json(newIssue);
});

// Service Providers Directory List
app.get("/api/services", (req, res) => {
  res.json(serviceProviders);
});

// Submit Review for Service Provider
app.post("/api/services/:id/review", (req, res) => {
  const provider = serviceProviders.find(p => p.id === req.params.id);
  if (!provider) {
    return res.status(404).json({ error: "Service provider not found" });
  }

  const { rating, comment, chips, reviewerName } = req.body;

  const newReview: Review = {
    id: "rev" + Date.now(),
    providerId: provider.id,
    reviewerName: reviewerName || "User (You)",
    rating: Number(rating) || 5,
    comment: comment || "Great work!",
    timestamp: "Just now",
    chips: chips || []
  };

  provider.reviews.unshift(newReview);
  provider.reviewsCount = provider.reviews.length;
  provider.neighboursUsed += 1;

  // Re-calculate average rating
  const totalRating = provider.reviews.reduce((sum, r) => sum + r.rating, 0);
  provider.rating = Number((totalRating / provider.reviews.length).toFixed(1));

  res.json(provider);
});

// ------------------- GEMINI CLIENT UTILITY & API ENDPOINTS -------------------

// Lazy load GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 1. Suggest Category Endpoint
app.post("/api/suggest-category", async (req, res) => {
  const { description, photoData } = req.body;

  const promptText = `Analyze this civic issue report and provide structured advice.
Description: "${description || "No description provided."}"

Return a JSON object with:
1. "category": strictly one of ["Pothole", "Streetlight", "Garbage", "Water leakage", "Blocked parking", "Other"]
2. "title": a polished, clear short title (max 5 words)
3. "priorityScore": an AI priority score from 0 to 100 based on severity (e.g., potholes/water flooding is high risk 85+, trash/faded signs is lower 40-70)
4. "explanation": a 1-sentence description explaining why this category and priority score were selected.

Response must be valid JSON ONLY.`;

  const client = getGeminiClient();

  if (client) {
    try {
      let contents: any = promptText;

      if (photoData) {
        const imagePart = {
          inlineData: {
            mimeType: "image/jpeg",
            data: photoData.split(",")[1] || photoData, // Strip header if present
          },
        };
        contents = { parts: [imagePart, { text: promptText }] };
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              priorityScore: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["category", "title", "priorityScore", "explanation"],
          },
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text.trim());
        return res.json(result);
      }
    } catch (e: any) {
      console.error("Gemini suggestion failed, using fallback:", e.message);
    }
  }

  // Smart Fallback Rule-Based Engine (if Gemini is missing or fails)
  const descLower = (description || "").toLowerCase();
  let category: Category = "Other";
  let title = "Civic Issue";
  let priorityScore = 50;
  let explanation = "Analyzed via local heuristic engine. Tap category below to refine.";

  if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("cracks")) {
    category = "Pothole";
    title = "Road Pothole Repair";
    priorityScore = 85;
    explanation = "Identified road safety hazard. High risk for two-wheelers.";
  } else if (descLower.includes("light") || descLower.includes("lamp") || descLower.includes("dark")) {
    category = "Streetlight";
    title = "Streetlight Malfunction";
    priorityScore = 60;
    explanation = "Dark neighborhood lane, minor safety and security issue.";
  } else if (descLower.includes("garbage") || descLower.includes("trash") || descLower.includes("waste") || descLower.includes("dump")) {
    category = "Garbage";
    title = "Garbage Dumping Pile";
    priorityScore = 45;
    explanation = "Waste accumulation detected. Medium environmental/cleanliness risk.";
  } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("flood")) {
    category = "Water leakage";
    title = "Active Water Leakage";
    priorityScore = 90;
    explanation = "Active pipe leakage. High priority to prevent community water loss.";
  } else if (descLower.includes("park") || descLower.includes("driveway") || descLower.includes("car") || descLower.includes("vehicle") || descLower.includes("block")) {
    category = "Blocked parking";
    title = "Driveway Blocked by Car";
    priorityScore = 70;
    explanation = "Illegal parking blocking resident access. Fast response recommended.";
  }

  return res.json({ category, title, priorityScore, explanation });
});

// 2. Chatbot Assistant Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history, userName } = req.body;

  const systemInstruction = `You are the Community Hero AI Assistant, a friendly and extremely helpful civic companion for the "Jubilee Hills" neighborhood.
Your primary role is to help citizens file report entries, track issues, find local service providers, and understand community metrics.

User's Name: ${userName || "Resident"}

Available Active Issues currently logged in Jubilee Hills (for reference):
${JSON.stringify(
  issues.map(i => ({
    id: i.id,
    title: i.title,
    category: i.category,
    status: i.status,
    priorityScore: i.priorityScore,
    location: i.location,
    isUserReport: i.isUserReport,
    confirmations: i.confirmations
  })),
  null,
  2
)}

Guidelines:
1. Be encouraging, polite, and write brief responses suited for a small 320px mobile popup.
2. If the user wants to report a civic issue (e.g. "there is a big pipe leak on lane 4" or "someone dumped garbage near my plot"), parse it and return a special action code in your response in this EXACT format so the frontend app can pre-fill a new report:
   :::CREATE_REPORT:{"category": "Water leakage", "title": "Water Pipe Leakage", "description": "Reported via AI assistant", "location": "Lane 4, Jubilee Hills"}:::
   Make sure the category matches one of: "Pothole", "Streetlight", "Garbage", "Water leakage", "Blocked parking", "Other".
3. If the user asks about "my reports" or "my submitted issues", list all issues that have isUserReport: true. Let them know what stage they are in (e.g. In progress, Pending).
4. If the user asks "what is the most urgent issue near me?", look at the active list, find the open issue with the highest priorityScore (excluding Resolved), and tell them about it.
5. If the user asks for service recommendations, list a provider name and telephone number from these available services: Cook (Sunita Kumari), Plumber (Rajesh Sharma), Electrician (Ramesh Patel).

Keep your messages sweet, short (max 3-4 sentences), and very helpful!`;

  const client = getGeminiClient();

  if (client) {
    try {
      // Build standard chat contents using history
      const contents = [
        ...(history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      if (response.text) {
        return res.json({ text: response.text });
      }
    } catch (e: any) {
      console.error("Gemini chat failed, using fallback:", e.message);
    }
  }

  // Fallback Chat Engine (rule-based NLP)
  const query = message.toLowerCase();
  let text = `Hi ${userName || "Resident"}! I'm here to help you keep Jubilee Hills safe and clean. `;

  if (query.includes("report") || query.includes("pothole") || query.includes("leak") || query.includes("garbage") || query.includes("parking")) {
    // Generate a file action suggestion
    let cat: Category = "Other";
    let location = "Jubilee Hills";
    if (query.includes("pothole")) cat = "Pothole";
    else if (query.includes("leak") || query.includes("pipe")) cat = "Water leakage";
    else if (query.includes("garbage") || query.includes("trash")) cat = "Garbage";
    else if (query.includes("parking") || query.includes("car")) cat = "Blocked parking";
    else if (query.includes("light") || query.includes("lamp")) cat = "Streetlight";

    text += `I can help you file that report! I've prepared a new report draft. Tap below or open the Report tab to submit it. \n\n:::CREATE_REPORT:{"category": "${cat}", "title": "Reported Civic Issue", "description": "${message}", "location": "${location}"}:::`;
  } else if (query.includes("my report") || query.includes("my issues") || query.includes("status")) {
    const my = issues.filter(i => i.isUserReport);
    if (my.length > 0) {
      text += `You have submitted ${my.length} report(s). Your "${my[0].title}" is currently **${my[0].status}** with ${my[0].confirmations} community confirmations.`;
    } else {
      text += `You haven't submitted any reports yet. Tap the center "+" button in the bottom menu to file your first!`;
    }
  } else if (query.includes("urgent") || query.includes("danger") || query.includes("highest")) {
    const active = issues.filter(i => i.status !== "Resolved").sort((a, b) => b.priorityScore - a.priorityScore);
    if (active.length > 0) {
      text += `The most urgent issue right now is **"${active[0].title}"** with an **AI Priority Score of ${active[0].priorityScore}/100**. It is located at *${active[0].location}* and has ${active[0].confirmations} confirmations.`;
    } else {
      text += `All reported issues in Jubilee Hills have been resolved! Great job team!`;
    }
  } else if (query.includes("cook") || query.includes("maid") || query.includes("plumber") || query.includes("electrician")) {
    if (query.includes("cook")) {
      text += `I recommend **Sunita Kumari** (Cook). She has a 4.8-star rating from 18 of your neighbors! You can contact her at +91 98765 43210.`;
    } else if (query.includes("plumber")) {
      text += `I recommend **Rajesh Sharma** (Plumber). He is rated 4.6 stars. Call him at +91 98765 43211.`;
    } else if (query.includes("electrician")) {
      text += `I recommend **Ramesh Patel** (Electrician). He is rated 4.9 stars. Call him at +91 98765 43212.`;
    } else if (query.includes("maid")) {
      text += `I recommend **Lakshmi Bai** (Maid). She is rated 4.7 stars. Call her at +91 98765 43213.`;
    }
  } else {
    text += `How would you like to build our community today? I can help you report issues (potholes, garbage, leaks), search trusted local handymen, or view your neighborhood maps.`;
  }

  return res.json({ text });
});

// ------------------- VITE & STATIC FILES SERVING -------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
