'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Plus, Edit, Trash2, Eye, CalendarDays, MapPin, Phone, Users, FileText, Home, Copy } from 'lucide-react';

interface SiteVisit {
  id: string;
  customerId: string;
  leadDate: string;
  customerName: string;
  phoneNumber: string;
  hasWhatsApp: boolean;
  district: string;
  city: string;
  status: string;
  selectedService: string;
  createdAt: string;
  updatedAt: string;
}

export default function SiteVisitDashboard() {
  const { toast } = useToast();
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);

  useEffect(() => {
    fetchSiteVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [siteVisits, searchTerm, statusFilter, serviceFilter]);

  const fetchSiteVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site-visits?action=getAll');
      const result = await response.json();
      
      if (result.success) {
        setSiteVisits(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching site visits:', error);
      toast({
        title: "Error",
        description: "Failed to load site visits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    let filtered = siteVisits;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(visit => visit.status === statusFilter);
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(visit => visit.selectedService === serviceFilter);
    }

    setFilteredVisits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'cancel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'roof': return <Home className="h-4 w-4" />;
      case 'ceiling': return <div className="h-4 w-4 bg-blue-600 rounded grid grid-cols-2 gap-px p-px">
          <div className="bg-white rounded-sm"></div>
          <div className="bg-white rounded-sm"></div>
          <div className="bg-white rounded-sm"></div>
          <div className="bg-white rounded-sm"></div>
        </div>;
      case 'gutters': return <div className="h-4 w-4 bg-blue-600 rounded flex items-center justify-center">
          <div className="w-3 h-0.5 bg-white"></div>
        </div>;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site visit?')) return;

    try {
      const response = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', data: { id } })
      });

      const result = await response.json();

      if (result.success) {
        setSiteVisits(siteVisits.filter(visit => visit.id !== id));
        toast({
          title: "Success",
          description: "Site visit deleted successfully",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting site visit:', error);
      toast({
        title: "Error",
        description: "Failed to delete site visit",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (visit: SiteVisit) => {
    if (!confirm(`Create a new site visit for customer ${visit.customerName} with the same customer ID (${visit.customerId})?`)) return;

    try {
      // Get full visit data including service-specific data
      const response = await fetch(`/api/site-visits?action=getById&id=${visit.id}`);
      const result = await response.json();

      if (result.success) {
        const fullVisitData = result.data;
        
        // Create new visit with same customer details but new ID
        const newVisitData = {
          customerId: fullVisitData.customerId, // Keep same customer ID
          leadDate: new Date().toISOString().split('T')[0], // Today's date
          customerName: fullVisitData.customerName,
          phoneNumber: fullVisitData.phoneNumber,
          hasWhatsApp: fullVisitData.hasWhatsApp,
          whatsappNumber: fullVisitData.whatsappNumber,
          district: fullVisitData.district,
          city: fullVisitData.city,
          address: fullVisitData.address,
          hasRemovals: fullVisitData.hasRemovals || false,
          removalCharge: fullVisitData.removalCharge,
          hasAdditionalLabor: fullVisitData.hasAdditionalLabor || false,
          additionalLaborCharge: fullVisitData.additionalLaborCharge,
          status: 'pending', // Reset to pending
          selectedService: fullVisitData.selectedService,
          // Clear service-specific data as it might be different for the new site
          ceilingData: null,
          guttersData: null,
          roofData: null,
          images: [],
          drawings: [],
          videos: []
        };

        // Create the new visit
        const createResponse = await fetch('/api/site-visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', data: newVisitData })
        });

        const createResult = await createResponse.json();

        if (createResult.success) {
          // Refresh the site visits list
          fetchSiteVisits();
          
          toast({
            title: "Success",
            description: `New site visit created for ${visit.customerName} with customer ID ${visit.customerId}`,
          });
          
          // Redirect to edit the new visit
          setTimeout(() => {
            window.location.href = `/?edit=${createResult.data.id}`;
          }, 1000);
        } else {
          throw new Error(createResult.message);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error duplicating site visit:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate site visit",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading site visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Site Visit Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and track all site visit records</p>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/">
                <Plus className="h-4 w-4 mr-2" />
                New Site Visit
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{siteVisits.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {siteVisits.filter(v => v.status === 'pending').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {siteVisits.filter(v => v.status === 'running').length}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {siteVisits.filter(v => v.status === 'complete').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, ID, district, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="cancel">Cancel</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="roof">Roof</SelectItem>
                  <SelectItem value="ceiling">Ceiling</SelectItem>
                  <SelectItem value="gutters">Gutters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Site Visits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Site Visit Records</CardTitle>
            <CardDescription>
              Showing {filteredVisits.length} of {siteVisits.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">{visit.customerId}</TableCell>
                      <TableCell>{visit.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{visit.phoneNumber}</span>
                          {visit.hasWhatsApp && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {visit.city}, {visit.district}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(visit.selectedService)}
                          <span className="capitalize">{visit.selectedService}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(visit.status)}>
                          {visit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(visit.leadDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVisit(visit)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Site Visit Details</DialogTitle>
                                <DialogDescription>
                                  Customer ID: {visit.customerId}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedVisit && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Customer Name</Label>
                                      <p className="text-sm">{selectedVisit.customerName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Phone Number</Label>
                                      <p className="text-sm">{selectedVisit.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">District</Label>
                                      <p className="text-sm">{selectedVisit.district}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">City</Label>
                                      <p className="text-sm">{selectedVisit.city}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Service Type</Label>
                                    <p className="text-sm capitalize">{selectedVisit.selectedService}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge className={getStatusColor(selectedVisit.status)}>
                                      {selectedVisit.status}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`/?edit=${visit.id}`}>
                              <Edit className="h-4 w-4" />
                            </a>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(visit)}
                            title="Create new site visit for same customer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(visit.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredVisits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No site visits found matching your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}