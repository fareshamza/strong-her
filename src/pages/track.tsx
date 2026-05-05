import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fetchFromGas } from "@/lib/api";

type OrderStatus = "pending" | "approved" | "rejected";

interface OrderData {
  id: number;
  name: string;
  phone: string;
  workoutDays: number;
  workoutSplit: string;
  exercises: string;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد المراجعة ⏳",
  approved: "تم التأكيد ✅",
  rejected: "مرفوض ❌",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    const id = parseInt(orderId.trim(), 10);
    if (!id || isNaN(id)) {
      setError("يرجى إدخال رقم طلب صحيح");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const data = await fetchFromGas("trackOrder", { id: id.toString() });
      if (data.error) {
        setError("لم يتم العثور على الطلب. تأكد من رقم الطلب.");
        return;
      }
      setOrder(data);
    } catch {
      setError("حدث خطأ في الاتصال. يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  let exercises: Record<string, string[]> = {};
  if (order?.exercises) {
    try { exercises = JSON.parse(order.exercises); } catch {}
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">💗</div>
          <h1 className="text-2xl font-black text-foreground">تتبع طلبك</h1>
          <p className="text-muted-foreground text-sm">
            ادخلي رقم الطلب اللي وصلك على واتساب
          </p>
        </div>

        {/* Search */}
        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="رقم الطلب (مثال: 12)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="text-center font-bold text-lg"
              />
              <Button
                onClick={handleTrack}
                disabled={loading}
                className="rounded-full px-6 font-bold"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : "بحث"}
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="space-y-4"
            >
              {/* Status Card */}
              <Card className="border-2 border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">الاسم</p>
                      <p className="font-bold">{order.name}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">تاريخ الطلب</p>
                      <p className="font-bold text-xs">{format(new Date(order.createdAt), "dd/MM/yyyy")}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">أيام التمرين</p>
                      <p className="font-bold">{order.workoutDays} أيام</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">التقسيم</p>
                      <p className="font-bold text-xs">{order.workoutSplit}</p>
                    </div>
                  </div>

                  {/* Status messages */}
                  {order.status === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 text-center">
                      طلبك تحت المراجعة 🔍 هنتواصل معاكِ قريباً على واتساب
                    </div>
                  )}
                  {order.status === "approved" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 text-center">
                      🎉 تم التأكيد! جدولك الشخصي قيد الطباعة والتجهيز وهيوصلك قريب جداً.
                    </div>
                  )}
                  {order.status === "rejected" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800 text-center">
                      للأسف طلبك لم يتم تأكيده. يرجى التواصل معنا للاستفسار
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exercises preview (if approved) */}
              {order.status === "approved" && Object.keys(exercises).length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">روتينك المخصص 💪</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(exercises).map(([day, exList]) => (
                      <div key={day} className="bg-secondary/30 rounded-xl p-3">
                        <p className="font-bold text-sm text-primary mb-2">{day}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(exList as string[]).map((ex) => (
                            <span key={ex} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              الرجوع للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
