export type CandidateStatus = 'pending' | 'approved' | 'rejected';

export type DiscordUser = {
  _id: string;
  discordId: string;
  username: string;
  globalName?: string;
  avatar?: string;
  email?: string;
};

export type Candidate = {
  _id: string;
  fullName: string;
  email: string;
  age: number;
  experience: string;
  motivation: string;
  links?: string;
  status: CandidateStatus;
  discordId: string;
  discordUsername: string;
  submittedAt: string;
  createdAt: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  history?: Array<{
    action: string;
    from?: string;
    to?: string;
    byName?: string;
    note?: string;
    at: string;
  }>;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
};
