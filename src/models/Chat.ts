import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  disputeId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  message: string;
  attachments?: string[];
  read: boolean;
  senderRole?: {
    role: string;
    isSwitch: boolean;
    accountRole?: string;
    district?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema({
  disputeId: {
    type: Schema.Types.ObjectId,
    ref: 'Dispute',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  senderRole: {
    role: String,
    isSwitch: Boolean,
    accountRole: String,
    district: String
  }
}, {
  timestamps: true
});

// Index for faster queries
ChatSchema.index({ disputeId: 1, createdAt: -1 });
ChatSchema.index({ sender: 1, receiver: 1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema); 