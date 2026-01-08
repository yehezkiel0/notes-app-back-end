const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["todo", "ongoing", "done"],
    default: "todo",
  },
  category: {
    type: String,
    default: "general",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  reminder: {
    type: Date,
    default: null,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: null, // Stores the URL/path to the image
  },
  voiceNote: {
    type: String, // URL/path to voice note file
    default: null,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

// Update the updatedAt timestamp before saving
noteSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
