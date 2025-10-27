'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Download, AlertTriangle, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
// Removed direct database import - will use API calls instead

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function DashboardPage() {
  const [includeGST, setIncludeGST] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [maintenanceCost, setMaintenanceCost] = useState({
    withGST: 0,
    withoutGST: 0,
  });
  const [labourCost, setLabourCost] = useState({
    withGST: 0,
    withoutGST: 0,
  });
  const [costTrends, setCostTrends] = useState<any[]>([]);
  const [labourTrends, setLabourTrends] = useState<any[]>([]);
  const [expiredDocs, setExpiredDocs] = useState<any[]>([]);
  const [expiredLicenses, setExpiredLicenses] = useState<any[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<any[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [documentCounts, setDocumentCounts] = useState({
    puc: 0,
    np: 0,
    insurance: 0,
    rc: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let filtered = expiredLicenses;
    
    // Filter by document type
    if (selectedDocumentType !== 'all') {
      filtered = filtered.filter(license => 
        license.documentType === selectedDocumentType
      );
    }
    
    // Filter by search term (vehicle number)
    if (searchTerm.trim()) {
      filtered = filtered.filter(license => 
        license.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLicenses(filtered);
  }, [selectedDocumentType, searchTerm, expiredLicenses]);

  const fetchDashboardData = async () => {
    try {
      // Fetch operations data from API
      const operationsResponse = await fetch('/api/operations');
      const operations = await operationsResponse.json();

      if (operations && operations.length > 0) {
        const totalWithGST = operations.reduce(
          (sum: number, op: any) => sum + Number(op.totalInvAmountPayable || 0),
          0
        );
        // Calculate total without GST: sum of spare without tax + labour + original amount + outside labour
        const totalWithoutGST = operations.reduce(
          (sum: number, op: any) => {
            return sum + Number(op.spareWithoutTax || 0) + Number(op.labour || 0) + 
                   Number(op.amount || 0) + Number(op.outsideLabour || 0);
          },
          0
        );

        setMaintenanceCost({
          withGST: totalWithGST,
          withoutGST: totalWithoutGST,
        });

        // Calculate labour costs from all operations that have labour data
        const labourWithGST = operations.reduce(
          (sum: number, op: any) => sum + Number(op.labourWithGST || 0),
          0
        );
        const labourWithoutGST = operations.reduce(
          (sum: number, op: any) => sum + Number(op.labour || 0),
          0
        );

        setLabourCost({
          withGST: labourWithGST,
          withoutGST: labourWithoutGST,
        });

        const monthlyData = operations.reduce((acc: any, op: any) => {
          const month = format(new Date(op.operationDate), 'MMM yyyy');
          if (!acc[month]) {
            acc[month] = { month, cost: 0, costWithoutGST: 0 };
          }
          acc[month].cost += Number(op.totalInvAmountPayable || 0);
          // Calculate cost without GST: spare without tax + labour + original amount + outside labour
          const costWithoutGST = Number(op.spareWithoutTax || 0) + Number(op.labour || 0) + 
                                 Number(op.amount || 0) + Number(op.outsideLabour || 0);
          acc[month].costWithoutGST += costWithoutGST;
          return acc;
        }, {});

        const costTrendArr = Object.values(monthlyData).sort((a, b) =>
          new Date("01 " + (a as any).month).getTime() - new Date("01 " + (b as any).month).getTime()
        );
        setCostTrends(costTrendArr);

        const monthlyLabour = operations.reduce((acc: any, op: any) => {
          const month = format(new Date(op.operationDate), 'MMM yyyy');
          if (!acc[month]) {
            acc[month] = { month, labour: 0, labourWithGST: 0 };
          }
          acc[month].labour += Number(op.labour || 0);
          acc[month].labourWithGST += Number(op.labourWithGST || 0);
          return acc;
        }, {});

        const labourTrendArr = Object.values(monthlyLabour).sort((a, b) =>
          new Date("01 " + (a as any).month).getTime() - new Date("01 " + (b as any).month).getTime()
        );
        setLabourTrends(labourTrendArr);
      }

      // Fetch expired documents from verification API (excluding licenses)
      const expiredResponse = await fetch('/api/verification?expired=true');
      const expiredDocuments = await expiredResponse.json();
      
      // Filter out license-related documents from expired docs (keep only other document types)
      const nonLicenseDocs = expiredDocuments.filter((doc: any) => 
        !['PUC', 'RC', 'NP', 'Insurance'].includes(doc.documentType)
      );
      setExpiredDocs(nonLicenseDocs);
      
      // Filter license-related documents for expired licenses (PUC, RC, NP, Insurance)
      const licenseDocs = expiredDocuments.filter((doc: any) => 
        ['PUC', 'RC', 'NP', 'Insurance'].includes(doc.documentType)
      );
      setExpiredLicenses(licenseDocs);
      setFilteredLicenses(licenseDocs);

      // Calculate document type counts
      const counts = {
        puc: licenseDocs.filter((doc: any) => doc.documentType === 'PUC').length,
        np: licenseDocs.filter((doc: any) => doc.documentType === 'NP').length,
        insurance: licenseDocs.filter((doc: any) => doc.documentType === 'Insurance').length,
        rc: licenseDocs.filter((doc: any) => doc.documentType === 'RC').length,
      };
      setDocumentCounts(counts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleExportExcel = () => {
    alert('Excel export functionality - Date range: ' +
      (dateRange.from ? format(dateRange.from, 'PP') : 'Not set') +
      ' to ' +
      (dateRange.to ? format(dateRange.to, 'PP') : 'Not set')
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Label htmlFor="gst-toggle" className="text-sm font-medium">
            Include GST
          </Label>
          <Switch
            id="gst-toggle"
            checked={includeGST}
            onCheckedChange={setIncludeGST}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Maintenance Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{includeGST
                ? maintenanceCost.withGST.toLocaleString()
                : maintenanceCost.withoutGST.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {includeGST ? 'With GST' : 'Without GST'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Labour Costing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{includeGST
                ? labourCost.withGST.toLocaleString()
                : labourCost.withoutGST.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {includeGST ? 'With GST' : 'Without GST'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{includeGST
                ? (maintenanceCost.withGST + labourCost.withGST).toLocaleString()
                : (maintenanceCost.withoutGST + labourCost.withoutGST).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {includeGST ? 'With GST' : 'Without GST'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Export Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    setDateRange({ ...dateRange, from: date })
                  }
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleExportExcel}
              className="w-full mt-2 bg-red-600 hover:bg-red-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Maintenance Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={includeGST ? "cost" : "costWithoutGST"}
                  stroke="#dc2626"
                  strokeWidth={2}
                  name={includeGST ? "Cost (₹)" : "Cost Without GST (₹)"}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Labour Cost by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={labourTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey={includeGST ? "labourWithGST" : "labour"} 
                  fill="#dc2626" 
                  name={includeGST ? "Labour (With GST)" : "Labour (Without GST)"} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

   {/* Document Type Summary Cards */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              PUC Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {documentCounts.puc}
            </div>
            <p className="text-xs text-gray-500 mt-1">Expired PUC</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              NP Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {documentCounts.np}
            </div>
            <p className="text-xs text-gray-500 mt-1">Expired NP</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Insurance Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {documentCounts.insurance}
            </div>
            <p className="text-xs text-gray-500 mt-1">Expired Insurance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              RC Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {documentCounts.rc}
            </div>
            <p className="text-xs text-gray-500 mt-1">Expired RC</p>
          </CardContent>
        </Card>
      </div>

      {/* Expired Licenses Section */}
      <Card className="border-l-4 border-l-orange-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Expired Vehicle Documents
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="vehicle-search" className="text-sm font-medium">
                  Search vehicle:
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="vehicle-search"
                    placeholder="Enter vehicle number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="document-type-filter" className="text-sm font-medium">
                  Filter by type:
                </Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PUC">PUC</SelectItem>
                    <SelectItem value="RC">RC</SelectItem>
                    <SelectItem value="NP">NP</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLicenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {expiredLicenses.length === 0 
                ? 'No expired vehicle documents found' 
                : searchTerm.trim() 
                  ? `No documents found for vehicle "${searchTerm}"`
                  : 'No documents found for the selected type'
              }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Vehicle Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Document Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Document Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Expiry Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Issuing Authority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((license: any, index: number) => (
                    <tr
                      key={license._id || index}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-orange-600 font-medium">
                        {license.vehicleNumber || '--'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {license.documentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {license.documentNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(license.expiryDate), 'PP')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {license.issuingAuthority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
