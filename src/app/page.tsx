'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, MapPin, Upload, DollarSign, Home, Users, FileText, Camera, Video, Phone, MessageCircle, Plus, Trash2, Calculator, Locate, Leaf, TreePine, Sprout } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';
import GoogleMap from '@/components/GoogleMap';

interface CustomerData {
  customerId: string;
  leadDate: string;
  customerName: string;
  phoneNumber: string;
  hasWhatsApp: boolean;
  hasWhatsAppNumber?: string;
  whatsappNumber?: string;
  district: string;
  city: string;
  address?: string;
  hasRemovals: boolean;
  removalCharge?: string;
  hasAdditionalLabor: boolean;
  additionalLaborCharge?: string;
  status: string;
  selectedService: string;
  ceilingData?: any;
  guttersData?: any;
  roofData?: any;
  images?: MediaFile[];
  drawings?: MediaFile[];
  videos?: MediaFile[];
}

interface MediaFile {
  id: string;
  type: 'image' | 'drawing' | 'video';
  data: string;
  name: string;
  timestamp: string;
  size?: number;
}

interface Area {
  length: string;
  width: string;
  area: number;
}

export default function SiteVisitorForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [areas, setAreas] = useState<Area[]>([{ length: '', width: '', area: 0 }]);
  const [ceilingType, setCeilingType] = useState<string>('');
  const [pricePerSqFt, setPricePerSqFt] = useState<number>(180);

  // Customer Information
  const [customerId, setCustomerId] = useState<string>('');
  const [leadDate, setLeadDate] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean>(false);
  const [hasWhatsAppNumber, setHasWhatsAppNumber] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string>('');

  // Location Information
  const [district, setDistrict] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 7.8731, lng: 80.7718 }); // Default to Sri Lanka center

  // Additional Charges
  const [hasRemovals, setHasRemovals] = useState<boolean>(false);
  const [removalCharge, setRemovalCharge] = useState<string>('');
  const [hasAdditionalLabor, setHasAdditionalLabor] = useState<boolean>(false);
  const [additionalLaborCharge, setAdditionalLaborCharge] = useState<string>('');

  // Status
  const [status, setStatus] = useState<string>('pending');

  // Gutters Service State
  const [guttersMeasurements, setGuttersMeasurements] = useState({
    guttersValanceB: '',
    bFlashingValanceB: '',
    gutters: '',
    valanceB: '',
    bFlashing: '',
    dPipes: '',
    ridgeCover: '',
    ratGuard: '',
  });
  const [nozzelsDontWant, setNozzelsDontWant] = useState<boolean>(false);
  const [nozzelsCount, setNozzelsCount] = useState<string>('');
  const [endCapsDontWant, setEndCapsDontWant] = useState<boolean>(false);
  const [endCapsCount, setEndCapsCount] = useState<string>('');
  const [chainPacketsDontWant, setChainPacketsDontWant] = useState<boolean>(false);
  const [chainPacketsCount, setChainPacketsCount] = useState<string>('');
  const [wallFSize, setWallFSize] = useState<string>('');
  const [wallFMeasurements, setWallFMeasurements] = useState<string>('');
  const [blindWallSize, setBlindWallSize] = useState<string>('');
  const [blindWallMeasurements, setBlindWallMeasurements] = useState<string>('');
  const [customDesignNote, setCustomDesignNote] = useState<string>('');

  // Roof Service State
  const [roofType, setRoofType] = useState<string>('');
  const [structureType, setStructureType] = useState<string>('');
  const [finishType, setFinishType] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [subOption, setSubOption] = useState<string>('');

  // Media State
  const [images, setImages] = useState<MediaFile[]>([]);
  const [drawings, setDrawings] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);

  // Check for editing mode and generate customer ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      loadSiteVisitForEditing(editId);
    } else {
      generateNewCustomerID();
    }
  }, []);

  const generateNewCustomerID = async () => {
    try {
      const response = await fetch('/api/customer-id');
      const result = await response.json();
      
      if (result.success) {
        setCustomerId(result.nextCustomerID);
      }
    } catch (error) {
      console.error('Error generating customer ID:', error);
      // Fallback to a simple ID
      setCustomerId('A-001a01');
    }
  };

  const loadSiteVisitForEditing = async (id: string) => {
    try {
      setIsEditing(true);
      setEditingId(id);
      
      const response = await fetch(`/api/site-visits?action=getById&id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        const visit = result.data;
        
        // Populate all form fields
        setCustomerId(visit.customerId);
        setLeadDate(visit.leadDate);
        setCustomerName(visit.customerName);
        setPhoneNumber(visit.phoneNumber);
        setHasWhatsApp(visit.hasWhatsApp);
        setDistrict(visit.district);
        setCity(visit.city);
        setAddress(visit.address || '');
        setHasRemovals(visit.hasRemovals || false);
        setRemovalCharge(visit.removalCharge || '');
        setHasAdditionalLabor(visit.hasAdditionalLabor || false);
        setAdditionalLaborCharge(visit.additionalLaborCharge || '');
        setStatus(visit.status);
        setSelectedService(visit.selectedService);
        
        // Load service-specific data
        if (visit.ceilingData) {
          setCeilingType(visit.ceilingData.type);
          setPricePerSqFt(visit.ceilingData.pricePerSqFt || 180);
          setAreas(visit.ceilingData.areas || [{ length: '', width: '', area: 0 }]);
        }
        
        if (visit.guttersData) {
          setGuttersMeasurements(visit.guttersData.measurements || {});
          setNozzelsDontWant(!visit.guttersData.items?.nozzels);
          setNozzelsCount(visit.guttersData.items?.nozzels || '');
          setEndCapsDontWant(!visit.guttersData.items?.endCaps);
          setEndCapsCount(visit.guttersData.items?.endCaps || '');
          setChainPacketsDontWant(!visit.guttersData.items?.chainPackets);
          setChainPacketsCount(visit.guttersData.items?.chainPackets || '');
          setWallFSize(visit.guttersData.wallF?.size || '');
          setWallFMeasurements(visit.guttersData.wallF?.measurements || '');
          setBlindWallSize(visit.guttersData.blindWallFlashing?.size || '');
          setBlindWallMeasurements(visit.guttersData.blindWallFlashing?.measurements || '');
          setCustomDesignNote(visit.guttersData.customDesignNote || '');
        }
        
        if (visit.roofData) {
          setRoofType(visit.roofData.roofType);
          setStructureType(visit.roofData.structureType);
          setFinishType(visit.roofData.finishType);
          setMaterial(visit.roofData.material);
          setColor(visit.roofData.color);
          setSubOption(visit.roofData.subOption);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error loading site visit for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load site visit for editing",
        variant: "destructive",
      });
    }
  };

  // Update day of week when date changes
  useEffect(() => {
    if (leadDate) {
      const date = new Date(leadDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setDayOfWeek(days[date.getDay()]);
    } else {
      setDayOfWeek('');
    }
  }, [leadDate]);

  // Update price per sq ft based on ceiling type
  useEffect(() => {
    if (ceilingType) {
      switch (ceilingType) {
        case 'eltoro':
          setPricePerSqFt(180);
          break;
        case 'pvc':
          setPricePerSqFt(250);
          break;
        case 'panelFlat':
          setPricePerSqFt(360);
          break;
        case 'panelBox':
          setPricePerSqFt(430);
          break;
        default:
          setPricePerSqFt(180);
      }
    }
  }, [ceilingType]);

  // Calculate area when length or width changes
  useEffect(() => {
    const updatedAreas = areas.map(area => {
      if (area.length && area.width) {
        const length = parseFeetInches(area.length);
        const width = parseFeetInches(area.width);
        return { ...area, area: parseFloat((length * width).toFixed(2)) };
      }
      return { ...area, area: 0 };
    });
    setAreas(updatedAreas);
  }, [areas.map(a => a.length).join(','), areas.map(a => a.width).join(',')]);

  const calculateMeasurementTotal = (measurement: string): number => {
    if (!measurement) return 0;
    const measurements = measurement.split('+').map(m => m.trim());
    let total = 0;
    
    measurements.forEach(m => {
      const feetMatch = m.match(/(\d+)'/);
      if (feetMatch) {
        total += parseInt(feetMatch[1]);
      }
    });
    
    return total;
  };

  const parseFeetInches = (measurement: string): number => {
    const feetMatch = measurement.match(/(\d+)'/);
    const inchesMatch = measurement.match(/(\d+)"/);
    
    const feet = feetMatch ? parseInt(feetMatch[1]) : 0;
    const inches = inchesMatch ? parseInt(inchesMatch[1]) : 0;
    
    return feet + (inches / 12);
  };

  const addArea = () => {
    setAreas([...areas, { length: '', width: '', area: 0 }]);
  };

  const removeArea = (index: number) => {
    if (areas.length > 1) {
      setAreas(areas.filter((_, i) => i !== index));
    }
  };

  const updateArea = (index: number, field: 'length' | 'width', value: string) => {
    const updatedAreas = [...areas];
    updatedAreas[index] = { ...updatedAreas[index], [field]: value };
    setAreas(updatedAreas);
  };

  // Location functions
  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted' || permission.state === 'prompt') {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          setLocationPermission(true);
          
          // Get district and city from coordinates
          await getLocationFromCoordinates(latitude, longitude);
          
          toast({
            title: "Location Detected",
            description: "Your location has been detected successfully!",
          });
        } else {
          toast({
            title: "Location Permission Denied",
            description: "Please enable location permission to auto-detect your location.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support geolocation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Failed to get your location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Use reverse geocoding to get district and city
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Extract district and city from the response
        let detectedDistrict = '';
        let detectedCity = '';
        
        // Try to find district in the address components
        if (address.state_district || address.county || address.district) {
          detectedDistrict = address.state_district || address.county || address.district;
        }
        
        // Try to find city in the address components
        if (address.city || address.town || address.village || address.suburb) {
          detectedCity = address.city || address.town || address.village || address.suburb;
        }
        
        // Set the detected values if found
        if (detectedDistrict) {
          setDistrict(detectedDistrict);
        }
        if (detectedCity) {
          setCity(detectedCity);
        }
        
        // Set address if available
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (error) {
      console.error('Error getting location from coordinates:', error);
      toast({
        title: "Location Lookup Error",
        description: "Failed to get district and city from your location.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    setMapCenter({ lat, lng });
    getLocationFromCoordinates(lat, lng);
  };

  const getTotalArea = (): number => {
    return areas.reduce((sum, area) => sum + area.area, 0);
  };

  const getTotalCost = (): number => {
    return getTotalArea() * pricePerSqFt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData: CustomerData = {
        customerId,
        leadDate,
        customerName,
        phoneNumber,
        hasWhatsApp,
        hasWhatsAppNumber: hasWhatsApp ? undefined : hasWhatsAppNumber,
        whatsappNumber: hasWhatsApp ? undefined : whatsappNumber,
        district,
        city,
        address,
        hasRemovals,
        removalCharge: hasRemovals ? removalCharge : undefined,
        hasAdditionalLabor,
        additionalLaborCharge: hasAdditionalLabor ? additionalLaborCharge : undefined,
        status,
        selectedService,
        images,
        drawings,
        videos,
      };

      // Add service-specific data
      if (selectedService === 'ceiling') {
        formData.ceilingData = {
          type: ceilingType,
          hasMacfoil: false, // Will be implemented
          pricePerSqFt,
          areas,
          totalArea: getTotalArea(),
          totalCost: getTotalCost(),
          quotationNumber: '', // Will be implemented
        };
      } else if (selectedService === 'gutters') {
        formData.guttersData = {
          measurements: guttersMeasurements,
          items: {
            nozzels: nozzelsDontWant ? null : nozzelsCount,
            endCaps: endCapsDontWant ? null : endCapsCount,
            chainPackets: chainPacketsDontWant ? null : chainPacketsCount,
          },
          wallF: wallFSize ? {
            size: wallFSize,
            measurements: wallFMeasurements,
          } : null,
          blindWallFlashing: blindWallSize ? {
            size: blindWallSize,
            measurements: blindWallMeasurements,
          } : null,
          customDesignNote,
          quotationNumber: '', // Will be implemented
        };
      } else if (selectedService === 'roof') {
        formData.roofData = {
          roofType,
          structureType,
          finishType,
          material,
          color,
          subOption,
          quotationNumber: '', // Will be implemented
        };
      }

      // Send data to Google Sheets via API
      const response = await fetch('/api/site-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isEditing ? 'update' : 'create',
          data: isEditing ? { ...formData, id: editingId } : formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reserve customer ID if creating new entry
        if (!isEditing) {
          try {
            await fetch('/api/customer-id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'reserve', customerId })
            });
          } catch (error) {
            console.error('Failed to reserve customer ID:', error);
          }
        }
        
        toast({
          title: "Success",
          description: isEditing ? "Site visit updated successfully!" : "Site visit submitted successfully!",
        });

        // Redirect to dashboard after successful submission
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);

        // Reset form if creating new entry
        if (!isEditing) {
          // Reset form fields
          setLeadDate('');
          setCustomerName('');
          setPhoneNumber('');
          setHasWhatsApp(false);
          setHasWhatsAppNumber('');
          setWhatsappNumber('');
          setDistrict('');
          setCity('');
          setAddress('');
          setHasRemovals(false);
          setRemovalCharge('');
          setHasAdditionalLabor(false);
          setAdditionalLaborCharge('');
          setStatus('pending');
          setSelectedService('');
          setCeilingType('');
          setPricePerSqFt(180);
          setAreas([{ length: '', width: '', area: 0 }]);
          setGuttersMeasurements({
            guttersValanceB: '',
            bFlashingValanceB: '',
            gutters: '',
            valanceB: '',
            bFlashing: '',
            dPipes: '',
            ridgeCover: '',
            ratGuard: '',
          });
          setNozzelsDontWant(false);
          setNozzelsCount('');
          setEndCapsDontWant(false);
          setEndCapsCount('');
          setChainPacketsDontWant(false);
          setChainPacketsCount('');
          setWallFSize('');
          setWallFMeasurements('');
          setBlindWallSize('');
          setBlindWallMeasurements('');
          setCustomDesignNote('');
          setRoofType('');
          setStructureType('');
          setFinishType('');
          setMaterial('');
          setColor('');
          setSubOption('');
          
          // Reset media files
          setImages([]);
          setDrawings([]);
          setVideos([]);
          
          // Generate new customer ID
          generateNewCustomerID();
        }
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <TreePine className="h-8 w-8 text-emerald-600" />
                  <Sprout className="h-8 w-8 text-teal-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 via-emerald-700 to-teal-800 bg-clip-text text-transparent mb-2">
                Wedabime Pramukayo
              </h1>
              <p className="text-xl text-emerald-700 font-medium">
                Site Visitor Application
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all">
                <a href="/dashboard">
                  <FileText className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              </Button>
              {isEditing && (
                <Button asChild variant="outline" onClick={() => window.location.href = '/'} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all">
                  <a href="/">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </a>
                </Button>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4 inline-block">
              <p className="text-emerald-800 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Editing Mode: Customer ID {customerId}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-6 w-6" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-green-700 font-medium">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={customerId}
                    readOnly
                    className="bg-green-50 border-green-200 font-mono text-green-800"
                    title="Customer ID is auto-generated and cannot be edited"
                  />
                  <p className="text-xs text-green-600">Auto-generated - cannot be edited</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadDate" className="text-green-700 font-medium">Date when the lead received</Label>
                  <Input
                    id="leadDate"
                    type="date"
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    required
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                  {dayOfWeek && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      [{dayOfWeek}]
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-green-700 font-medium">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-green-700 font-medium">Phone Number</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        required
                        className="border-green-200 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWhatsApp"
                        checked={hasWhatsApp}
                        onCheckedChange={(checked) => setHasWhatsApp(checked as boolean)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor="hasWhatsApp" className="flex items-center gap-1 text-green-700">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {!hasWhatsApp && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-green-700 font-medium">Do you have a WhatsApp number?</Label>
                      <RadioGroup value={hasWhatsAppNumber} onValueChange={setHasWhatsAppNumber}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="whatsappYes" className="text-green-600" />
                          <Label htmlFor="whatsappYes" className="text-green-700">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="whatsappNo" className="text-green-600" />
                          <Label htmlFor="whatsappNo" className="text-green-700">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {hasWhatsAppNumber === 'yes' && (
                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber" className="text-green-700 font-medium">WhatsApp Number</Label>
                        <Input
                          id="whatsappNumber"
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Enter WhatsApp number"
                          className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="border-emerald-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <MapPin className="h-6 w-6" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-emerald-700 font-medium">Lead located District</Label>
                  <div className="flex gap-2">
                    <Select value={district} onValueChange={setDistrict} required>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ampara">Ampara</SelectItem>
                        <SelectItem value="Anuradhapura">Anuradhapura</SelectItem>
                        <SelectItem value="Badulla">Badulla</SelectItem>
                        <SelectItem value="Batticaloa">Batticaloa</SelectItem>
                        <SelectItem value="Colombo">Colombo</SelectItem>
                        <SelectItem value="Galle">Galle</SelectItem>
                        <SelectItem value="Gampaha">Gampaha</SelectItem>
                        <SelectItem value="Hambantota">Hambantota</SelectItem>
                        <SelectItem value="Jaffna">Jaffna</SelectItem>
                        <SelectItem value="Kalutara">Kalutara</SelectItem>
                        <SelectItem value="Kandy">Kandy</SelectItem>
                        <SelectItem value="Kegalle">Kegalle</SelectItem>
                        <SelectItem value="Kilinochchi">Kilinochchi</SelectItem>
                        <SelectItem value="Kurunegala">Kurunegala</SelectItem>
                        <SelectItem value="Mannar">Mannar</SelectItem>
                        <SelectItem value="Matale">Matale</SelectItem>
                        <SelectItem value="Matara">Matara</SelectItem>
                        <SelectItem value="Monaragala">Monaragala</SelectItem>
                        <SelectItem value="Mullaitivu">Mullaitivu</SelectItem>
                        <SelectItem value="Nuwara Eliya">Nuwara Eliya</SelectItem>
                        <SelectItem value="Polonnaruwa">Polonnaruwa</SelectItem>
                        <SelectItem value="Puttalam">Puttalam</SelectItem>
                        <SelectItem value="Ratnapura">Ratnapura</SelectItem>
                        <SelectItem value="Trincomalee">Trincomalee</SelectItem>
                        <SelectItem value="Vavuniya">Vavuniya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={requestLocationPermission}
                      disabled={isLoadingLocation}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                      title="Detect my location"
                    >
                      {isLoadingLocation ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      ) : (
                        <Locate className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-emerald-700 font-medium">Lead located City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    required
                    className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-emerald-700 font-medium">Lead located Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-700 font-medium">Google Map Location</Label>
                <div className="space-y-2">
                  <GoogleMap
                    center={mapCenter}
                    marker={currentLocation}
                    onMapClick={handleMapClick}
                    zoom={15}
                  />
                  <p className="text-sm text-emerald-600">
                    Click on the map to set location, or use the location detection button above
                  </p>
                  {currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      <MapPin className="h-4 w-4" />
                      <span>
                        Selected: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="border-teal-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b border-teal-200">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Home className="h-6 w-6" />
                Service Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                    selectedService === 'roof' ? 'ring-2 ring-green-500 bg-green-50 border-green-300' : 'border-teal-200'
                  }`}
                  onClick={() => setSelectedService('roof')}
                >
                  <CardContent className="p-6 text-center">
                    <Home className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800">Roof</h3>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                    selectedService === 'ceiling' ? 'ring-2 ring-green-500 bg-green-50 border-green-300' : 'border-teal-200'
                  }`}
                  onClick={() => setSelectedService('ceiling')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-teal-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="w-2 h-2 bg-white rounded"></div>
                        <div className="w-2 h-2 bg-white rounded"></div>
                        <div className="w-2 h-2 bg-white rounded"></div>
                        <div className="w-2 h-2 bg-white rounded"></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Ceiling</h3>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                    selectedService === 'gutters' ? 'ring-2 ring-green-500 bg-green-50 border-green-300' : 'border-teal-200'
                  }`}
                  onClick={() => setSelectedService('gutters')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-teal-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-1 bg-white rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Gutters</h3>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Ceiling Service Details */}
          {selectedService === 'ceiling' && (
            <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
                <CardTitle className="text-green-800">Ceiling Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-green-700 font-medium">Ceiling Type:</Label>
                  <RadioGroup value={ceilingType} onValueChange={setCeilingType}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eltoro" id="eltoro" className="text-green-600" />
                        <Label htmlFor="eltoro" className="text-green-700">2 x 2 Eltoro Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pvc" id="pvc" className="text-green-600" />
                        <Label htmlFor="pvc" className="text-green-700">2 x 2 PVC Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="panelFlat" id="panelFlat" className="text-green-600" />
                        <Label htmlFor="panelFlat" className="text-green-700">Panel Flat Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="panelBox" id="panelBox" className="text-green-600" />
                        <Label htmlFor="panelBox" className="text-green-700">Panel Box Ceiling</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {ceilingType && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="macfoil" className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                      <Label htmlFor="macfoil" className="text-green-700">Macfoil</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pricePerSqFt" className="text-green-700 font-medium">Price per square feet:</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">Rs.</span>
                          <Input
                            id="pricePerSqFt"
                            type="number"
                            value={pricePerSqFt}
                            onChange={(e) => setPricePerSqFt(parseFloat(e.target.value) || 0)}
                            className="w-24 border-green-200 focus:border-green-400 focus:ring-green-400"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-green-800">Areas</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addArea} className="border-green-600 text-green-700 hover:bg-green-100">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Area
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {areas.map((area, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div className="space-y-2">
                                <Label className="text-green-700">Length:</Label>
                                <Input
                                  value={area.length}
                                  onChange={(e) => updateArea(index, 'length', e.target.value)}
                                  placeholder="e.g., 10' 0&quot;"
                                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-green-700">Width:</Label>
                                <Input
                                  value={area.width}
                                  onChange={(e) => updateArea(index, 'width', e.target.value)}
                                  placeholder="e.g., 10' 0&quot;"
                                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-green-700">Area:</Label>
                                <Input value={area.area > 0 ? `${area.area} sq ft` : ''} readOnly className="bg-green-50 border-green-200" />
                              </div>
                              <div>
                                {areas.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeArea(index)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {getTotalArea() > 0 && (
                            <Card className="bg-white border-green-300">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-green-800">Total Area:</span>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">{getTotalArea().toFixed(2)} sq ft</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-green-800">Total Cost:</span>
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    Rs. {getTotalCost().toLocaleString()}/=
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Gutters Service Details */}
          {selectedService === 'gutters' && (
            <Card className="border-emerald-200 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
                <CardTitle className="text-emerald-800">Gutters Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(guttersMeasurements).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-emerald-700 font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </Label>
                      <div className="relative">
                        <Input
                          value={value}
                          onChange={(e) => setGuttersMeasurements(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder="5' + 6' + 3'"
                          className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                        <div className="absolute -bottom-6 right-0 text-sm text-emerald-600">
                          Total: {calculateMeasurementTotal(value)}'
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nozzelsDontWant"
                        checked={nozzelsDontWant}
                        onCheckedChange={(checked) => setNozzelsDontWant(checked as boolean)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="nozzelsDontWant" className="text-emerald-700">Don't want nozzels</Label>
                    </div>
                    {!nozzelsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="nozzelsCount" className="text-emerald-700 font-medium">Number of Nozzels:</Label>
                        <Input
                          id="nozzelsCount"
                          type="number"
                          value={nozzelsCount}
                          onChange={(e) => setNozzelsCount(e.target.value)}
                          placeholder="Enter number of nozzels"
                          className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="endCapsDontWant"
                        checked={endCapsDontWant}
                        onCheckedChange={(checked) => setEndCapsDontWant(checked as boolean)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="endCapsDontWant" className="text-emerald-700">Don't want end caps</Label>
                    </div>
                    {!endCapsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="endCapsCount" className="text-emerald-700 font-medium">Number of End Caps:</Label>
                        <Input
                          id="endCapsCount"
                          type="number"
                          value={endCapsCount}
                          onChange={(e) => setEndCapsCount(e.target.value)}
                          placeholder="Enter number of end caps"
                          className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="chainPacketsDontWant"
                        checked={chainPacketsDontWant}
                        onCheckedChange={(checked) => setChainPacketsDontWant(checked as boolean)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="chainPacketsDontWant" className="text-emerald-700">Don't want chain packets</Label>
                    </div>
                    {!chainPacketsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="chainPacketsCount" className="text-emerald-700 font-medium">Number of Chain Packets:</Label>
                        <Input
                          id="chainPacketsCount"
                          type="number"
                          value={chainPacketsCount}
                          onChange={(e) => setChainPacketsCount(e.target.value)}
                          placeholder="Enter number of chain packets"
                          className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-emerald-700 font-medium">Wall/F Size:</Label>
                    <RadioGroup value={wallFSize} onValueChange={setWallFSize}>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="9" id="wallF9" className="text-emerald-600" />
                          <Label htmlFor="wallF9" className="text-emerald-700">9"</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12" id="wallF12" className="text-emerald-600" />
                          <Label htmlFor="wallF12" className="text-emerald-700">12"</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {wallFSize && (
                      <div className="space-y-2">
                        <Label className="text-emerald-700 font-medium">Wall/F Measurements:</Label>
                        <div className="relative">
                          <Input
                            value={wallFMeasurements}
                            onChange={(e) => setWallFMeasurements(e.target.value)}
                            placeholder="5' + 6' + 3'"
                            className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                          <div className="absolute -bottom-6 right-0 text-sm text-emerald-600">
                            Total: {calculateMeasurementTotal(wallFMeasurements)}'
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-emerald-700 font-medium">Blind Wall Flashing Size:</Label>
                    <RadioGroup value={blindWallSize} onValueChange={setBlindWallSize}>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="9" id="blindWall9" className="text-emerald-600" />
                          <Label htmlFor="blindWall9" className="text-emerald-700">9"</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12" id="blindWall12" className="text-emerald-600" />
                          <Label htmlFor="blindWall12" className="text-emerald-700">12"</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {blindWallSize && (
                      <div className="space-y-2">
                        <Label className="text-emerald-700 font-medium">Blind Wall Flashing Measurements:</Label>
                        <div className="relative">
                          <Input
                            value={blindWallMeasurements}
                            onChange={(e) => setBlindWallMeasurements(e.target.value)}
                            placeholder="5' + 6' + 3'"
                            className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                          <div className="absolute -bottom-6 right-0 text-sm text-emerald-600">
                            Total: {calculateMeasurementTotal(blindWallMeasurements)}'
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDesignNote" className="text-emerald-700 font-medium">Custom Design Note:</Label>
                  <Textarea
                    id="customDesignNote"
                    value={customDesignNote}
                    onChange={(e) => setCustomDesignNote(e.target.value)}
                    placeholder="Enter custom design notes if applicable"
                    rows={3}
                    className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roof Service Details */}
          {selectedService === 'roof' && (
            <Card className="border-teal-200 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b border-teal-200">
                <CardTitle className="text-teal-800">Roof Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-teal-700 font-medium">Roof Type:</Label>
                  <RadioGroup value={roofType} onValueChange={setRoofType}>
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="roofNew" className="text-teal-600" />
                        <Label htmlFor="roofNew" className="text-teal-700">New Roof</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="repair" id="roofRepair" className="text-teal-600" />
                        <Label htmlFor="roofRepair" className="text-teal-700">Repair Roof</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {roofType === 'new' && (
                  <div className="space-y-4">
                    <Label className="text-teal-700 font-medium">Structure Type:</Label>
                    <RadioGroup value={structureType} onValueChange={setStructureType}>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="wood" id="structureWood" className="text-teal-600" />
                          <Label htmlFor="structureWood" className="text-teal-700">Wood Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="steel" id="structureSteel" className="text-teal-600" />
                          <Label htmlFor="structureSteel" className="text-teal-700">Steel Roof</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {structureType && (
                  <div className="space-y-4">
                    <Label className="text-teal-700 font-medium">Finish Type:</Label>
                    <RadioGroup value={finishType} onValueChange={setFinishType}>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="finishNormal" className="text-teal-600" />
                          <Label htmlFor="finishNormal" className="text-teal-700">
                            {structureType === 'wood' ? 'Wood Normal Roof' : 'Steel Normal Roof'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="finishing" id="finishFinishing" className="text-teal-600" />
                          <Label htmlFor="finishFinishing" className="text-teal-700">
                            {structureType === 'wood' ? 'Wood Finishing Roof' : 'Steel Finishing Roof'}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {finishType && (
                  <div className="space-y-4">
                    <Label className="text-teal-700 font-medium">Material:</Label>
                    <RadioGroup value={material} onValueChange={setMaterial}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestos" id="materialAsbestos" className="text-teal-600" />
                          <Label htmlFor="materialAsbestos" className="text-teal-700">Asbestos (Non Color)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestosColor" id="materialAsbestosColor" className="text-teal-600" />
                          <Label htmlFor="materialAsbestosColor" className="text-teal-700">Asbestos (color up)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tile" id="materialTile" className="text-teal-600" />
                          <Label htmlFor="materialTile" className="text-teal-700">Tile (Ulu)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoNormal" id="materialAmanoNormal" className="text-teal-600" />
                          <Label htmlFor="materialAmanoNormal" className="text-teal-700">Amano Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoCurve" id="materialAmanoCurve" className="text-teal-600" />
                          <Label htmlFor="materialAmanoCurve" className="text-teal-700">Amano Curve Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoTile" id="materialAmanoTile" className="text-teal-600" />
                          <Label htmlFor="materialAmanoTile" className="text-teal-700">Amano Tile Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upvc" id="materialUpvc" className="text-teal-600" />
                          <Label htmlFor="materialUpvc" className="text-teal-700">UPVC Sheet</Label>
                        </div>
                        {finishType === 'normal' && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="transparent" id="materialTransparent" className="text-teal-600" />
                            <Label htmlFor="materialTransparent" className="text-teal-700">Transparent Roofing Sheet</Label>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {material === 'asbestosColor' && (
                  <div className="space-y-4">
                    <Label className="text-teal-700 font-medium">Color Selection:</Label>
                    <RadioGroup value={color} onValueChange={setColor}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tileRed" id="colorTileRed" className="text-teal-600" />
                          <Label htmlFor="colorTileRed" className="text-teal-700">Tile Red</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="colorGreen" className="text-teal-600" />
                          <Label htmlFor="colorGreen" className="text-teal-700">Green</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="brown" id="colorBrown" className="text-teal-600" />
                          <Label htmlFor="colorBrown" className="text-teal-700">Brown</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ash" id="colorAsh" className="text-teal-600" />
                          <Label htmlFor="colorAsh" className="text-teal-700">Ash</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(material === 'amanoCurve' || material === 'upvc') && (
                  <div className="space-y-4">
                    <Label className="text-teal-700 font-medium">
                      {material === 'amanoCurve' ? 'Curve Type:' : 'UPVC Type:'}
                    </Label>
                    <RadioGroup value={subOption} onValueChange={setSubOption}>
                      <div className="space-y-2">
                        {material === 'amanoCurve' ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fullCurve" id="fullCurve" className="text-teal-600" />
                              <Label htmlFor="fullCurve" className="text-teal-700">Full Curve Roof</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="halfCurve" id="halfCurve" className="text-teal-600" />
                              <Label htmlFor="halfCurve" className="text-teal-700">Half Curve Roof</Label>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="jlRoofing" id="jlRoofing" className="text-teal-600" />
                              <Label htmlFor="jlRoofing" className="text-teal-700">J/L Roofing Sheet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="iRoof" id="iRoof" className="text-teal-600" />
                              <Label htmlFor="iRoof" className="text-teal-700">I Roof Roofing Sheet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="antonRoofing" id="antonRoofing" className="text-teal-600" />
                              <Label htmlFor="antonRoofing" className="text-teal-700">Anton Roofing Sheet</Label>
                            </div>
                          </>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(material || color || subOption) && (
                  <Card className="bg-teal-50 border-teal-200">
                    <CardHeader>
                      <CardTitle className="text-teal-800">Selected Configuration:</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {roofType && (
                          <p><strong className="text-teal-700">Roof Type:</strong> {roofType === 'new' ? 'New Roof' : 'Repair Roof'}</p>
                        )}
                        {structureType && (
                          <p><strong className="text-teal-700">Structure:</strong> {structureType === 'wood' ? 'Wood' : 'Steel'}</p>
                        )}
                        {finishType && (
                          <p><strong className="text-teal-700">Finish:</strong> {finishType === 'normal' ? 'Normal' : 'Finishing'}</p>
                        )}
                        {material && (
                          <p><strong className="text-teal-700">Material:</strong> {
                            material === 'asbestos' ? 'Asbestos (Non Color)' :
                            material === 'asbestosColor' ? 'Asbestos (color up)' :
                            material === 'tile' ? 'Tile (Ulu)' :
                            material === 'amanoNormal' ? 'Amano Normal' :
                            material === 'amanoCurve' ? 'Amano Curve Roof' :
                            material === 'amanoTile' ? 'Amano Tile Roof' :
                            material === 'upvc' ? 'UPVC Sheet' :
                            material === 'transparent' ? 'Transparent Roofing Sheet' : material
                          }</p>
                        )}
                        {color && (
                          <p><strong className="text-teal-700">Color:</strong> {
                            color === 'tileRed' ? 'Tile Red' :
                            color === 'green' ? 'Green' :
                            color === 'brown' ? 'Brown' :
                            color === 'ash' ? 'Ash' : color
                          }</p>
                        )}
                        {subOption && (
                          <p><strong className="text-teal-700">Sub-option:</strong> {
                            subOption === 'fullCurve' ? 'Full Curve Roof' :
                            subOption === 'halfCurve' ? 'Half Curve Roof' :
                            subOption === 'jlRoofing' ? 'J/L Roofing Sheet' :
                            subOption === 'iRoof' ? 'I Roof Roofing Sheet' :
                            subOption === 'antonRoofing' ? 'Anton Roofing Sheet' : subOption
                          }</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Media Upload */}
          <MediaUpload
            images={images}
            drawings={drawings}
            videos={videos}
            onImagesChange={setImages}
            onDrawingsChange={setDrawings}
            onVideosChange={setVideos}
            maxImages={20}
            maxDrawings={20}
            maxVideos={3}
            maxVideoDuration={60}
          />

          {/* Additional Charges */}
          <Card className="border-orange-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <DollarSign className="h-6 w-6" />
                Additional Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasRemovals"
                  checked={hasRemovals}
                  onCheckedChange={(checked) => setHasRemovals(checked as boolean)}
                  className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                />
                <Label htmlFor="hasRemovals" className="text-orange-700">Is there has removals?</Label>
              </div>

              {hasRemovals && (
                <div className="space-y-2">
                  <Label htmlFor="removalCharge" className="text-orange-700 font-medium">Removal Charge</Label>
                  <Input
                    id="removalCharge"
                    type="number"
                    value={removalCharge}
                    onChange={(e) => setRemovalCharge(e.target.value)}
                    placeholder="Enter removal charge"
                    step="0.01"
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAdditionalLabor"
                  checked={hasAdditionalLabor}
                  onCheckedChange={(checked) => setHasAdditionalLabor(checked as boolean)}
                  className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                />
                <Label htmlFor="hasAdditionalLabor" className="text-orange-700">Add additional labour charge</Label>
              </div>

              {hasAdditionalLabor && (
                <div className="space-y-2">
                  <Label htmlFor="additionalLaborCharge" className="text-orange-700 font-medium">Additional Labour Charge</Label>
                  <Input
                    id="additionalLaborCharge"
                    type="number"
                    value={additionalLaborCharge}
                    onChange={(e) => setAdditionalLaborCharge(e.target.value)}
                    placeholder="Enter additional labour charge"
                    step="0.01"
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-6 w-6" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup value={status} onValueChange={setStatus}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" className="text-gray-600" />
                    <Label htmlFor="pending" className="text-gray-700">Pending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="running" id="running" className="text-gray-600" />
                    <Label htmlFor="running" className="text-gray-700">Running</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="complete" id="complete" className="text-gray-600" />
                    <Label htmlFor="complete" className="text-gray-700">Complete</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancel" id="cancel" className="text-gray-600" />
                    <Label htmlFor="cancel" className="text-gray-700">Cancel</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isEditing ? 'Update Form' : 'OK Form'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}