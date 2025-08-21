// Profile Completion Analyzer for Life CEO Framework Agent
// Analyzes user profile completeness across all required fields

export interface ProfileField {
  name: string;
  value: any;
  required: boolean;
  category: string;
  description?: string;
}

export interface ProfileCompletionResult {
  overallScore: number;
  missingFields: ProfileField[];
  completedFields: ProfileField[];
  recommendations: string[];
  categoryScores: Record<string, number>;
}

export class ProfileCompletionAnalyzer {
  static analyzeProfile(user: any, userProfile?: any, travelDetails?: any[], guestProfile?: any): ProfileCompletionResult {
    const fields: ProfileField[] = [
      // Basic Information
      { name: 'profileImage', value: user?.profileImage, required: true, category: 'Basic Info', description: 'Profile photo' },
      { name: 'backgroundImage', value: user?.backgroundImage, required: false, category: 'Basic Info', description: 'Cover photo' },
      { name: 'bio', value: user?.bio, required: true, category: 'Basic Info', description: 'Personal bio' },
      { name: 'firstName', value: user?.firstName, required: true, category: 'Basic Info', description: 'First name' },
      { name: 'lastName', value: user?.lastName, required: true, category: 'Basic Info', description: 'Last name' },
      { name: 'mobileNo', value: user?.mobileNo, required: false, category: 'Basic Info', description: 'Phone number' },
      
      // Location
      { name: 'city', value: user?.city, required: true, category: 'Location', description: 'City' },
      { name: 'state', value: user?.state, required: true, category: 'Location', description: 'State/Province' },
      { name: 'country', value: user?.country, required: true, category: 'Location', description: 'Country' },
      { name: 'countryCode', value: user?.countryCode, required: false, category: 'Location', description: 'Country code' },
      { name: 'stateCode', value: user?.stateCode, required: false, category: 'Location', description: 'State code' },
      
      // Tango Experience
      { name: 'tangoRoles', value: user?.tangoRoles?.length > 0, required: true, category: 'Tango Experience', description: 'Dance roles' },
      { name: 'leaderLevel', value: user?.leaderLevel > 0, required: false, category: 'Tango Experience', description: 'Leader skill level' },
      { name: 'followerLevel', value: user?.followerLevel > 0, required: false, category: 'Tango Experience', description: 'Follower skill level' },
      { name: 'yearsOfDancing', value: user?.yearsOfDancing > 0, required: true, category: 'Tango Experience', description: 'Years dancing' },
      { name: 'startedDancingYear', value: user?.startedDancingYear, required: false, category: 'Tango Experience', description: 'Year started' },
      
      // Cultural Info
      { name: 'languages', value: user?.languages?.length > 0, required: true, category: 'Cultural', description: 'Languages spoken' },
      { name: 'nickname', value: user?.nickname, required: false, category: 'Cultural', description: 'Nickname' },
      
      // Social
      { name: 'facebookUrl', value: user?.facebookUrl, required: false, category: 'Social', description: 'Facebook profile' },
      
      // Travel
      { name: 'travelDetails', value: travelDetails && travelDetails.length > 0, required: false, category: 'Travel', description: 'Travel history' },
      { name: 'guestProfile', value: guestProfile?.isComplete, required: false, category: 'Travel', description: 'Guest profile' },
    ];

    const completedFields = fields.filter(field => {
      if (typeof field.value === 'boolean') return field.value;
      if (typeof field.value === 'number') return field.value !== null && field.value !== undefined;
      return field.value !== null && field.value !== undefined && field.value !== '';
    });

    const missingFields = fields.filter(field => {
      const isCompleted = completedFields.includes(field);
      return field.required && !isCompleted;
    });

    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const categories = ['Basic Info', 'Location', 'Tango Experience', 'Cultural', 'Social', 'Travel'];
    
    categories.forEach(category => {
      const categoryFields = fields.filter(f => f.category === category);
      const categoryCompleted = categoryFields.filter(f => completedFields.includes(f));
      categoryScores[category] = categoryFields.length > 0 
        ? Math.round((categoryCompleted.length / categoryFields.length) * 100)
        : 100;
    });

    // Calculate overall score (weighted by required fields)
    const requiredFields = fields.filter(f => f.required);
    const completedRequired = requiredFields.filter(f => completedFields.includes(f));
    const optionalFields = fields.filter(f => !f.required);
    const completedOptional = optionalFields.filter(f => completedFields.includes(f));
    
    const requiredScore = requiredFields.length > 0 
      ? (completedRequired.length / requiredFields.length) * 70 
      : 70;
    const optionalScore = optionalFields.length > 0 
      ? (completedOptional.length / optionalFields.length) * 30 
      : 30;
    
    const overallScore = Math.round(requiredScore + optionalScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(missingFields, categoryScores, user);

    return {
      overallScore,
      missingFields,
      completedFields,
      recommendations,
      categoryScores
    };
  }

  private static generateRecommendations(missingFields: ProfileField[], categoryScores: Record<string, number>, user: any): string[] {
    const recommendations: string[] = [];

    // Priority recommendations for required fields
    if (missingFields.length > 0) {
      recommendations.push(`Complete ${missingFields.length} required fields to improve your profile`);
      
      // Group by category
      const categoryCounts: Record<string, number> = {};
      missingFields.forEach(field => {
        categoryCounts[field.category] = (categoryCounts[field.category] || 0) + 1;
      });

      Object.entries(categoryCounts).forEach(([category, count]) => {
        recommendations.push(`${category}: ${count} field${count > 1 ? 's' : ''} needed`);
      });
    }

    // Category-specific recommendations
    if (categoryScores['Basic Info'] < 80) {
      recommendations.push('Upload a profile photo and write a bio to make your profile more engaging');
    }

    if (categoryScores['Tango Experience'] < 60) {
      recommendations.push('Add your tango experience details to connect with the right dance partners');
    }

    if (categoryScores['Location'] < 100) {
      recommendations.push('Complete your location information for better local connections');
    }

    if (!user?.languages || user.languages.length === 0) {
      recommendations.push('Add languages you speak to improve communication with international dancers');
    }

    if (categoryScores['Travel'] < 50) {
      recommendations.push('Consider adding travel details if you dance in multiple cities');
    }

    // Achievement-based recommendations
    if (user?.isVerified) {
      recommendations.push('✓ Profile verified - Great job!');
    } else if (overallScore > 80) {
      recommendations.push('Your profile is nearly complete! Consider verification for added credibility');
    }

    return recommendations;
  }

  static getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      profileImage: 'Profile Photo',
      backgroundImage: 'Cover Photo',
      bio: 'Bio',
      firstName: 'First Name',
      lastName: 'Last Name',
      mobileNo: 'Phone Number',
      city: 'City',
      state: 'State/Province',
      country: 'Country',
      tangoRoles: 'Dance Roles',
      leaderLevel: 'Leader Level',
      followerLevel: 'Follower Level',
      yearsOfDancing: 'Years Dancing',
      startedDancingYear: 'Started Dancing',
      languages: 'Languages',
      nickname: 'Nickname',
      facebookUrl: 'Facebook Profile',
      travelDetails: 'Travel History',
      guestProfile: 'Guest Profile'
    };

    return displayNames[fieldName] || fieldName;
  }

  static getFrameworkMapping(category: string): { layers: number[], phases: number[] } {
    const mappings: Record<string, { layers: number[], phases: number[] }> = {
      'Basic Info': { layers: [5, 7], phases: [1, 2] },
      'Location': { layers: [5, 15], phases: [1, 3] },
      'Tango Experience': { layers: [5, 17], phases: [1, 2] },
      'Cultural': { layers: [17, 18], phases: [1, 2] },
      'Social': { layers: [8, 13], phases: [4, 11] },
      'Travel': { layers: [5, 15], phases: [3, 12] }
    };

    return mappings[category] || { layers: [5], phases: [1] };
  }
}