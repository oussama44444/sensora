const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: {
    fr: { type: String, required: false, default: "Titre français" }, // Remove required
    tn: { type: String, required: false, default: "" }
  },
  image: { type: String, required: true },
  availableLanguages: [{ type: String, enum: ['fr', 'tn'] }],
  description : {type: String, required: false, default: "" },
  isPremium: { type: Boolean, default: false },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  stages: [{
    segments: [{
      audio: {
        fr: { type: String, required: false, default: "" }, // Remove required
        tn: { type: String, required: false, default: "" }
      },
      question: {
        question: {
          fr: { type: String, required: false, default: "Question" }, // Remove required
          tn: { type: String, required: false, default: "" }
        },
        // NEW: Optional question audio per language
        questionAudio: {
          fr: { type: String, required: false, default: "" },
          tn: { type: String, required: false, default: "" }
        },
        answers: [{
          text: {
            fr: { type: String, required: false, default: "Réponse" }, // Remove required
            tn: { type: String, required: false, default: "" }
          },
          correct: { type: Boolean, required: true }
        }],
        hint: {
          fr: { type: String, default: "" },
          tn: { type: String, default: "" }
        }
      }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const Story = mongoose.model("Story", storySchema);
module.exports = Story;