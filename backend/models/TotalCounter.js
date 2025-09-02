import mongoose from 'mongoose';

const totalCounterSchema = new mongoose.Schema({
  totalProducts: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Ensure only one document exists
totalCounterSchema.statics.getCounter = async function() {
  let counter = await this.findOne();
  if (!counter) {
    counter = await this.create({ totalProducts: 0 });
  }
  return counter;
};

export default mongoose.model('TotalCounter', totalCounterSchema);
