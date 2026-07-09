import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    quizTitle: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    answers: [
      {
        questionId: String,
        answer: String,
        correct: Boolean,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", attemptSchema);