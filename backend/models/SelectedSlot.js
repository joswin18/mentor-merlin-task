import mongoose from 'mongoose';

const selectedSlotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isoDate: {
      // YYYY-MM-DD (UTC) for the booked class date
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      // 1-12
      type: Number,
      required: true,
      index: true,
    },
    batchNumber: {
      // 1-3
      type: Number,
      required: true,
    },
    dayNumber: {
      // 1-7 (within batch)
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent the same user booking the same date twice
selectedSlotSchema.index({ userId: 1, isoDate: 1 }, { unique: true });

const SelectedSlot = mongoose.model('SelectedSlot', selectedSlotSchema);

export default SelectedSlot;


