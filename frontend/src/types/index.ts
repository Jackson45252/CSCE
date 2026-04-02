export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Player {
  id: number;
  name: string;
  email?: string;
  remark?: string;
  createdAt: string;
}

export interface Team {
  id: number;
  name: string;
  logoUrl?: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  playerId: number;
  playerName: string;
  jerseyNumber?: number;
  joinedAt: string;
}

export interface TournamentCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Tournament {
  id: number;
  name: string;
  season: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt: string;
  categoryId?: number;
  categoryName?: string;
}

export interface TournamentTeam {
  id: number;
  teamId: number;
  teamName: string;
  registeredAt: string;
}

export interface TournamentRoster {
  id: number;
  playerId: number;
  playerName: string;
  jerseyNumber?: number;
  addedAt: string;
}

export interface Game {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  scheduledAt: string;
  location?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  homeQ1?: number;
  homeQ2?: number;
  homeQ3?: number;
  homeQ4?: number;
  homeOt1?: number;
  homeOt2?: number;
  awayQ1?: number;
  awayQ2?: number;
  awayQ3?: number;
  awayQ4?: number;
  awayOt1?: number;
  awayOt2?: number;
  createdAt: string;
}

export interface PlayerGameStats {
  id: number;
  gameId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  twoPointAttempts: number;
  twoPointPoints: number;
  threePointAttempts: number;
  threePointPoints: number;
  freeThrowAttempts: number;
  freeThrowPoints: number;
  totalPoints: number;
  createdAt: string;
}

export interface TournamentStanding {
  teamId: number;
  teamName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface LeaderboardEntry {
  playerId: number;
  playerName: string;
  teamName: string;
  tournamentTotalPoints: number;
}

export interface TeamTournamentStats {
  playerId: number;
  playerName: string;
  jerseyNumber?: number;
  gamesPlayed: number;
  totalTwoPointAttempts: number;
  totalTwoPointPoints: number;
  totalThreePointAttempts: number;
  totalThreePointPoints: number;
  totalFreeThrowAttempts: number;
  totalFreeThrowPoints: number;
  tournamentTotalPoints: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Admin {
  id: number;
  username: string;
  roles: string[];
  createdAt: string;
}

export interface PlayerTeam {
  teamId: number;
  teamName: string;
  jerseyNumber?: number;
  joinedAt: string;
}

export interface BoxScoreEntry {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  jerseyNumber?: number;
  twoPointAttempts: number;
  twoPointPoints: number;
  threePointAttempts: number;
  threePointPoints: number;
  freeThrowAttempts: number;
  freeThrowPoints: number;
  totalPoints: number;
}

export interface NewsAttachment {
  id: number;
  newsId: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  isImage: boolean;
  createdAt: string;
}

export interface NewsListItem {
  id: number;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  coverImageUrl?: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments: NewsAttachment[];
}
