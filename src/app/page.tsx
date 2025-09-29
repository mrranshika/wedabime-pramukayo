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
import { CalendarDays, MapPin, Upload, DollarSign, Home, Users, FileText, Camera, Video, Phone, MessageCircle, Plus, Trash2, Calculator } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';

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
  const [customerIds, setCustomerIds] = useState<string[]>([]);
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

  // Generate customer IDs and check for editing mode
  useEffect(() => {
    const generateCustomerIds = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const ids: string[] = [];

      // Single letter prefix (A-Z) - limited for performance
      for (let prefix of letters.slice(0, 5)) { // A-E only
        for (let num = 0; num <= 99; num++) {
          for (let letter of letters.slice(0, 5)) { // A-E only
            for (let suffix = 1; suffix <= 99; suffix++) {
              const numStr = num.toString().padStart(3, '0');
              const suffixStr = suffix.toString().padStart(2, '0');
              ids.push(`${prefix}-${numStr}${letter}${suffixStr}`);
            }
          }
        }
      }
    }

    generateCustomerIds();
    
    // Check for editing mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      loadSiteVisitForEditing(editId);
    } else {
      // Generate new customer ID for new entries
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
      setCustomerId('A-000a01');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">
                Wedabime Pramukayo
              </h1>
              <p className="text-xl text-blue-700 font-medium">
                Site Visitor Application
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                <a href="/dashboard">
                  <FileText className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              </Button>
              {isEditing && (
                <Button asChild variant="outline" onClick={() => window.location.href = '/'}>
                  <a href="/">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </a>
                </Button>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 inline-block">
              <p className="text-blue-800 font-medium">
                Editing Mode: Customer ID {customerId}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-6 w-6" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={customerId}
                    readOnly
                    className="bg-gray-100 font-mono"
                    title="Customer ID is auto-generated and cannot be edited"
                  />
                  <p className="text-xs text-gray-500">Auto-generated - cannot be edited</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadDate">Date when the lead received</Label>
                  <Input
                    id="leadDate"
                    type="date"
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    required
                  />
                  {dayOfWeek && (
                    <p className="text-sm text-gray-600">[{dayOfWeek}]</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWhatsApp"
                        checked={hasWhatsApp}
                        onCheckedChange={(checked) => setHasWhatsApp(checked as boolean)}
                      />
                      <Label htmlFor="hasWhatsApp" className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {!hasWhatsApp && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Do you have a WhatsApp number?</Label>
                      <RadioGroup value={hasWhatsAppNumber} onValueChange={setHasWhatsAppNumber}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="whatsappYes" />
                          <Label htmlFor="whatsappYes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="whatsappNo" />
                          <Label htmlFor="whatsappNo">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {hasWhatsAppNumber === 'yes' && (
                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input
                          id="whatsappNumber"
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Enter WhatsApp number"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <MapPin className="h-6 w-6" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">Lead located District</Label>
                  <Input
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter district"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Lead located City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Lead located Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Google Map Location</Label>
                <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Google Maps integration will be implemented here</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-100 border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Home className="h-6 w-6" />
                Service Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService === 'roof' ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => setSelectedService('roof')}
                >
                  <CardContent className="p-6 text-center">
                    <Home className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800">Roof</h3>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService === 'ceiling' ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => setSelectedService('ceiling')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
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
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService === 'gutters' ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => setSelectedService('gutters')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
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
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-100 border-b border-green-200">
                <CardTitle className="text-green-800">Ceiling Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label>Ceiling Type:</Label>
                  <RadioGroup value={ceilingType} onValueChange={setCeilingType}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eltoro" id="eltoro" />
                        <Label htmlFor="eltoro">2 x 2 Eltoro Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pvc" id="pvc" />
                        <Label htmlFor="pvc">2 x 2 PVC Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="panelFlat" id="panelFlat" />
                        <Label htmlFor="panelFlat">Panel Flat Ceiling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="panelBox" id="panelBox" />
                        <Label htmlFor="panelBox">Panel Box Ceiling</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {ceilingType && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="macfoil" />
                      <Label htmlFor="macfoil">Macfoil</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pricePerSqFt">Price per square feet:</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Rs.</span>
                          <Input
                            id="pricePerSqFt"
                            type="number"
                            value={pricePerSqFt}
                            onChange={(e) => setPricePerSqFt(parseFloat(e.target.value) || 0)}
                            className="w-24"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Areas</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addArea}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Area
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {areas.map((area, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div className="space-y-2">
                                <Label>Length:</Label>
                                <Input
                                  value={area.length}
                                  onChange={(e) => updateArea(index, 'length', e.target.value)}
                                  placeholder="e.g., 10' 0&quot;"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Width:</Label>
                                <Input
                                  value={area.width}
                                  onChange={(e) => updateArea(index, 'width', e.target.value)}
                                  placeholder="e.g., 10' 0&quot;"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Area:</Label>
                                <Input value={area.area > 0 ? `${area.area} sq ft` : ''} readOnly />
                              </div>
                              <div>
                                {areas.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeArea(index)}
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
                                  <span className="font-semibold">Total Area:</span>
                                  <Badge variant="secondary">{getTotalArea().toFixed(2)} sq ft</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">Total Cost:</span>
                                  <Badge variant="default" className="bg-green-600">
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
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-100 border-b border-blue-200">
                <CardTitle className="text-blue-800">Gutters Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(guttersMeasurements).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label>
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
                        />
                        <div className="absolute -bottom-6 right-0 text-sm text-gray-600">
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
                      />
                      <Label htmlFor="nozzelsDontWant">Don't want nozzels</Label>
                    </div>
                    {!nozzelsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="nozzelsCount">Number of Nozzels:</Label>
                        <Input
                          id="nozzelsCount"
                          type="number"
                          value={nozzelsCount}
                          onChange={(e) => setNozzelsCount(e.target.value)}
                          placeholder="Enter number of nozzels"
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
                      />
                      <Label htmlFor="endCapsDontWant">Don't want end caps</Label>
                    </div>
                    {!endCapsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="endCapsCount">Number of End Caps:</Label>
                        <Input
                          id="endCapsCount"
                          type="number"
                          value={endCapsCount}
                          onChange={(e) => setEndCapsCount(e.target.value)}
                          placeholder="Enter number of end caps"
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
                      />
                      <Label htmlFor="chainPacketsDontWant">Don't want chain packets</Label>
                    </div>
                    {!chainPacketsDontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="chainPacketsCount">Number of Chain Packets:</Label>
                        <Input
                          id="chainPacketsCount"
                          type="number"
                          value={chainPacketsCount}
                          onChange={(e) => setChainPacketsCount(e.target.value)}
                          placeholder="Enter number of chain packets"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Wall/F Size:</Label>
                    <RadioGroup value={wallFSize} onValueChange={setWallFSize}>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="9" id="wallF9" />
                          <Label htmlFor="wallF9">9"</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12" id="wallF12" />
                          <Label htmlFor="wallF12">12"</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {wallFSize && (
                      <div className="space-y-2">
                        <Label>Wall/F Measurements:</Label>
                        <div className="relative">
                          <Input
                            value={wallFMeasurements}
                            onChange={(e) => setWallFMeasurements(e.target.value)}
                            placeholder="5' + 6' + 3'"
                          />
                          <div className="absolute -bottom-6 right-0 text-sm text-gray-600">
                            Total: {calculateMeasurementTotal(wallFMeasurements)}'
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Blind Wall Flashing Size:</Label>
                    <RadioGroup value={blindWallSize} onValueChange={setBlindWallSize}>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="9" id="blindWall9" />
                          <Label htmlFor="blindWall9">9"</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12" id="blindWall12" />
                          <Label htmlFor="blindWall12">12"</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {blindWallSize && (
                      <div className="space-y-2">
                        <Label>Blind Wall Flashing Measurements:</Label>
                        <div className="relative">
                          <Input
                            value={blindWallMeasurements}
                            onChange={(e) => setBlindWallMeasurements(e.target.value)}
                            placeholder="5' + 6' + 3'"
                          />
                          <div className="absolute -bottom-6 right-0 text-sm text-gray-600">
                            Total: {calculateMeasurementTotal(blindWallMeasurements)}'
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDesignNote">Custom Design Note:</Label>
                  <Textarea
                    id="customDesignNote"
                    value={customDesignNote}
                    onChange={(e) => setCustomDesignNote(e.target.value)}
                    placeholder="Enter custom design notes if applicable"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roof Service Details */}
          {selectedService === 'roof' && (
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-100 border-b border-green-200">
                <CardTitle className="text-green-800">Roof Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label>Roof Type:</Label>
                  <RadioGroup value={roofType} onValueChange={setRoofType}>
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="roofNew" />
                        <Label htmlFor="roofNew">New Roof</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="repair" id="roofRepair" />
                        <Label htmlFor="roofRepair">Repair Roof</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {roofType === 'new' && (
                  <div className="space-y-4">
                    <Label>Structure Type:</Label>
                    <RadioGroup value={structureType} onValueChange={setStructureType}>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="wood" id="structureWood" />
                          <Label htmlFor="structureWood">Wood Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="steel" id="structureSteel" />
                          <Label htmlFor="structureSteel">Steel Roof</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {structureType && (
                  <div className="space-y-4">
                    <Label>Finish Type:</Label>
                    <RadioGroup value={finishType} onValueChange={setFinishType}>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="finishNormal" />
                          <Label htmlFor="finishNormal">
                            {structureType === 'wood' ? 'Wood Normal Roof' : 'Steel Normal Roof'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="finishing" id="finishFinishing" />
                          <Label htmlFor="finishFinishing">
                            {structureType === 'wood' ? 'Wood Finishing Roof' : 'Steel Finishing Roof'}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {finishType && (
                  <div className="space-y-4">
                    <Label>Material:</Label>
                    <RadioGroup value={material} onValueChange={setMaterial}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestos" id="materialAsbestos" />
                          <Label htmlFor="materialAsbestos">Asbestos (Non Color)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestosColor" id="materialAsbestosColor" />
                          <Label htmlFor="materialAsbestosColor">Asbestos (color up)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tile" id="materialTile" />
                          <Label htmlFor="materialTile">Tile (Ulu)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoNormal" id="materialAmanoNormal" />
                          <Label htmlFor="materialAmanoNormal">Amano Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoCurve" id="materialAmanoCurve" />
                          <Label htmlFor="materialAmanoCurve">Amano Curve Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amanoTile" id="materialAmanoTile" />
                          <Label htmlFor="materialAmanoTile">Amano Tile Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upvc" id="materialUpvc" />
                          <Label htmlFor="materialUpvc">UPVC Sheet</Label>
                        </div>
                        {finishType === 'normal' && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="transparent" id="materialTransparent" />
                            <Label htmlFor="materialTransparent">Transparent Roofing Sheet</Label>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {material === 'asbestosColor' && (
                  <div className="space-y-4">
                    <Label>Color Selection:</Label>
                    <RadioGroup value={color} onValueChange={setColor}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tileRed" id="colorTileRed" />
                          <Label htmlFor="colorTileRed">Tile Red</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="colorGreen" />
                          <Label htmlFor="colorGreen">Green</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="brown" id="colorBrown" />
                          <Label htmlFor="colorBrown">Brown</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ash" id="colorAsh" />
                          <Label htmlFor="colorAsh">Ash</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(material === 'amanoCurve' || material === 'upvc') && (
                  <div className="space-y-4">
                    <Label>
                      {material === 'amanoCurve' ? 'Curve Type:' : 'UPVC Type:'}
                    </Label>
                    <RadioGroup value={subOption} onValueChange={setSubOption}>
                      <div className="space-y-2">
                        {material === 'amanoCurve' ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fullCurve" id="fullCurve" />
                              <Label htmlFor="fullCurve">Full Curve Roof</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="halfCurve" id="halfCurve" />
                              <Label htmlFor="halfCurve">Half Curve Roof</Label>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="jlRoofing" id="jlRoofing" />
                              <Label htmlFor="jlRoofing">J/L Roofing Sheet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="iRoof" id="iRoof" />
                              <Label htmlFor="iRoof">I Roof Roofing Sheet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="antonRoofing" id="antonRoofing" />
                              <Label htmlFor="antonRoofing">Anton Roofing Sheet</Label>
                            </div>
                          </>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(material || color || subOption) && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-yellow-800">Selected Configuration:</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {roofType && (
                          <p><strong>Roof Type:</strong> {roofType === 'new' ? 'New Roof' : 'Repair Roof'}</p>
                        )}
                        {structureType && (
                          <p><strong>Structure:</strong> {structureType === 'wood' ? 'Wood' : 'Steel'}</p>
                        )}
                        {finishType && (
                          <p><strong>Finish:</strong> {finishType === 'normal' ? 'Normal' : 'Finishing'}</p>
                        )}
                        {material && (
                          <p><strong>Material:</strong> {
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
                          <p><strong>Color:</strong> {
                            color === 'tileRed' ? 'Tile Red' :
                            color === 'green' ? 'Green' :
                            color === 'brown' ? 'Brown' :
                            color === 'ash' ? 'Ash' : color
                          }</p>
                        )}
                        {subOption && (
                          <p><strong>Sub-option:</strong> {
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
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-orange-100 border-b border-orange-200">
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
                />
                <Label htmlFor="hasRemovals">Is there has removals?</Label>
              </div>

              {hasRemovals && (
                <div className="space-y-2">
                  <Label htmlFor="removalCharge">Removal Charge</Label>
                  <Input
                    id="removalCharge"
                    type="number"
                    value={removalCharge}
                    onChange={(e) => setRemovalCharge(e.target.value)}
                    placeholder="Enter removal charge"
                    step="0.01"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAdditionalLabor"
                  checked={hasAdditionalLabor}
                  onCheckedChange={(checked) => setHasAdditionalLabor(checked as boolean)}
                />
                <Label htmlFor="hasAdditionalLabor">Add additional labour charge</Label>
              </div>

              {hasAdditionalLabor && (
                <div className="space-y-2">
                  <Label htmlFor="additionalLaborCharge">Additional Labour Charge</Label>
                  <Input
                    id="additionalLaborCharge"
                    type="number"
                    value={additionalLaborCharge}
                    onChange={(e) => setAdditionalLaborCharge(e.target.value)}
                    placeholder="Enter additional labour charge"
                    step="0.01"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-6 w-6" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup value={status} onValueChange={setStatus}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending">Pending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="running" id="running" />
                    <Label htmlFor="running">Running</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="complete" id="complete" />
                    <Label htmlFor="complete">Complete</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancel" id="cancel" />
                    <Label htmlFor="cancel">Cancel</Label>
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
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
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
                  {isEditing ? 'Update Form' : 'Submit Form'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}