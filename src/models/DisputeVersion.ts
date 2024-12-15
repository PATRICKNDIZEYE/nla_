import mongoose, { Schema } from 'mongoose';

const disputeVersionSchema = new Schema({
  disputeId: {
    type: Schema.Types.ObjectId,
    ref: 'Dispute',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  changes: {
    type: Object,
    required: true
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  reason: String
});

export const DisputeVersion = mongoose.models.DisputeVersion || 
  mongoose.model('DisputeVersion', disputeVersionSchema); 