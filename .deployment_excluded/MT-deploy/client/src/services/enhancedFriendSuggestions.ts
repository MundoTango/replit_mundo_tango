import { User } from '@/types';

interface SuggestionScore {
  userId: number;
  score: number;
  reasons: string[];
  mutualFriends: number;
  sharedEvents: number;
  sharedGroups: number;
  danceCompatibility: number;
  locationProximity: number;
}

interface DancePreferences {
  leaderLevel: number;
  followerLevel: number;
  preferredStyles: string[];
  yearsOfDancing: number;
}

interface UserLocation {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export class EnhancedFriendSuggestionService {
  private weights = {
    mutualFriends: 0.25,
    sharedEvents: 0.20,
    sharedGroups: 0.15,
    danceCompatibility: 0.20,
    locationProximity: 0.10,
    tangoRoles: 0.10
  };

  // ML-inspired collaborative filtering
  async generateSuggestions(
    userId: number,
    userProfile: any,
    candidateUsers: any[],
    existingFriends: number[]
  ): Promise<SuggestionScore[]> {
    const suggestions: SuggestionScore[] = [];

    // Filter out existing friends
    const potentialFriends = candidateUsers.filter(
      user => user.id !== userId && !existingFriends.includes(user.id)
    );

    for (const candidate of potentialFriends) {
      const score = await this.calculateCompatibilityScore(userProfile, candidate);
      if (score.score > 0.3) { // Threshold for suggesting
        suggestions.push(score);
      }
    }

    // Sort by score descending
    return suggestions.sort((a, b) => b.score - a.score);
  }

  private async calculateCompatibilityScore(
    user: any,
    candidate: any
  ): Promise<SuggestionScore> {
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. Mutual Friends Score (Collaborative Filtering)
    const mutualFriends = await this.getMutualFriendsCount(user.id, candidate.id);
    const mutualFriendsScore = Math.min(mutualFriends * 0.1, 1); // Cap at 1
    totalScore += mutualFriendsScore * this.weights.mutualFriends;
    if (mutualFriends > 0) {
      reasons.push(`${mutualFriends} mutual friends`);
    }

    // 2. Shared Events Score
    const sharedEvents = await this.getSharedEventsCount(user.id, candidate.id);
    const sharedEventsScore = Math.min(sharedEvents * 0.15, 1);
    totalScore += sharedEventsScore * this.weights.sharedEvents;
    if (sharedEvents > 0) {
      reasons.push(`Attended ${sharedEvents} same events`);
    }

    // 3. Shared Groups Score
    const sharedGroups = await this.getSharedGroupsCount(user.id, candidate.id);
    const sharedGroupsScore = Math.min(sharedGroups * 0.2, 1);
    totalScore += sharedGroupsScore * this.weights.sharedGroups;
    if (sharedGroups > 0) {
      reasons.push(`Member of ${sharedGroups} same groups`);
    }

    // 4. Dance Compatibility Score (Custom ML Feature)
    const danceCompatibility = this.calculateDanceCompatibility(
      {
        leaderLevel: user.leaderLevel || 0,
        followerLevel: user.followerLevel || 0,
        preferredStyles: user.tangoRoles || [],
        yearsOfDancing: user.yearsOfDancing || 0
      },
      {
        leaderLevel: candidate.leaderLevel || 0,
        followerLevel: candidate.followerLevel || 0,
        preferredStyles: candidate.tangoRoles || [],
        yearsOfDancing: candidate.yearsOfDancing || 0
      }
    );
    totalScore += danceCompatibility * this.weights.danceCompatibility;
    if (danceCompatibility > 0.7) {
      reasons.push('High dance compatibility');
    }

    // 5. Location Proximity Score
    const locationScore = this.calculateLocationScore(
      { city: user.city, country: user.country },
      { city: candidate.city, country: candidate.country }
    );
    totalScore += locationScore * this.weights.locationProximity;
    if (locationScore > 0.5) {
      reasons.push(locationScore === 1 ? 'Same city' : 'Same country');
    }

    // 6. Tango Roles Compatibility
    const rolesScore = this.calculateRolesCompatibility(
      user.tangoRoles || [],
      candidate.tangoRoles || []
    );
    totalScore += rolesScore * this.weights.tangoRoles;
    if (rolesScore > 0.5) {
      reasons.push('Compatible tango roles');
    }

    return {
      userId: candidate.id,
      score: totalScore,
      reasons,
      mutualFriends,
      sharedEvents,
      sharedGroups,
      danceCompatibility,
      locationProximity: locationScore
    };
  }

  private calculateDanceCompatibility(
    user: DancePreferences,
    candidate: DancePreferences
  ): number {
    let score = 0;
    let factors = 0;

    // Leader-Follower compatibility
    if (user.leaderLevel > 0 && candidate.followerLevel > 0) {
      const levelDiff = Math.abs(user.leaderLevel - candidate.followerLevel);
      score += Math.max(0, 1 - levelDiff / 10);
      factors++;
    }
    if (user.followerLevel > 0 && candidate.leaderLevel > 0) {
      const levelDiff = Math.abs(user.followerLevel - candidate.leaderLevel);
      score += Math.max(0, 1 - levelDiff / 10);
      factors++;
    }

    // Experience similarity
    const yearsDiff = Math.abs(user.yearsOfDancing - candidate.yearsOfDancing);
    score += Math.max(0, 1 - yearsDiff / 20);
    factors++;

    // Shared dance styles
    const userStyles = new Set(user.preferredStyles);
    const candidateStyles = new Set(candidate.preferredStyles);
    const sharedStyles = [...userStyles].filter(style => candidateStyles.has(style));
    if (userStyles.size > 0 && candidateStyles.size > 0) {
      score += sharedStyles.length / Math.max(userStyles.size, candidateStyles.size);
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private calculateLocationScore(user: UserLocation, candidate: UserLocation): number {
    if (user.city === candidate.city && user.city) return 1;
    if (user.country === candidate.country && user.country) return 0.5;
    return 0;
  }

  private calculateRolesCompatibility(userRoles: string[], candidateRoles: string[]): number {
    const complementaryPairs = [
      ['teacher', 'dancer'],
      ['dj', 'dancer'],
      ['organizer', 'performer'],
      ['photographer', 'performer'],
      ['host', 'tango_traveler']
    ];

    let score = 0;
    
    // Check for complementary roles
    for (const [role1, role2] of complementaryPairs) {
      if (
        (userRoles.includes(role1) && candidateRoles.includes(role2)) ||
        (userRoles.includes(role2) && candidateRoles.includes(role1))
      ) {
        score += 0.5;
      }
    }

    // Check for shared roles
    const sharedRoles = userRoles.filter(role => candidateRoles.includes(role));
    score += sharedRoles.length * 0.2;

    return Math.min(score, 1);
  }

  // Mock API calls - replace with actual API calls
  private async getMutualFriendsCount(userId1: number, userId2: number): Promise<number> {
    const response = await fetch(`/api/friendship/mutual-count/${userId1}/${userId2}`);
    const data = await response.json();
    return data.count || 0;
  }

  private async getSharedEventsCount(userId1: number, userId2: number): Promise<number> {
    const response = await fetch(`/api/friendship/shared-events-count/${userId1}/${userId2}`);
    const data = await response.json();
    return data.count || 0;
  }

  private async getSharedGroupsCount(userId1: number, userId2: number): Promise<number> {
    const response = await fetch(`/api/friendship/shared-groups-count/${userId1}/${userId2}`);
    const data = await response.json();
    return data.count || 0;
  }

  // Advanced ML features using cosine similarity
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Convert user profile to feature vector for ML
  userToFeatureVector(user: any): number[] {
    return [
      user.leaderLevel || 0,
      user.followerLevel || 0,
      user.yearsOfDancing || 0,
      user.tangoRoles?.includes('teacher') ? 1 : 0,
      user.tangoRoles?.includes('dj') ? 1 : 0,
      user.tangoRoles?.includes('organizer') ? 1 : 0,
      user.tangoRoles?.includes('performer') ? 1 : 0,
      // Add more features as needed
    ];
  }
}