// City RBAC/ABAC Service for determining local vs visitor status
// Uses 30L Framework Layer 9 (Security & Authentication) and Layer 17 (Emotional Intelligence)

import { User } from '@/types';

export interface CityAccessContext {
  isLocal: boolean;
  isVisitor: boolean;
  isFollowing: boolean;
  isMember: boolean;
  hasGuestProfile: boolean;
  hasHostProfile: boolean;
  verificationStatus: 'unverified' | 'email_verified' | 'id_verified' | 'fully_verified';
  privileges: {
    canMessage: boolean;
    canSeeVisitors: boolean;
    canOfferGuiding: boolean;
    canRequestStay: boolean;
    canListHome: boolean;
    canJoinGroup: boolean;
    canFollowCity: boolean;
  };
}

export class CityRbacService {
  /**
   * Determines user's access context for a specific city
   * Based on 30L Framework Layer 4 (UX/UI Design) - Role-based views
   */
  static getUserCityContext(
    user: User | null,
    cityName: string,
    userMemberships: { groupId: number; role?: string }[] = [],
    userFollowing: number[] = [],
    groupId: number
  ): CityAccessContext {
    if (!user) {
      return this.getGuestContext();
    }

    // Determine if user is local based on registration city
    const isLocal = this.isUserLocal(user, cityName);
    
    // Check membership and following status
    const isMember = userMemberships.some(m => m.groupId === groupId);
    const isFollowing = userFollowing.includes(groupId);
    
    // Determine verification status
    const verificationStatus = this.getUserVerificationStatus(user);
    
    // Check profile completeness
    const hasGuestProfile = user.guestProfileComplete || false;
    const hasHostProfile = user.hostProfileComplete || false;

    // Build privileges based on status
    const privileges = this.buildPrivileges(
      isLocal,
      isMember,
      isFollowing,
      hasGuestProfile,
      hasHostProfile,
      verificationStatus
    );

    return {
      isLocal,
      isVisitor: !isLocal,
      isFollowing,
      isMember,
      hasGuestProfile,
      hasHostProfile,
      verificationStatus,
      privileges
    };
  }

  /**
   * Determines if user is local to a city
   * Layer 14 (Context & Memory Management) - Location-aware decisions
   */
  private static isUserLocal(user: User, cityName: string): boolean {
    // Check user's registration city (the city they dance most in)
    const userCity = user.city || user.location?.city || '';
    
    // Normalize city names for comparison
    const normalizedUserCity = userCity.toLowerCase().trim();
    const normalizedCityName = cityName.toLowerCase().trim();
    
    // Handle variations like "Buenos Aires" vs "Buenos Aires, Argentina"
    return normalizedUserCity.includes(normalizedCityName) || 
           normalizedCityName.includes(normalizedUserCity);
  }

  /**
   * Determines user verification status
   * Layer 22 (User Safety Net) - Trust and safety mechanisms
   */
  private static getUserVerificationStatus(user: User): CityAccessContext['verificationStatus'] {
    // Check various verification levels
    if (user.idVerified && user.emailVerified) {
      return 'fully_verified';
    } else if (user.idVerified) {
      return 'id_verified';
    } else if (user.emailVerified) {
      return 'email_verified';
    }
    return 'unverified';
  }

  /**
   * Builds privilege set based on user status
   * Layer 9 (Security & Authentication) - Permission management
   */
  private static buildPrivileges(
    isLocal: boolean,
    isMember: boolean,
    isFollowing: boolean,
    hasGuestProfile: boolean,
    hasHostProfile: boolean,
    verificationStatus: CityAccessContext['verificationStatus']
  ): CityAccessContext['privileges'] {
    return {
      // Locals can message anyone, visitors need guest profile
      canMessage: isLocal || (hasGuestProfile && verificationStatus !== 'unverified'),
      
      // Only locals can see when visitors are coming to town
      canSeeVisitors: isLocal && isMember,
      
      // Locals can offer to be guides
      canOfferGuiding: isLocal && isMember && verificationStatus !== 'unverified',
      
      // Visitors with guest profile can request stays
      canRequestStay: !isLocal && hasGuestProfile,
      
      // Anyone with host profile can list (one per user)
      canListHome: hasHostProfile,
      
      // Only locals can join their city group
      canJoinGroup: isLocal,
      
      // Non-locals can follow cities
      canFollowCity: !isLocal
    };
  }

  /**
   * Returns context for non-authenticated users
   */
  private static getGuestContext(): CityAccessContext {
    return {
      isLocal: false,
      isVisitor: true,
      isFollowing: false,
      isMember: false,
      hasGuestProfile: false,
      hasHostProfile: false,
      verificationStatus: 'unverified',
      privileges: {
        canMessage: false,
        canSeeVisitors: false,
        canOfferGuiding: false,
        canRequestStay: false,
        canListHome: false,
        canJoinGroup: false,
        canFollowCity: false
      }
    };
  }

  /**
   * Get display text for user status
   * Layer 17 (Emotional Intelligence) - User-friendly messaging
   */
  static getStatusDisplayText(context: CityAccessContext, cityName: string): {
    title: string;
    description: string;
    action?: string;
  } {
    if (context.isLocal && context.isMember) {
      return {
        title: `Welcome home to ${cityName}!`,
        description: 'As a local member, you can connect with visitors and help grow our community.',
        action: context.hasHostProfile ? undefined : 'Consider becoming a host'
      };
    } else if (context.isLocal && !context.isMember) {
      return {
        title: `Join your local ${cityName} community`,
        description: 'Connect with fellow dancers and welcome visitors to your city.',
        action: 'Join Community'
      };
    } else if (context.isVisitor && context.isFollowing) {
      return {
        title: `Following ${cityName}`,
        description: 'Stay updated on events and connect when you visit.',
        action: context.hasGuestProfile ? undefined : 'Complete Guest Profile'
      };
    } else if (context.isVisitor && !context.isFollowing) {
      return {
        title: `Discover ${cityName}`,
        description: 'Follow this city to stay updated on events and plan your visit.',
        action: 'Follow City'
      };
    }
    
    return {
      title: `Welcome to ${cityName}`,
      description: 'Explore our vibrant tango community.'
    };
  }
}