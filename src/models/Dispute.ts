import { generateOTP, getDateAndTime } from "@/utils/helpers/function";
import mongoose from "mongoose";

export interface Disputes extends mongoose.Document {
  claimId: string;
  claimant: any;
  status:
    | "open"
    | "processing"
    | "closed"
    | "resolved"
    | "rejected"
    | "appealed"
    | "withdrawn";
  statusUpdatedAt: string;
  withdrawReason: string;
  level: "district" | "nla" | "court";
  upiNumber: string;
  land: ILandData;
  district: string;
  defendant: {
    fullName: string;
    phoneNumber: string;
  };
  disputeType: string;
  letter: string;
  sectorReport: string;
  comments: [
    {
      _id: string;
      user: string;
      datecreated: string;
      timecreated: string;
      comment: string;
    }
  ];
  villageLeaderPhone: string;
  witnesses: [
    {
      fullName: string;
      phoneNumber: string;
    }
  ];
  resolvedBy: any;
  openedBy: any;

  createdAt?: string;
  updatedAt?: string;
  appealedAt?: string;

  rejectReason?: string;

  secondLands?: ILandData[];
  feedback?: string;
  rejectedBy?: any;
  appealReason?: string;
  otherDocuments: string[];
  deedPlan: string;
  invitationProof: string;
  summary: string;
  stampedLetter?: string;
  sharedDocuments?: Array<{
    url: string;
    name: string;
    sharedAt: string;
    recipientType: string[];
  }>;
  appealHistory: [{
    appealedAt: string;
    appealReason: string;
    status: string;
    level: string;
    resolvedAt?: string;
    resolvedBy?: any;
  }];
  statusHistory: [{
    status: string;
    updatedAt: string;
    updatedBy: any;
    reason?: string;
  }];
}

const DisputeSchema = new mongoose.Schema<Disputes>({
  claimId: {
    type: String,
    unique: true,
    required: false,
    default: () => generateOTP(10),
    immutable: false,
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    required: false,
    default: "open",
  },
  statusUpdatedAt: {
    type: String,
    required: false,
    default: null,
  },
  level: {
    type: String,
    required: false,
    default: "district", // district, nla, court
  },
  upiNumber: {
    type: String,
    required: true,
  },
  land: {},
  district: {
    type: String,
    required: true,
  },
  defendant: {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  disputeType: {
    type: String,
    required: true,
  },
  letter: {
    type: String,
    required: true,
  },
  sectorReport: {
    type: String,
    required: true,
  },
  comments: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      datecreated: {
        type: String,
        required: false,
        default: () => getDateAndTime().date,
        immutable: true,
      },
      timecreated: {
        type: String,
        required: false,
        default: () => getDateAndTime().time,
        immutable: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  witnesses: [
    {
      fullName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
  ],
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  rejectReason: {
    type: String,
    required: false,
    default: null,
  },
  secondLands: {
    type: [Object],
    required: false,
    default: [],
  },
  feedback: {
    type: String,
    required: false,
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  appealReason: {
    type: String,
    required: false,
    default: null,
  },
  appealedAt: {
    type: String,
    required: false,
    default: null,
  },
  otherDocuments: {
    type: [String],
    required: false,
    default: [],
  },
  deedPlan: {
    type: String,
    required: false,
    default: null,
  },
  invitationProof: {
    type: String,
    required: false,
    default: null,
  },
  summary: {
    type: String,
    required: false,
    default: null,
  },
  withdrawReason: {
    type: String,
    required: false,
    default: null,
  },
  stampedLetter: {
    type: String,
    required: false,
    default: null,
  },
  sharedDocuments: [{
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sharedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString()
    },
    recipientType: [{
      type: String,
      required: true
    }]
  }],
  appealHistory: [{
    appealedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString()
    },
    appealReason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected']
    },
    level: {
      type: String,
      required: true
    },
    resolvedAt: {
      type: String,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    updatedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString()
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String
    }
  }],
});

DisputeSchema.set("timestamps", true);

export default (mongoose.models.Dispute as mongoose.Model<Disputes>) ||
  mongoose.model<Disputes>("Dispute", DisputeSchema);
