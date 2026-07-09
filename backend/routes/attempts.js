import { Router } from "express";
import Attempt from "../models/Attempt.js";
import Quiz from "../models/Quiz.js";
import auth from "../middleware/auth.js";

const router = Router();

// POST /api/attempts — submit an attempt (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "quizId and answers array are required." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    const total = quiz.questions.length;
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      const correct = question
        ? a.answer.trim().toLowerCase() === question.correct.trim().toLowerCase()
        : false;
      if (correct) score += 1;
      return { questionId: a.questionId, answer: a.answer, correct };
    });

    const timeTaken = Math.round((Date.now() - new Date(req.body.startedAt || Date.now()).getTime()) / 1000);

    const attempt = await Attempt.create({
      quizId: quiz._id,
      quizTitle: quiz.title,
      userId: req.user._id,
      userName: req.user.name,
      score,
      total,
      timeTaken: Math.max(1, timeTaken),
      answers: gradedAnswers,
    });

    res.status(201).json({
      attempt: {
        id: attempt._id,
        quizId: attempt.quizId,
        quizTitle: attempt.quizTitle,
        score: attempt.score,
        total: attempt.total,
        timeTaken: attempt.timeTaken,
      },
    });
  } catch (err) {
    console.error("Submit attempt error:", err);
    res.status(500).json({ error: "Server error saving attempt." });
  }
});

// GET /api/attempts — get leaderboard (optionally filtered by quizId)
router.get("/", async (req, res) => {
  try {
    const { quizId } = req.query;
    const filter = quizId ? { quizId } : {};
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const attempts = await Attempt.find(filter)
      .sort({ score: -1, timeTaken: 1, createdAt: 1 })
      .limit(limit)
      .lean();

    res.json({
      attempts: attempts.map((a) => ({
        id: a._id,
        quizId: a.quizId,
        quizTitle: a.quizTitle,
        userName: a.userName,
        score: a.score,
        total: a.total,
        timeTaken: a.timeTaken,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error("Get attempts error:", err);
    res.status(500).json({ error: "Server error fetching attempts." });
  }
});

// GET /api/attempts/my — get current user's attempts (auth required)
router.get("/my", auth, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      attempts: attempts.map((a) => ({
        id: a._id,
        quizId: a.quizId,
        quizTitle: a.quizTitle,
        score: a.score,
        total: a.total,
        timeTaken: a.timeTaken,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error("Get my attempts error:", err);
    res.status(500).json({ error: "Server error fetching your attempts." });
  }
});

export default router;