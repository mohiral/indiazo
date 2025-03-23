const mongoose = require("mongoose")

const subOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pdfPath: { type: String },
  type: { type: String, enum: ["free", "paid"] },
})

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subOptions: [subOptionSchema],
})

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [optionSchema],
  premiumPrice: { type: Number, default: 0 }, // Add this line
})

module.exports = mongoose.model("Class", classSchema)

