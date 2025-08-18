import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Download,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  paymentMethod?: {
    brand: string;
    last4: string;
  };
}

const InvoiceDocument: React.FC<{ invoice: Invoice; userInfo: any }> = ({ invoice, userInfo }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoice.number}.pdf`);
  };

  return (
    <>
      <div ref={invoiceRef} className="bg-white p-8 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Mundo Tango
            </h1>
            <p className="text-gray-500 mt-1">Life CEO Platform</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">INVOICE</h2>
            <p className="text-gray-600">#{invoice.number}</p>
            <p className="text-sm text-gray-500 mt-2">
              Date: {format(new Date(invoice.date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Billing Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
            <p className="text-gray-600">{userInfo?.firstName} {userInfo?.lastName}</p>
            <p className="text-gray-600">{userInfo?.email}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-700 mb-2">Payment Details:</h3>
            <p className="text-gray-600">
              Status: <span className={invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'}>
                {invoice.status.toUpperCase()}
              </span>
            </p>
            {invoice.paymentMethod && (
              <p className="text-gray-600">
                {invoice.paymentMethod.brand} •••• {invoice.paymentMethod.last4}
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">${(item.unitPrice / 100).toFixed(2)}</TableCell>
                <TableCell className="text-right">${(item.amount / 100).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-semibold">Subtotal:</span>
              <span>${(invoice.amount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Tax:</span>
              <span>$0.00</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total:</span>
              <span className="bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                ${(invoice.amount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your subscription!</p>
          <p className="mt-2">Questions? Contact support@mundotango.life</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </>
  );
};

const Invoices: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch invoices
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['/api/payments/invoices'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices & Receipts</h1>
          <p className="text-gray-600">View and download your subscription invoices</p>
        </div>

        <Card className="glassmorphic-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>All your past and current invoices</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-turquoise-500" />
              </div>
            ) : (!invoices || (invoices as Invoice[]).length === 0) ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No invoices yet</p>
                <p className="text-sm text-gray-400 mt-2">Your invoices will appear here after your first payment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(invoices as Invoice[])?.map((invoice: Invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Invoice #{invoice.number}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(invoice.date), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            ${(invoice.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <InvoiceModal invoice={invoice} userInfo={user} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Invoice Modal Component
const InvoiceModal: React.FC<{ invoice: Invoice; userInfo: any }> = ({ invoice, userInfo }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <FileText className="h-4 w-4 mr-1" />
        View
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invoice Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <InvoiceDocument invoice={invoice} userInfo={userInfo} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;