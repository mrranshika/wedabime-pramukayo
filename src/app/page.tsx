"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, MessageCircle, Calendar, User, Upload, Video, Image, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // Basic customer information
  const [customerId, setCustomerId] = useState("");
  const [leadDate, setLeadDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [hasWhatsAppNumber, setHasWhatsAppNumber] = useState<"yes" | "no">("no");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Location information
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  
  // Additional charges
  const [hasRemovals, setHasRemovals] = useState(false);
  const [removalCharge, setRemovalCharge] = useState("");
  const [hasAdditionalLabor, setHasAdditionalLabor] = useState(false);
  const [additionalLaborCharge, setAdditionalLaborCharge] = useState("");
  
  // Service selection
  const [selectedService, setSelectedService] = useState<"roof" | "ceiling" | "gutters" | null>(null);
  
  // Status
  const [status, setStatus] = useState<"pending" | "running" | "complete" | "cancel">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Collect all form data
      const formData = {
        // Basic customer information
        customerId,
        leadDate,
        customerName,
        phoneNumber,
        hasWhatsApp,
        hasWhatsAppNumber,
        whatsappNumber,
        
        // Location information
        district,
        city,
        address,
        
        // Additional charges
        hasRemovals,
        removalCharge: removalCharge ? parseFloat(removalCharge) : null,
        hasAdditionalLabor,
        additionalLaborCharge: additionalLaborCharge ? parseFloat(additionalLaborCharge) : null,
        
        // Service selection and details
        selectedService,
        
        // Status
        status,
        
        // Service-specific data
        ...(selectedService === "ceiling" && {
          ceilingData: {
            type: ceilingType,
            hasMacfoil: macfoil,
            pricePerSqFt: parseFloat(pricePerSqFt),
            areas: areas.filter(area => area.length && area.width).map(area => ({
              length: area.length,
              width: area.width,
              areaSqFt: parseFloat(calculateArea(area.length, area.width))
            })),
            totalArea: parseFloat(calculateTotalArea()),
            totalCost: parseFloat(calculateTotalCost()),
            quotationNumber
          }
        }),
        
        ...(selectedService === "gutters" && {
          guttersData: {
            measurements: {
              guttersValanceB: guttersMeasurements.guttersValanceB,
              bFlashingValanceB: guttersMeasurements.bFlashingValanceB,
              gutters: guttersMeasurements.gutters,
              valanceB: guttersMeasurements.valanceB,
              bFlashing: guttersMeasurements.bFlashing,
              dPipes: guttersMeasurements.dPipes,
              ridgeCover: guttersMeasurements.ridgeCover,
              ratGuard: guttersMeasurements.ratGuard
            },
            items: {
              nozzels: guttersMeasurements.nozzels.dontWant ? null : (guttersMeasurements.nozzels.count ? parseInt(guttersMeasurements.nozzels.count) : null),
              endCaps: guttersMeasurements.endCaps.dontWant ? null : (guttersMeasurements.endCaps.count ? parseInt(guttersMeasurements.endCaps.count) : null),
              chainPackets: guttersMeasurements.chainPackets.dontWant ? null : (guttersMeasurements.chainPackets.count ? parseInt(guttersMeasurements.chainPackets.count) : null)
            },
            wallF: guttersMeasurements.wallF.size ? {
              size: guttersMeasurements.wallF.size,
              measurements: guttersMeasurements.wallF.measurements
            } : null,
            blindWallFlashing: guttersMeasurements.blindWallFlashing.size ? {
              size: guttersMeasurements.blindWallFlashing.size,
              measurements: guttersMeasurements.blindWallFlashing.measurements
            } : null,
            customDesignNote: guttersMeasurements.customDesignNote,
            quotationNumber: guttersQuotationNumber
          }
        }),
        
        ...(selectedService === "roof" && {
          roofData: {
            roofType: roofSelection.roofType,
            structureType: roofSelection.structureType,
            finishType: roofSelection.finishType,
            material: roofSelection.material,
            color: roofSelection.color,
            subOption: roofSelection.subOption,
            quotationNumber: roofSelection.roofQuotationNumber
          }
        })
      };

      // Send data to API
      const response = await fetch('/api/site-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success!",
          description: "Site visit form submitted successfully.",
          variant: "default",
        });
        
        // Optionally reset form or redirect
        // resetForm();
      } else {
        throw new Error(result.message || "Failed to submit form");
      }

    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error!",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ceiling specific state
  const [ceilingType, setCeilingType] = useState("");
  const [macfoil, setMacfoil] = useState(false);
  const [areas, setAreas] = useState([{ id: 1, length: "", width: "" }]);
  const [pricePerSqFt, setPricePerSqFt] = useState("180");
  const [quotationNumber, setQuotationNumber] = useState("");

  // Gutters specific state
  const [guttersMeasurements, setGuttersMeasurements] = useState({
    guttersValanceB: "",
    bFlashingValanceB: "",
    gutters: "",
    valanceB: "",
    bFlashing: "",
    dPipes: "",
    nozzels: { count: "", dontWant: false },
    endCaps: { count: "", dontWant: false },
    chainPackets: { count: "", dontWant: false },
    wallF: { size: "", measurements: "" },
    blindWallFlashing: { size: "", measurements: "" },
    ridgeCover: "",
    ratGuard: "",
    customDesignNote: ""
  });
  const [guttersQuotationNumber, setGuttersQuotationNumber] = useState("");

  // Roof specific state
  const [roofSelection, setRoofSelection] = useState<{
    roofType: "new" | "repair" | null;
    structureType: "wood" | "steel" | null;
    finishType: "normal" | "finishing" | null;
    material: string | null;
    color: string | null;
    subOption: string | null;
    roofQuotationNumber: string;
  }>({
    roofType: null,
    structureType: null,
    finishType: null,
    material: null,
    color: null,
    subOption: null,
    roofQuotationNumber: ""
  });

  const updateRoofSelection = (field: string, value: any) => {
    setRoofSelection(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetDependentFields = (field: string) => {
    const resetMap: Record<string, string[]> = {
      roofType: ["structureType", "finishType", "material", "color", "subOption"],
      structureType: ["finishType", "material", "color", "subOption"],
      finishType: ["material", "color", "subOption"],
      material: ["color", "subOption"],
      color: ["subOption"]
    };

    const fieldsToReset = resetMap[field] || [];
    const updates: any = {};
    fieldsToReset.forEach(f => {
      updates[f] = null;
    });

    setRoofSelection(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updateGuttersMeasurement = (field: string, value: string | { count: string; dontWant: boolean } | { size: string; measurements: string }) => {
    setGuttersMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseMeasurements = (measurementString: string) => {
    if (!measurementString.trim()) return 0;
    
    const measurements = measurementString.split('+').map(m => m.trim());
    let total = 0;
    
    measurements.forEach(measurement => {
      const feetMatch = measurement.match(/(\d+)'/);
      if (feetMatch) {
        total += parseInt(feetMatch[1]);
      }
    });
    
    return total;
  };

  const formatMeasurementTotal = (measurementString: string) => {
    const total = parseMeasurements(measurementString);
    if (total === 0) return "";
    return `${measurementString} = ${total}'`;
  };

  const MeasurementInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "5' + 6' + 3'" 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <p className="text-sm text-gray-600">
          Total: {parseMeasurements(value)}'
        </p>
      )}
    </div>
  );

  // Generate customer ID options
  const generateCustomerIdOptions = () => {
    const options = [];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Single letter prefix (A-Z)
    for (let prefix of letters) {
      for (let num = 0; num <= 999; num++) {
        for (let letter of letters) {
          for (let suffix = 1; suffix <= 99; suffix++) {
            const numStr = num.toString().padStart(3, '0');
            const suffixStr = suffix.toString().padStart(2, '0');
            options.push(`${prefix}-${numStr}${letter}${suffixStr}`);
          }
        }
      }
    }
    
    // Double letter prefix (AA-ZZ)
    for (let firstLetter of letters) {
      for (let secondLetter of letters) {
        const prefix = firstLetter + secondLetter;
        for (let num = 0; num <= 999; num++) {
          for (let letter of letters) {
            for (let suffix = 1; suffix <= 99; suffix++) {
              const numStr = num.toString().padStart(3, '0');
              const suffixStr = suffix.toString().padStart(2, '0');
              options.push(`${prefix}-${numStr}${letter}${suffixStr}`);
            }
          }
        }
      }
    }
    
    // Triple letter prefix (AAA-ZZZ) - limited to AAA for now
    for (let num = 0; num <= 999; num++) {
      for (let letter of letters) {
        for (let suffix = 1; suffix <= 99; suffix++) {
          const numStr = num.toString().padStart(3, '0');
          const suffixStr = suffix.toString().padStart(2, '0');
          options.push(`AAA-${numStr}${letter}${suffixStr}`);
        }
      }
    }
    
    return options.slice(0, 1000); // Limit for performance
  };

  const customerIdOptions = generateCustomerIdOptions();

  const addArea = () => {
    if (areas.length < 10) {
      setAreas([...areas, { id: areas.length + 1, length: "", width: "" }]);
    }
  };

  const removeArea = (id: number) => {
    setAreas(areas.filter(area => area.id !== id));
  };

  const updateArea = (id: number, field: "length" | "width", value: string) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const calculateArea = (length: string, width: string) => {
    const parseFeetInches = (measurement: string) => {
      const feetMatch = measurement.match(/(\d+)'/);
      const inchesMatch = measurement.match(/(\d+)"/);
      
      const feet = feetMatch ? parseInt(feetMatch[1]) : 0;
      const inches = inchesMatch ? parseInt(inchesMatch[1]) : 0;
      
      return feet + (inches / 12);
    };

    const lengthFt = parseFeetInches(length);
    const widthFt = parseFeetInches(width);
    
    return (lengthFt * widthFt).toFixed(2);
  };

  const calculateTotalArea = () => {
    let total = 0;
    areas.forEach(area => {
      if (area.length && area.width) {
        total += parseFloat(calculateArea(area.length, area.width));
      }
    });
    return total.toFixed(2);
  };

  const calculateTotalCost = () => {
    const totalArea = parseFloat(calculateTotalArea());
    const price = parseFloat(pricePerSqFt) || 0;
    return (totalArea * price).toFixed(2);
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Wedabime Pramukayo</h1>
          <p className="text-lg text-blue-700">Site Visitor Application</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer ID */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer ID" />
                </SelectTrigger>
                <SelectContent>
                  {customerIdOptions.map((id) => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="leadDate">Date when the lead received</Label>
              <Input
                id="leadDate"
                type="date"
                value={leadDate}
                onChange={(e) => setLeadDate(e.target.value)}
              />
              {leadDate && (
                <p className="text-sm text-gray-600">
                  {leadDate} [{getDayOfWeek(leadDate)}]
                </p>
              )}
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp"
                      checked={hasWhatsApp}
                      onCheckedChange={(checked) => setHasWhatsApp(checked as boolean)}
                    />
                    <Label htmlFor="whatsapp" className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Available on WhatsApp
                    </Label>
                  </div>
                </div>
              </div>

              {/* WhatsApp conditional logic */}
              {!hasWhatsApp && (
                <div className="space-y-3 ml-4 p-4 bg-gray-50 rounded-lg">
                  <Label>Do you have a WhatsApp number?</Label>
                  <RadioGroup
                    value={hasWhatsAppNumber}
                    onValueChange={(value) => setHasWhatsAppNumber(value as "yes" | "no")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="whatsapp-yes" />
                      <Label htmlFor="whatsapp-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="whatsapp-no" />
                      <Label htmlFor="whatsapp-no">No</Label>
                    </div>
                  </RadioGroup>

                  {hasWhatsAppNumber === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <MapPin className="w-5 h-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">Lead located District</Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter district"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Lead located City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
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
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Google Maps integration will be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Upload className="w-5 h-5" />
              Media Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                <Label>Site Drawing & Images & Site Photos (Max 20)</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Upload Image {index}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <Label>Videos (2 videos, max 30 seconds each)</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((index) => (
                  <div key={index} className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Upload Video {index}</p>
                      <p className="text-xs text-gray-400">Max 30 seconds</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Charges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-orange-700">Additional Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="removals"
                checked={hasRemovals}
                onCheckedChange={(checked) => setHasRemovals(checked as boolean)}
              />
              <Label htmlFor="removals">Is there has removals?</Label>
            </div>
            {hasRemovals && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="removalCharge">Removal Charge</Label>
                <Input
                  id="removalCharge"
                  value={removalCharge}
                  onChange={(e) => setRemovalCharge(e.target.value)}
                  placeholder="Enter removal charge"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="additionalLabor"
                checked={hasAdditionalLabor}
                onCheckedChange={(checked) => setHasAdditionalLabor(checked as boolean)}
              />
              <Label htmlFor="additionalLabor">Add additional labour charge</Label>
            </div>
            {hasAdditionalLabor && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="additionalLaborCharge">Additional Labour Charge</Label>
                <Input
                  id="additionalLaborCharge"
                  value={additionalLaborCharge}
                  onChange={(e) => setAdditionalLaborCharge(e.target.value)}
                  placeholder="Enter additional labour charge"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-indigo-700">Service Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedService || ""}
              onValueChange={(value) => setSelectedService(value as "roof" | "ceiling" | "gutters")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roof" id="roof" />
                <Label htmlFor="roof">Roof</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ceiling" id="ceiling" />
                <Label htmlFor="ceiling">Ceiling</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gutters" id="gutters" />
                <Label htmlFor="gutters">Gutters</Label>
              </div>
            </RadioGroup>

            {/* Ceiling Service Details */}
            {selectedService === "ceiling" && (
              <div className="ml-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <h3 className="font-semibold text-blue-800">Ceiling Details</h3>
                
                <div className="space-y-3">
                  <Label>Ceiling Type:</Label>
                  <RadioGroup value={ceilingType} onValueChange={setCeilingType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eltoro" id="eltoro" />
                      <Label htmlFor="eltoro">2 x 2 Eltoro Ceiling</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pvc" id="pvc" />
                      <Label htmlFor="pvc">2 x 2 PVC Ceiling</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="panel-flat" id="panel-flat" />
                      <Label htmlFor="panel-flat">Panel Flat Ceiling</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="panel-box" id="panel-box" />
                      <Label htmlFor="panel-box">Panel Box Ceiling</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="macfoil"
                    checked={macfoil}
                    onCheckedChange={(checked) => setMacfoil(checked as boolean)}
                  />
                  <Label htmlFor="macfoil">Macfoil</Label>
                </div>

                {ceilingType && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerSqFt">Price per square feet:</Label>
                      <Input
                        id="pricePerSqFt"
                        value={pricePerSqFt}
                        onChange={(e) => setPricePerSqFt(e.target.value)}
                        type="number"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Areas:</Label>
                        <Button
                          type="button"
                          onClick={addArea}
                          size="sm"
                          disabled={areas.length >= 10}
                        >
                          Add Area
                        </Button>
                      </div>
                      
                      {areas.map((area) => (
                        <div key={area.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                          <div className="space-y-1">
                            <Label htmlFor={`length-${area.id}`}>Length:</Label>
                            <Input
                              id={`length-${area.id}`}
                              value={area.length}
                              onChange={(e) => updateArea(area.id, "length", e.target.value)}
                              placeholder="e.g., 10' 0&quot;"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`width-${area.id}`}>Width:</Label>
                            <Input
                              id={`width-${area.id}`}
                              value={area.width}
                              onChange={(e) => updateArea(area.id, "width", e.target.value)}
                              placeholder="e.g., 10' 0&quot;"
                            />
                          </div>
                          <div className="flex gap-2">
                            {area.length && area.width && (
                              <Badge variant="secondary">
                                {calculateArea(area.length, area.width)} sq ft
                              </Badge>
                            )}
                            {areas.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeArea(area.id)}
                                size="sm"
                                variant="destructive"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {areas.some(area => area.length && area.width) && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Total Area:</Label>
                              <p className="text-lg font-semibold">{calculateTotalArea()} sq ft</p>
                            </div>
                            <div>
                              <Label>Total Cost:</Label>
                              <p className="text-lg font-semibold">Rs. {parseFloat(calculateTotalCost()).toLocaleString()}/=</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quotationNumber">Quotation Number:</Label>
                      <Input
                        id="quotationNumber"
                        value={quotationNumber}
                        onChange={(e) => setQuotationNumber(e.target.value)}
                        placeholder="Enter quotation number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quotation Attachment (PDF):</Label>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Upload PDF quotation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gutters Service Details */}
            {selectedService === "gutters" && (
              <div className="ml-6 p-4 bg-green-50 rounded-lg space-y-6">
                <h3 className="font-semibold text-green-800">Gutters Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput
                    label="Gutters & Valance/B:"
                    value={guttersMeasurements.guttersValanceB}
                    onChange={(value) => updateGuttersMeasurement("guttersValanceB", value)}
                  />
                  <MeasurementInput
                    label="B/Flashing & Valance/B:"
                    value={guttersMeasurements.bFlashingValanceB}
                    onChange={(value) => updateGuttersMeasurement("bFlashingValanceB", value)}
                  />
                  <MeasurementInput
                    label="Gutters:"
                    value={guttersMeasurements.gutters}
                    onChange={(value) => updateGuttersMeasurement("gutters", value)}
                  />
                  <MeasurementInput
                    label="Valance/B:"
                    value={guttersMeasurements.valanceB}
                    onChange={(value) => updateGuttersMeasurement("valanceB", value)}
                  />
                  <MeasurementInput
                    label="B/Flashing:"
                    value={guttersMeasurements.bFlashing}
                    onChange={(value) => updateGuttersMeasurement("bFlashing", value)}
                  />
                  <MeasurementInput
                    label="D/Pipes:"
                    value={guttersMeasurements.dPipes}
                    onChange={(value) => updateGuttersMeasurement("dPipes", value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nozzels-dont-want"
                        checked={guttersMeasurements.nozzels.dontWant}
                        onCheckedChange={(checked) => 
                          updateGuttersMeasurement("nozzels", { 
                            ...guttersMeasurements.nozzels, 
                            dontWant: checked as boolean 
                          })
                        }
                      />
                      <Label htmlFor="nozzels-dont-want">Don't want nozzels</Label>
                    </div>
                    {!guttersMeasurements.nozzels.dontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="nozzels-count">Number of Nozzels:</Label>
                        <Input
                          id="nozzels-count"
                          value={guttersMeasurements.nozzels.count}
                          onChange={(e) => 
                            updateGuttersMeasurement("nozzels", { 
                              ...guttersMeasurements.nozzels, 
                              count: e.target.value 
                            })
                          }
                          placeholder="Enter number of nozzels"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="endcaps-dont-want"
                        checked={guttersMeasurements.endCaps.dontWant}
                        onCheckedChange={(checked) => 
                          updateGuttersMeasurement("endCaps", { 
                            ...guttersMeasurements.endCaps, 
                            dontWant: checked as boolean 
                          })
                        }
                      />
                      <Label htmlFor="endcaps-dont-want">Don't want end caps</Label>
                    </div>
                    {!guttersMeasurements.endCaps.dontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="endcaps-count">Number of End Caps:</Label>
                        <Input
                          id="endcaps-count"
                          value={guttersMeasurements.endCaps.count}
                          onChange={(e) => 
                            updateGuttersMeasurement("endCaps", { 
                              ...guttersMeasurements.endCaps, 
                              count: e.target.value 
                            })
                          }
                          placeholder="Enter number of end caps"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="chainpackets-dont-want"
                        checked={guttersMeasurements.chainPackets.dontWant}
                        onCheckedChange={(checked) => 
                          updateGuttersMeasurement("chainPackets", { 
                            ...guttersMeasurements.chainPackets, 
                            dontWant: checked as boolean 
                          })
                        }
                      />
                      <Label htmlFor="chainpackets-dont-want">Don't want chain packets</Label>
                    </div>
                    {!guttersMeasurements.chainPackets.dontWant && (
                      <div className="space-y-2">
                        <Label htmlFor="chainpackets-count">Number of Chain Packets:</Label>
                        <Input
                          id="chainpackets-count"
                          value={guttersMeasurements.chainPackets.count}
                          onChange={(e) => 
                            updateGuttersMeasurement("chainPackets", { 
                              ...guttersMeasurements.chainPackets, 
                              count: e.target.value 
                            })
                          }
                          placeholder="Enter number of chain packets"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Wall/F Size:</Label>
                    <RadioGroup
                      value={guttersMeasurements.wallF.size}
                      onValueChange={(value) => 
                        updateGuttersMeasurement("wallF", { 
                          ...guttersMeasurements.wallF, 
                          size: value 
                        })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="9" id="wallf-9" />
                        <Label htmlFor="wallf-9">9"</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="wallf-12" />
                        <Label htmlFor="wallf-12">12"</Label>
                      </div>
                    </RadioGroup>
                    {guttersMeasurements.wallF.size && (
                      <MeasurementInput
                        label="Wall/F Measurements:"
                        value={guttersMeasurements.wallF.measurements}
                        onChange={(value) => 
                          updateGuttersMeasurement("wallF", { 
                            ...guttersMeasurements.wallF, 
                            measurements: value 
                          })
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Blind Wall Flashing Size:</Label>
                    <RadioGroup
                      value={guttersMeasurements.blindWallFlashing.size}
                      onValueChange={(value) => 
                        updateGuttersMeasurement("blindWallFlashing", { 
                          ...guttersMeasurements.blindWallFlashing, 
                          size: value 
                        })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="9" id="blindwall-9" />
                        <Label htmlFor="blindwall-9">9"</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="blindwall-12" />
                        <Label htmlFor="blindwall-12">12"</Label>
                      </div>
                    </RadioGroup>
                    {guttersMeasurements.blindWallFlashing.size && (
                      <MeasurementInput
                        label="Blind Wall Flashing Measurements:"
                        value={guttersMeasurements.blindWallFlashing.measurements}
                        onChange={(value) => 
                          updateGuttersMeasurement("blindWallFlashing", { 
                            ...guttersMeasurements.blindWallFlashing, 
                            measurements: value 
                          })
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MeasurementInput
                    label="Ridge Cover:"
                    value={guttersMeasurements.ridgeCover}
                    onChange={(value) => updateGuttersMeasurement("ridgeCover", value)}
                  />
                  <MeasurementInput
                    label="Rat Guard:"
                    value={guttersMeasurements.ratGuard}
                    onChange={(value) => updateGuttersMeasurement("ratGuard", value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-design-note">Custom Design Note:</Label>
                  <Textarea
                    id="custom-design-note"
                    value={guttersMeasurements.customDesignNote}
                    onChange={(e) => updateGuttersMeasurement("customDesignNote", e.target.value)}
                    placeholder="Enter custom design notes if applicable"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gutters-quotation-number">Quotation Number:</Label>
                    <Input
                      id="gutters-quotation-number"
                      value={guttersQuotationNumber}
                      onChange={(e) => setGuttersQuotationNumber(e.target.value)}
                      placeholder="Enter quotation number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quotation Attachment (PDF):</Label>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Upload PDF quotation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roof Service Details */}
            {selectedService === "roof" && (
              <div className="ml-6 p-4 bg-orange-50 rounded-lg space-y-6">
                <h3 className="font-semibold text-orange-800">Roof Details</h3>
                
                {/* Roof Type Selection */}
                <div className="space-y-3">
                  <Label>Roof Type:</Label>
                  <RadioGroup
                    value={roofSelection.roofType || ""}
                    onValueChange={(value) => {
                      updateRoofSelection("roofType", value);
                      resetDependentFields("roofType");
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="roof-new" />
                      <Label htmlFor="roof-new">New Roof</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="repair" id="roof-repair" />
                      <Label htmlFor="roof-repair">Repair Roof</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Structure Type Selection (only for New Roof) */}
                {roofSelection.roofType === "new" && (
                  <div className="space-y-3">
                    <Label>Structure Type:</Label>
                    <RadioGroup
                      value={roofSelection.structureType || ""}
                      onValueChange={(value) => {
                        updateRoofSelection("structureType", value);
                        resetDependentFields("structureType");
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wood" id="structure-wood" />
                        <Label htmlFor="structure-wood">Wood Roof</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="steel" id="structure-steel" />
                        <Label htmlFor="structure-steel">Steel Roof</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Finish Type Selection */}
                {roofSelection.structureType && (
                  <div className="space-y-3">
                    <Label>Finish Type:</Label>
                    <RadioGroup
                      value={roofSelection.finishType || ""}
                      onValueChange={(value) => {
                        updateRoofSelection("finishType", value);
                        resetDependentFields("finishType");
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="finish-normal" />
                        <Label htmlFor="finish-normal">
                          {roofSelection.structureType === "wood" ? "Wood Normal Roof" : "Steel Normal Roof"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="finishing" id="finish-finishing" />
                        <Label htmlFor="finish-finishing">
                          {roofSelection.structureType === "wood" ? "Wood Finishing Roof" : "Steel Finishing Roof"}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Material Selection */}
                {roofSelection.finishType && (
                  <div className="space-y-3">
                    <Label>Material:</Label>
                    <RadioGroup
                      value={roofSelection.material || ""}
                      onValueChange={(value) => {
                        updateRoofSelection("material", value);
                        resetDependentFields("material");
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestos" id="material-asbestos" />
                          <Label htmlFor="material-asbestos">Asbestos (Non Color)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asbestos-color" id="material-asbestos-color" />
                          <Label htmlFor="material-asbestos-color">Asbestos (color up)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tile" id="material-tile" />
                          <Label htmlFor="material-tile">Tile (Ulu)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amano-normal" id="material-amano-normal" />
                          <Label htmlFor="material-amano-normal">Amano Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amano-curve" id="material-amano-curve" />
                          <Label htmlFor="material-amano-curve">Amano Curve Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amano-tile" id="material-amano-tile" />
                          <Label htmlFor="material-amano-tile">Amano Tile Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upvc" id="material-upvc" />
                          <Label htmlFor="material-upvc">UPVC Sheet</Label>
                        </div>
                        {roofSelection.finishType === "normal" && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="transparent" id="material-transparent" />
                            <Label htmlFor="material-transparent">Transparent Roofing Sheet</Label>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Color Selection (for Asbestos color up) */}
                {roofSelection.material === "asbestos-color" && (
                  <div className="space-y-3">
                    <Label>Color Selection:</Label>
                    <RadioGroup
                      value={roofSelection.color || ""}
                      onValueChange={(value) => {
                        updateRoofSelection("color", value);
                        resetDependentFields("color");
                      }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tile-red" id="color-tile-red" />
                          <Label htmlFor="color-tile-red">Tile Red</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="color-green" />
                          <Label htmlFor="color-green">Green</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="brown" id="color-brown" />
                          <Label htmlFor="color-brown">Brown</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ash" id="color-ash" />
                          <Label htmlFor="color-ash">Ash</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Sub-options for Amano Curve Roof */}
                {roofSelection.material === "amano-curve" && (
                  <div className="space-y-3">
                    <Label>Curve Type:</Label>
                    <RadioGroup
                      value={roofSelection.subOption || ""}
                      onValueChange={(value) => updateRoofSelection("subOption", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full-curve" id="suboption-full-curve" />
                        <Label htmlFor="suboption-full-curve">Full Curve Roof</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="half-curve" id="suboption-half-curve" />
                        <Label htmlFor="suboption-half-curve">Half Curve Roof</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Sub-options for UPVC Sheet */}
                {roofSelection.material === "upvc" && (
                  <div className="space-y-3">
                    <Label>UPVC Type:</Label>
                    <RadioGroup
                      value={roofSelection.subOption || ""}
                      onValueChange={(value) => updateRoofSelection("subOption", value)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="jl-roofing" id="upvc-jl" />
                          <Label htmlFor="upvc-jl">J/L Roofing Sheet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="i-roof" id="upvc-i" />
                          <Label htmlFor="upvc-i">I Roof Roofing Sheet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anton" id="upvc-anton" />
                          <Label htmlFor="upvc-anton">Anton Roofing Sheet</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Selection Summary */}
                {roofSelection.material && (
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold mb-2">Selected Configuration:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Roof Type:</strong> {roofSelection.roofType === "new" ? "New Roof" : "Repair Roof"}</p>
                      {roofSelection.structureType && (
                        <p><strong>Structure:</strong> {roofSelection.structureType === "wood" ? "Wood" : "Steel"}</p>
                      )}
                      {roofSelection.finishType && (
                        <p><strong>Finish:</strong> {roofSelection.finishType === "normal" ? "Normal" : "Finishing"}</p>
                      )}
                      <p><strong>Material:</strong> {
                        roofSelection.material === "asbestos" ? "Asbestos (Non Color)" :
                        roofSelection.material === "asbestos-color" ? "Asbestos (color up)" :
                        roofSelection.material === "tile" ? "Tile (Ulu)" :
                        roofSelection.material === "amano-normal" ? "Amano Normal" :
                        roofSelection.material === "amano-curve" ? "Amano Curve Roof" :
                        roofSelection.material === "amano-tile" ? "Amano Tile Roof" :
                        roofSelection.material === "upvc" ? "UPVC Sheet" :
                        roofSelection.material === "transparent" ? "Transparent Roofing Sheet" :
                        roofSelection.material
                      }</p>
                      {roofSelection.color && (
                        <p><strong>Color:</strong> {
                          roofSelection.color === "tile-red" ? "Tile Red" :
                          roofSelection.color === "green" ? "Green" :
                          roofSelection.color === "brown" ? "Brown" :
                          roofSelection.color === "ash" ? "Ash" :
                          roofSelection.color
                        }</p>
                      )}
                      {roofSelection.subOption && (
                        <p><strong>Sub-option:</strong> {
                          roofSelection.subOption === "full-curve" ? "Full Curve Roof" :
                          roofSelection.subOption === "half-curve" ? "Half Curve Roof" :
                          roofSelection.subOption === "jl-roofing" ? "J/L Roofing Sheet" :
                          roofSelection.subOption === "i-roof" ? "I Roof Roofing Sheet" :
                          roofSelection.subOption === "anton" ? "Anton Roofing Sheet" :
                          roofSelection.subOption
                        }</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quotation Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roof-quotation-number">Quotation Number:</Label>
                    <Input
                      id="roof-quotation-number"
                      value={roofSelection.roofQuotationNumber}
                      onChange={(e) => updateRoofSelection("roofQuotationNumber", e.target.value)}
                      placeholder="Enter quotation number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quotation Attachment (PDF):</Label>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Upload PDF quotation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-700">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as "pending" | "running" | "complete" | "cancel")}
            >
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
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Form"
            )}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}