import { useState, useEffect, Fragment } from "react";
import { fetchFromGas, postToGas } from "@/lib/api";
import { fillLogbook } from "@/lib/pdf-filler";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "20" + digits.slice(1);
  return "20" + digits;
}

function buildWhatsAppUrl(phone: string, name: string, orderId: number): string {
  const origin = window.location.origin;
  const message = `مرحباً ${name}! 💗\n\nتم الموافقة على طلبك في Strong Her Planner 🎉\n\nرقم طلبك: #${orderId}\n\nيمكنك متابعة حالة طلبك على:\n${origin}/track?id=${orderId}\n\nنتمنالك تمرين ممتاز! 🔥\nStrong Her Team 💪`;
  return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;
}

type Order = {
  id: number;
  name: string;
  phone: string;
  workoutDays: number;
  workoutSplit: string;
  exercises: string;
  paymentNumber: string;
  receiptUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("0107652871");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [justApproved, setJustApproved] = useState<number | null>(null);
  
  // New State
  const [settings, setSettings] = useState({ planner_price: "450", transfer_number: "010XXXXXXXX" });
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [newDiscountCode, setNewDiscountCode] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState("");
  const [receiptLightbox, setReceiptLightbox] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      const settingsData = await fetchFromGas("settings");
      setSettings(settingsData);
      
      const discountsData = await fetchFromGas("discounts", { adminToken: token });
      if (Array.isArray(discountsData)) setDiscounts(discountsData);
      
      const ordersData = await fetchFromGas("orders", { adminToken: token });
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
        // Calculate basic stats manually since GAS doesn't have an explicit stats endpoint right now
        // (Or we can just compute it from orders)
        const total = ordersData.length;
        const pending = ordersData.filter(o => o.status === "pending").length;
        const approved = ordersData.filter(o => o.status === "approved").length;
        const rejected = ordersData.filter(o => o.status === "rejected").length;
        const todayCount = ordersData.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
        setStats({ total, pending, approved, rejected, todayCount });
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const updateSettings = async () => {
    await postToGas("updateSettings", { adminToken: token, settings });
    alert("تم حفظ الإعدادات!");
  };

  const createDiscount = async () => {
    try {
      const discount = await postToGas("createDiscount", { 
        data: { adminToken: token, code: newDiscountCode, discountPercent: parseInt(newDiscountPercent) }
      });
      setDiscounts([...discounts, discount]);
      setNewDiscountCode("");
      setNewDiscountPercent("");
    } catch(err) {
      alert("حدث خطأ أو الكود موجود مسبقاً");
    }
  };

  const toggleDiscount = async (id: number, currentStatus: boolean) => {
    try {
      await postToGas("toggleDiscount", { adminToken: token, id, active: !currentStatus });
      setDiscounts(discounts.map(d => d.id === id ? { ...d, active: !currentStatus } : d));
    } catch(err) {}
  };

  const handleStatusChange = async (order: Order, newStatus: "approved" | "rejected") => {
    try {
      await postToGas("updateStatus", { adminToken: token, id: order.id, status: newStatus });
      loadData();
      if (newStatus === "approved") setJustApproved(order.id);
    } catch(err) {
      alert("حدث خطأ في تغيير الحالة");
    }
  };

  const filteredOrders = orders.filter(o => statusFilter === "all" || o.status === statusFilter);

  const downloadSinglePdf = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillLogbook(order);
      const safeName = order.name.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "").trim().replace(/\s+/g, "_");
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `StrongHer_${safeName}.pdf`;
      link.click();
    } catch(err) {
      alert("حدث خطأ أثناء إنشاء الـ PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadBulkPdf = async () => {
    const approvedOrders = orders.filter(o => o.status === "approved");
    if (approvedOrders.length === 0) {
      alert("لا توجد طلبات مقبولة لتحميلها");
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const order of approvedOrders) {
        try {
          const orderPdfBytes = await fillLogbook(order);
          const orderPdf = await PDFDocument.load(orderPdfBytes);
          const copiedPages = await mergedPdf.copyPages(orderPdf, orderPdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch(err) {
          console.error("Failed to merge order", order.id);
        }
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "StrongHer_Bulk_Orders.pdf";
      link.click();
    } catch(err) {
      alert("حدث خطأ أثناء دمج الـ PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl font-black text-primary">لوحة التحكم 💗</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Admin Token:</span>
            <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-44 text-xs" />
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: "الكل", value: stats.total, color: "text-foreground" },
              { label: "انتظار", value: stats.pending, color: "text-yellow-600" },
              { label: "مقبول", value: stats.approved, color: "text-green-600" },
              { label: "مرفوض", value: stats.rejected, color: "text-red-600" },
              { label: "اليوم", value: stats.todayCount, color: "text-primary" },
              { label: "أرباح مقدرة", value: `${stats.approved * parseInt(settings.planner_price)} ج`, color: "text-blue-600" },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <CardContent className="p-3">
                  <div className={`text-xl md:text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Settings Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold">سعر البلانر</label>
                  <Input value={settings.planner_price} onChange={e => setSettings({...settings, planner_price: e.target.value})} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold">رقم فودافون كاش</label>
                  <Input value={settings.transfer_number} onChange={e => setSettings({...settings, transfer_number: e.target.value})} />
                </div>
              </div>
              <Button onClick={updateSettings} size="sm" className="w-full">حفظ الإعدادات</Button>
            </CardContent>
          </Card>

          {/* Discounts Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">أكواد الخصم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="الكود" value={newDiscountCode} onChange={e => setNewDiscountCode(e.target.value)} className="w-1/2" />
                <Input placeholder="النسبة %" type="number" value={newDiscountPercent} onChange={e => setNewDiscountPercent(e.target.value)} className="w-1/4" />
                <Button onClick={createDiscount} size="sm" className="flex-1">إضافة</Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {discounts.map(d => (
                  <div key={d.id} className="flex justify-between items-center bg-secondary/20 p-2 rounded text-sm">
                    <span className="font-mono font-bold">{d.code}</span>
                    <span className="text-muted-foreground">{d.discountPercent}%</span>
                    <Badge variant={d.active ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleDiscount(d.id, d.active)}>
                      {d.active ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-3">
            <CardTitle className="text-base">الطلبات</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">انتظار</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadBulkPdf} disabled={isGeneratingPdf} size="sm" variant="default" className="text-xs h-9 bg-purple-600 hover:bg-purple-700">
                {isGeneratingPdf ? "جاري التحميل..." : "تحميل مجمّع"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-8">#</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الموبايل</TableHead>
                    <TableHead className="text-right">التفاصيل</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <Fragment key={order.id}>
                      <TableRow className="cursor-pointer hover:bg-secondary/30" onClick={() => toggleRow(order.id)}>
                        <TableCell className="text-muted-foreground text-xs font-mono">{order.id}</TableCell>
                        <TableCell className="font-semibold text-sm">{order.name}</TableCell>
                        <TableCell className="text-sm font-mono" dir="ltr">{order.phone}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.workoutDays} أيام • {order.workoutSplit}
                          <br />
                          <span className="text-[10px]">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === "approved" ? "default" : order.status === "rejected" ? "destructive" : "secondary"} className="text-xs">
                            {order.status === "approved" ? "✅ مقبول" : order.status === "rejected" ? "❌ مرفوض" : "⏳ انتظار"}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {order.status === "pending" && (
                              <>
                                <Button size="sm" className="text-xs h-7 px-2 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(order, "approved")}>موافقة</Button>
                                <Button size="sm" variant="destructive" className="text-xs h-7 px-2" onClick={() => handleStatusChange(order, "rejected")}>رفض</Button>
                              </>
                            )}
                            {order.status === "approved" && (
                              <>
                                <Button size="sm" variant="outline" onClick={(e) => downloadSinglePdf(order, e)} disabled={isGeneratingPdf} className="text-xs h-7 px-2 border-primary text-primary hover:bg-primary/10">📄 PDF</Button>
                                <a href={buildWhatsAppUrl(order.phone, order.name, order.id)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                  <Button size="sm" className="text-xs h-7 px-2 bg-green-500 hover:bg-green-600">📲 واتساب</Button>
                                </a>
                              </>
                            )}
                            <Link href={`/planner/${order.id}`}>
                              <Button size="sm" variant="secondary" className="text-xs h-7 px-2">عرض</Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row */}
                      {expandedRows.has(order.id) && (
                        <TableRow key={`expanded-${order.id}`} className="bg-secondary/10">
                          <TableCell colSpan={6} className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                              {/* Receipt */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground">إيصال الدفع</p>
                                {order.receiptUrl ? (
                                  <img 
                                    src={order.receiptUrl} 
                                    alt="إيصال" 
                                    className="max-h-48 rounded-lg border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity" 
                                    onClick={() => setReceiptLightbox(order.receiptUrl)}
                                  />
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">لم يتم رفع إيصال</p>
                                )}
                                <p className="text-xs text-muted-foreground">فودافون كاش: <span className="font-mono font-bold" dir="ltr">{order.paymentNumber}</span></p>
                              </div>

                              {/* Exercises */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground">التمارين المختارة</p>
                                {(() => {
                                  let exMap: Record<string, string[]> = {};
                                  try { exMap = JSON.parse(order.exercises); } catch {}
                                  return Object.entries(exMap).map(([day, list]) => (
                                    <div key={day} className="text-xs">
                                      <span className="font-bold text-primary">{day}: </span>
                                      <span className="text-muted-foreground">{(list as string[]).join(" • ")}</span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>

                            {/* WhatsApp prompt if just approved */}
                            {justApproved === order.id && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                                <span className="text-sm text-green-800 font-semibold">✅ تم القبول! أرسلي إشعار واتساب للعميلة:</span>
                                <a href={buildWhatsAppUrl(order.phone, order.name, order.id)} target="_blank" rel="noreferrer">
                                  <Button size="sm" className="bg-[#25D366] hover:bg-[#20BD5C] text-white font-bold text-xs">
                                    📲 إرسال واتساب
                                  </Button>
                                </a>
                                <button className="text-xs text-muted-foreground hover:underline" onClick={() => setJustApproved(null)}>تجاهل</button>
                              </motion.div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">لا توجد طلبات</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      {/* Lightbox for Receipt */}
      <AnimatePresence>
        {receiptLightbox && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setReceiptLightbox(null)}
          >
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={receiptLightbox} 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
            <Button variant="outline" className="absolute top-4 right-4 text-white border-white bg-black/50" onClick={() => setReceiptLightbox(null)}>
              إغلاق
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
