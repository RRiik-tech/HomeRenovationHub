import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  DollarSign,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Send,
  RefreshCw,
  Lock,
  Receipt,
  FileText,
  Calendar,
  User,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Eye,
  Filter
} from "lucide-react";
import { z } from "zod";
import { format, parseISO } from "date-fns";

const paymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  type: z.enum(['milestone', 'deposit', 'final', 'refund']),
  description: z.string().min(1, "Description is required"),
  milestoneId: z.number().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Payment {
  id: number;
  projectId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  type: 'milestone' | 'deposit' | 'final' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  description: string;
  milestoneId?: number;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  toUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  milestone?: {
    title: string;
    description: string;
  };
}

interface PaymentSystemProps {
  projectId: number;
  contractorId?: number;
  homeownerId?: number;
  canMakePayments?: boolean;
  canReceivePayments?: boolean;
}

export function PaymentSystem({ 
  projectId, 
  contractorId, 
  homeownerId, 
  canMakePayments = false, 
  canReceivePayments = false 
}: PaymentSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'sent' | 'received'>('all');

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      type: 'milestone',
      description: "",
    },
  });

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/payments`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
  });

  // Fetch milestones for payment options
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/milestones`);
      if (!response.ok) throw new Error('Failed to fetch milestones');
      return response.json();
    },
  });

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          projectId,
          fromUserId: user?.id,
          toUserId: contractorId || homeownerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Initiated",
        description: "Payment has been initiated and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['payments', projectId] });
      setShowPaymentForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Payment['status'] }) => {
      const response = await fetch(`/api/payments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['payments', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calculate payment statistics
  const totalPaid = payments
    .filter((p: Payment) => p.status === 'completed')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p: Payment) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p: Payment) => p.status === 'refunded')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const sentPayments = payments.filter((p: Payment) => p.fromUserId === user?.id);
  const receivedPayments = payments.filter((p: Payment) => p.toUserId === user?.id);

  // Filter payments based on selection
  const filteredPayments = payments.filter((payment: Payment) => {
    if (paymentFilter === 'sent') return payment.fromUserId === user?.id;
    if (paymentFilter === 'received') return payment.toUserId === user?.id;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{sentPayments.length}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{receivedPayments.length}</div>
                <div className="text-sm text-gray-600">Received</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Payment Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Management
            </CardTitle>
            <div className="flex space-x-2">
              {canMakePayments && (
                <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make a Payment</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="deposit">Deposit</SelectItem>
                                  <SelectItem value="milestone">Milestone Payment</SelectItem>
                                  <SelectItem value="final">Final Payment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("type") === "milestone" && (
                          <FormField
                            control={form.control}
                            name="milestoneId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Milestone</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select milestone" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {milestones.map((milestone: any) => (
                                      <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                        {milestone.title} - ${milestone.amount.toLocaleString()}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Payment description..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Payment Method Section */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Payment Method</label>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <div className="flex-1">
                                <div className="font-medium">Credit/Debit Card</div>
                                <div className="text-sm text-gray-600">Secure payment via Stripe</div>
                              </div>
                              <Shield className="h-4 w-4 text-green-600" />
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <Building className="h-5 w-5 text-green-600" />
                              <div className="flex-1">
                                <div className="font-medium">Bank Transfer</div>
                                <div className="text-sm text-gray-600">Direct bank transfer (ACH)</div>
                              </div>
                              <Lock className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {/* Escrow Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-900">Secure Escrow Service</div>
                              <div className="text-sm text-blue-700 mt-1">
                                Your payment will be held securely in escrow until the milestone is completed and approved.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={createPaymentMutation.isPending}
                            className="flex-1"
                          >
                            {createPaymentMutation.isPending ? "Processing..." : "Send Payment"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPaymentForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Payment Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Project Budget</span>
                          <span>${project.budget || '0'}</span>
                        </div>
                        <Progress value={(totalPaid / 10000) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>${totalPaid.toLocaleString()} paid</span>
                          <span>${(10000 - totalPaid).toLocaleString()} remaining</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <div className="font-medium">{payment.description}</div>
                            <div className="text-sm text-gray-600">
                              {format(parseISO(payment.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${payment.amount.toLocaleString()}</div>
                          <Badge variant="outline" className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No payments yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              {/* Payment Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Payment List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">Loading payments...</div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payments found.
                  </div>
                ) : (
                  filteredPayments.map((payment: Payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(payment.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{payment.description}</h4>
                                <Badge variant="outline" className={getTypeColor(payment.type)}>
                                  {payment.type}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {payment.fromUserId === user?.id ? 'Sent to' : 'Received from'}{' '}
                                {payment.fromUserId === user?.id 
                                  ? `${payment.toUser?.firstName} ${payment.toUser?.lastName}`
                                  : `${payment.fromUser?.firstName} ${payment.fromUser?.lastName}`
                                }
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {format(parseISO(payment.createdAt), 'MMM d, yyyy h:mm a')}
                              </div>
                              {payment.milestone && (
                                <div className="text-sm text-blue-600 mt-1">
                                  Milestone: {payment.milestone.title}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              ${payment.amount.toLocaleString()}
                            </div>
                            <Badge variant="outline" className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Management</h3>
                <p className="text-gray-600 mb-4">
                  Generate and manage invoices for your project payments.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <div className="text-2xl font-bold">${selectedPayment.amount.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <Badge variant="outline" className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="mt-1">{selectedPayment.description}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <div className="mt-1">
                  {format(parseISO(selectedPayment.createdAt), 'MMMM d, yyyy h:mm a')}
                </div>
              </div>
              
              {selectedPayment.milestone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Associated Milestone</label>
                  <div className="mt-1">{selectedPayment.milestone.title}</div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Receipt className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Receipt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 