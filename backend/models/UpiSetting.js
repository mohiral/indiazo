const mongoose = require("mongoose")

const upiSettingSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Ensure only one UPI setting can be active at a time
upiSettingSchema.pre("save", async function (next) {
  if (this.isActive) {
    // Deactivate all other UPI settings
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { isActive: false })
  }
  next()
})

const UpiSetting = mongoose.model("UpiSetting", upiSettingSchema)

module.exports = UpiSetting

