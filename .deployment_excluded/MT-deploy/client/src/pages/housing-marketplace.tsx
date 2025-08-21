import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  Home, 
  MapPin, 
  Calendar,
  Users,
  Bed,
  Bath,
  Wifi,
  Coffee,
  Car,
  Wind,
  Music,
  DollarSign,
  Euro,
  Search,
  Plus,
  Filter,
  Heart,
  Star,
  Clock,
  Check,
  Banknote
} from 'lucide-react';

interface HousingListing {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  pricePerNight: number;
  currency: 'USD' | 'EUR' | 'ARS';
  paymentPreference: 'cash' | 'transfer' | 'both';
  availableFrom: string;
  availableTo: string;
  hostName: string;
  hostUsername: string;
  hostRoles?: string[];
  rating?: number;
  reviewCount?: number;
  type: 'apartment' | 'room' | 'shared' | 'house';
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images?: string[];
  tangoProximity?: {
    nearestMilonga: string;
    distanceToMilonga: string;
    walkingTime: string;
  };
  isFavorite?: boolean;
  status: 'available' | 'booked' | 'unavailable';
}

export default function HousingMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockListings: HousingListing[] = [
    {
      id: '1',
      title: 'Cozy Palermo Studio Near Milongas',
      description: 'Perfect studio apartment in the heart of Palermo, walking distance to La Viruta and Salon Canning. Ideal for tango dancers visiting Buenos Aires.',
      location: 'Palermo, Buenos Aires',
      address: 'Nicaragua 5500',
      pricePerNight: 45,
      currency: 'USD',
      paymentPreference: 'cash',
      availableFrom: '2025-01-15',
      availableTo: '2025-03-30',
      hostName: 'Maria Rodriguez',
      hostUsername: 'maria_tango',
      hostRoles: ['dancer', 'teacher'],
      rating: 4.8,
      reviewCount: 24,
      type: 'apartment',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['wifi', 'kitchen', 'washing_machine', 'tango_practice_space'],
      tangoProximity: {
        nearestMilonga: 'La Viruta',
        distanceToMilonga: '300m',
        walkingTime: '5 min'
      },
      isFavorite: true,
      status: 'available'
    },
    {
      id: '2',
      title: 'Shared Room in Tango House',
      description: 'Join our tango community house! Shared room with other dancers, common areas for practice, and regular house milongas.',
      location: 'San Telmo, Buenos Aires',
      pricePerNight: 20,
      currency: 'USD',
      paymentPreference: 'both',
      availableFrom: '2025-01-10',
      availableTo: '2025-06-30',
      hostName: 'Carlos Mendez',
      hostUsername: 'carlos_milonga',
      hostRoles: ['organizer', 'dancer'],
      rating: 4.6,
      reviewCount: 18,
      type: 'shared',
      guests: 1,
      bedrooms: 1,
      bathrooms: 2,
      amenities: ['wifi', 'shared_kitchen', 'practice_floor', 'sound_system'],
      tangoProximity: {
        nearestMilonga: 'El Beso',
        distanceToMilonga: '200m',
        walkingTime: '3 min'
      },
      status: 'available'
    },
    {
      id: '3',
      title: 'Luxury Recoleta Apartment',
      description: 'Spacious 2-bedroom apartment in elegant Recoleta. Perfect for couples or friends traveling together for tango festivals.',
      location: 'Recoleta, Buenos Aires',
      pricePerNight: 120,
      currency: 'USD',
      paymentPreference: 'transfer',
      availableFrom: '2025-02-01',
      availableTo: '2025-02-28',
      hostName: 'Ana Silva',
      hostUsername: 'ana_tango_dj',
      hostRoles: ['dj', 'dancer'],
      rating: 4.9,
      reviewCount: 31,
      type: 'apartment',
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['wifi', 'kitchen', 'air_conditioning', 'balcony', 'doorman'],
      tangoProximity: {
        nearestMilonga: 'Milonga Parakultural',
        distanceToMilonga: '500m',
        walkingTime: '8 min'
      },
      status: 'available'
    }
  ];

  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    kitchen: Coffee,
    air_conditioning: Wind,
    practice_floor: Music,
    parking: Car
  };

  const currencySymbols: Record<string, any> = {
    USD: DollarSign,
    EUR: Euro,
    ARS: Banknote
  };

  // Filter listings based on search and type
  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    const matchesPrice = listing.pricePerNight >= priceRange.min && listing.pricePerNight <= priceRange.max;
    return matchesSearch && matchesType && matchesPrice;
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      // In a real app, this would call the API
      return { listingId };
    },
    onSuccess: () => {
      toast({
        title: 'Updated favorites',
        description: 'Your favorites list has been updated.'
      });
    }
  });

  const handleToggleFavorite = (listing: HousingListing) => {
    toggleFavoriteMutation.mutate(listing.id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tango Housing Marketplace</h1>
              <p className="text-gray-600 mt-2">Find the perfect place to stay during your tango journey</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              List Your Space
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Home className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mockListings.length}</p>
                  <p className="text-sm text-gray-600">Active Listings</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(mockListings.map(l => l.location.split(',')[0])).size}
                  </p>
                  <p className="text-sm text-gray-600">Neighborhoods</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-rose-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.7</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-violet-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-600">Near Milongas</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by location, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'apartment', 'room', 'shared', 'house'].map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0' 
                    : ''}
                >
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => {
            const CurrencyIcon = currencySymbols[listing.currency] || DollarSign;
            
            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 relative">
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => handleToggleFavorite(listing)}
                    >
                      <Heart className={`w-4 h-4 ${listing.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/90 text-gray-900">
                      {listing.type}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {listing.title}
                    </h3>
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <CurrencyIcon className="w-4 h-4" />
                      {listing.pricePerNight}
                      <span className="text-sm font-normal text-gray-600">/night</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {listing.location}
                  </p>

                  {/* Room Info */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {listing.guests} guests
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {listing.bedrooms} bed
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {listing.bathrooms} bath
                    </div>
                  </div>

                  {/* Tango Proximity */}
                  {listing.tangoProximity && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-purple-900">
                        <Music className="w-4 h-4 inline mr-1" />
                        {listing.tangoProximity.walkingTime} to {listing.tangoProximity.nearestMilonga}
                      </p>
                    </div>
                  )}

                  {/* Payment Preference */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Banknote className="w-3 h-3 mr-1" />
                      {listing.paymentPreference === 'cash' ? 'Cash Only' : 
                       listing.paymentPreference === 'transfer' ? 'Bank Transfer' : 'Cash or Transfer'}
                    </Badge>
                    {listing.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{listing.rating}</span>
                        <span className="text-gray-500">({listing.reviewCount})</span>
                      </div>
                    )}
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {listing.hostName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{listing.hostName}</p>
                        <div className="flex gap-1">
                          {listing.hostRoles?.map(role => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedListing(listing)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </Card>
        )}

        {/* View Details Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedListing.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedListing(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">{selectedListing.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{selectedListing.address || selectedListing.location}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">
                      Available: {new Date(selectedListing.availableFrom).toLocaleDateString()} - {new Date(selectedListing.availableTo).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                      <div className="space-y-2">
                        {selectedListing.amenities.map(amenity => {
                          const Icon = amenityIcons[amenity] || Check;
                          return (
                            <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                              <Icon className="w-4 h-4" />
                              {amenity.replace(/_/g, ' ')}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Tango Info</h4>
                      <div className="space-y-2 text-sm text-purple-700">
                        <p>
                          <Music className="w-4 h-4 inline mr-1" />
                          {selectedListing.tangoProximity?.nearestMilonga}
                        </p>
                        <p>Distance: {selectedListing.tangoProximity?.distanceToMilonga}</p>
                        <p>Walking: {selectedListing.tangoProximity?.walkingTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      Contact Host
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Check Availability
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}