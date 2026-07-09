import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["mcq", "truefalse", "fill"],
      required: true,
    },
    prompt: { type: String, required: true },
    options: [String],
    correct: { type: String, required: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 70 },
    description: { type: String, required: true, trim: true, maxlength: 180 },
    tags: [String],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    roomCode: { type: String, default: "" },
    timer: { type: Number, required: true },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorName: { type: String, required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

function toPublicJSON(quiz, options = {}) {
  const doc = quiz.toObject ? quiz.toObject() : quiz;
  const includeAnswers = options.includeAnswers === true;

  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    visibility: doc.visibility,
    ...(doc.visibility === "private" && { roomCode: doc.roomCode }),
    timer: doc.timer,
    creatorId: String(doc.creatorId),
    creatorName: doc.creatorName,
    createdAt: doc.createdAt,
    questions: (doc.questions || []).map((q) => {
      if (includeAnswers) return q;
      const { correct, ...rest } = q;
      return rest;
    }),
    questionCount: (doc.questions || []).length,
  };
}

quizSchema.methods.toPublicJSON = function (options) {
  return toPublicJSON(this, options);
};

quizSchema.statics.toPublicJSON = function (quiz, options) {
  return toPublicJSON(quiz, options);
};

export default mongoose.model("Quiz", quizSchema);