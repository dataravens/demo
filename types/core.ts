export type PlanStep = {
    id: string;
    label: string;
    run: () => Promise<void>;
    undo: () => Promise<void>;
  };
  
  export type PlanStatus = "pending" | "running" | "success" | "partial" | "failed";
  export type Actor = "user" | "autopilot" | "system";
  export type Source = "cmdk" | "drag" | "kpi" | "call" | "scribe";
  
export type ClarificationQuestion = {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'text_input' | 'date_picker';
  options?: string[];
  required: boolean;
  context?: any; // Additional context for the question
};

// Conversational Command Types
export type ConversationRole = 'user' | 'assistant';

export type AIResponseType = 
  | 'clarification'     // Asking for more details
  | 'suggestion'        // Offering alternatives or improvements
  | 'confirmation'      // Confirming understanding before proceeding
  | 'information'       // Providing helpful context or data
  | 'error'            // Explaining why something can't be done
  | 'success'          // Confirming completion or next steps

export type ConversationMessage = {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: Date;
  type?: AIResponseType;
  
  // Interactive elements
  suggestions?: string[];           // Quick reply options
  actions?: ConversationAction[];   // Buttons for actions
  data?: any;                      // Structured data (tables, lists, etc.)
  
  // Context
  relatedCommand?: string;         // Original command this relates to
  planId?: string;                // If this leads to a plan
};

export type ConversationAction = {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'execute_plan' | 'modify_command' | 'show_data' | 'dismiss';
  payload?: any;
};

export type ConversationContext = {
  sessionId: string;
  messages: ConversationMessage[];
  currentCommand?: string;
  pendingPlan?: Plan;
  userContext: {
    role: string; // Keep as string for flexibility
    recentCommands: string[];
    currentPage?: string;
  };
};

export type Plan = {
  id: string;
  title: string;
  actor: Actor;
  source: Source;
  steps: PlanStep[];
  startedAt?: number;
  finishedAt?: number;
  status?: PlanStatus;
  needsClarification?: boolean;
  clarificationQuestions?: ClarificationQuestion[];
  originalCommand?: string;
};
  
  export type EventItem = {
    id: string;
    planId?: string;
    stepId?: string;
    type: string;       // e.g., "invoice.drafted", "reminder.sent", "insurance.verified"
    summary: string;
    ts: number;
    actor: Actor;
    source: Source;
    undo?: () => Promise<void>;
    redo?: () => Promise<void>;
    callId?: string;    // Link to call record if originated from call
    automated?: boolean; // True for background AI activities
    category?: 'plan' | 'reminder' | 'verification' | 'general' | 'scribe'; // Activity category
    patientName?: string; // For reminder/verification activities
  };

  // Ambient Scribe Types
  export type ScribeSession = {
    id: string;
    patientId?: string;
    patientName?: string;
    appointmentId?: string;
    clinicianId: string;
    clinicianName: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in seconds
    status: 'recording' | 'processing' | 'completed' | 'failed';
    audioUrl?: string;
    transcript?: string;
    structuredNote?: ClinicalNote;
    confidence?: number; // AI confidence score
    reviewedBy?: string;
    reviewedAt?: Date;
    tags?: string[];
    metadata?: {
      appointmentType?: string;
      recordingQuality?: 'excellent' | 'good' | 'fair' | 'poor';
      backgroundNoise?: boolean;
      speakerCount?: number;
    };
  };

  export type ClinicalNote = {
    id: string;
    sessionId: string;
    patientId?: string;
    patientName?: string;
    clinicianId: string;
    clinicianName: string;
    date: Date;
    appointmentType?: string;
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string;
    medications?: string[];
    allergies?: string[];
    socialHistory?: string;
    familyHistory?: string;
    reviewOfSystems?: string;
    physicalExam?: string;
    assessment?: string;
    plan?: string;
    followUp?: string;
    prescriptions?: Prescription[];
    diagnosticOrders?: DiagnosticOrder[];
    referrals?: Referral[];
    confidence?: number;
    requiresReview?: boolean;
    reviewNotes?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Prescription = {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity?: number;
    refills?: number;
  };

  export type DiagnosticOrder = {
    id: string;
    type: 'lab' | 'imaging' | 'other';
    name: string;
    urgency: 'routine' | 'urgent' | 'stat';
    instructions?: string;
    icd10?: string;
  };

  export type Referral = {
    id: string;
    specialty: string;
    provider?: string;
    urgency: 'routine' | 'urgent';
    reason: string;
    instructions?: string;
  };

  export type ScribeTemplate = {
    id: string;
    name: string;
    appointmentType: string;
    specialty?: string;
    sections: {
      name: string;
      prompt: string;
      required: boolean;
    }[];
    customPrompts?: string;
    createdBy: string;
    createdAt: Date;
  };
  