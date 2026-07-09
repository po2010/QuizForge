import { Router } from "express";
import Quiz from "../models/Quiz.js";
import auth from "../middleware/auth.js";

const router = Router();

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// GET /api/quizzes — list public quizzes (with search & tag filter)
router.get("/", async (req, res) => {
  try {
    const { search, tag } = req.query;
    let filter = { visibility: "public" };

    if (tag && tag !== "all") {
      filter.tags = tag;
    }

    let quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const q = search.toLowerCase().trim();
      quizzes = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          quiz.description.toLowerCase().includes(q) ||
          quiz.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    res.json({ quizzes: quizzes.map((q) => Quiz.toPublicJSON(q)) });
  } catch (err) {
    console.error("Get quizzes error:", err);
    res.status(500).json({ error: "Server error fetching quizzes." });
  }
});

// GET /api/quizzes/tags — get all unique tags
router.get("/tags", async (req, res) => {
  try {
    const tags = await Quiz.distinct("tags", { visibility: "public" });
    res.json({ tags });
  } catch (err) {
    console.error("Get tags error:", err);
    res.status(500).json({ error: "Server error fetching tags." });
  }
});

// GET /api/quizzes/stats — get quiz count
router.get("/stats", async (req, res) => {
  try {
    const count = await Quiz.countDocuments({ visibility: "public" });
    res.json({ count });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ error: "Server error fetching stats." });
  }
});

// GET /api/quizzes/my/all — get current user's quizzes (auth required)
// MUST be placed before /:id to avoid route conflict
router.get("/my/all", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creatorId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ quizzes: quizzes.map((q) => Quiz.toPublicJSON(q)) });
  } catch (err) {
    console.error("Get my quizzes error:", err);
    res.status(500).json({ error: "Server error fetching your quizzes." });
  }
});

// GET /api/quizzes/:id — get a single quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    res.json({ quiz: quiz.toPublicJSON({ includeAnswers: true }) });
  } catch (err) {
    console.error("Get quiz error:", err);
    res.status(500).json({ error: "Server error fetching quiz." });
  }
});

// POST /api/quizzes/verify-room — verify a room code
router.post("/verify-room", async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: "Room code is required." });
    }

    const quiz = await Quiz.findOne({
      visibility: "private",
      roomCode: roomCode.toUpperCase().trim(),
    });

    if (!quiz) {
      return res.status(404).json({ error: "No private quiz found for that room number." });
    }

    res.json({ quizId: quiz._id, roomCode: quiz.roomCode });
  } catch (err) {
    console.error("Verify room error:", err);
    res.status(500).json({ error: "Server error verifying room." });
  }
});

// POST /api/quizzes — create a new quiz (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, tags, visibility, timer, questions } = req.body;

    if (!title || !description || !questions || questions.length === 0) {
      return res.status(400).json({ error: "Title, description, and at least one question are required." });
    }

    const roomCode =
      visibility === "private"
        ? (req.body.roomCode || "").trim().toUpperCase() || generateRoomCode()
        : "";

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description.trim(),
      tags: (tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean),
      visibility: visibility || "public",
      roomCode,
      timer: Number(timer) || 30,
      creatorId: req.user._id,
      creatorName: req.user.name,
      questions: questions.map((q) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      })),
    });

    res.status(201).json({ quiz: quiz.toPublicJSON() });
  } catch (err) {
    console.error("Create quiz error:", err);
    res.status(500).json({ error: "Server error creating quiz." });
  }
});

export default router;
