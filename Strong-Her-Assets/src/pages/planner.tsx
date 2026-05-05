import { useParams } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function PlannerPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) },
  });

  if (isLoading) return (
    <div className="p-8 text-center text-muted-foreground">جاري تحميل الجدول...</div>
  );
  if (!order) return (
    <div className="p-8 text-center text-muted-foreground">الجدول غير موجود</div>
  );

  let exercises: Record<string, string[]> = {};
  try {
    exercises = JSON.parse(order.exercises);
  } catch {
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-8 print:p-0 print:bg-white" dir="rtl">
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none p-10 print:p-8 font-sans relative">

        <div className="absolute top-6 left-6 print:hidden">
          <Button onClick={() => window.print()} variant="outline" size="sm" className="rounded-full">
            طباعة الجدول
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-10 pb-8 border-b-2 border-primary/20">
          <div className="text-3xl mb-2">💗</div>
          <h1 className="text-4xl font-black text-primary mb-2">Strong Her Planner</h1>
          <h2 className="text-xl text-foreground font-bold">جدول {order.name} المخصص</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {order.workoutDays} أيام في الأسبوع • {order.workoutSplit}
          </p>
        </div>

        {/* Exercise Tables */}
        <div className="space-y-6">
          {Object.entries(exercises).map(([day, dayExercises]) => (
            <div key={day} className="border border-border rounded-xl overflow-hidden break-inside-avoid">
              <div className="bg-primary/8 px-5 py-3 border-b border-border">
                <h3 className="text-lg font-bold text-primary">{day}</h3>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                      <th className="pb-2 text-start font-semibold">التمرين</th>
                      <th className="pb-2 text-center font-semibold">السيتات</th>
                      <th className="pb-2 text-center font-semibold">التكرارات</th>
                      <th className="pb-2 text-center font-semibold">الوزن</th>
                      <th className="pb-2 text-end font-semibold">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dayExercises as string[]).map((ex, idx) => (
                      <tr key={idx} className="border-b border-border/40 last:border-0">
                        <td className="py-3 font-semibold text-sm text-start">{ex}</td>
                        <td className="py-3 text-center text-muted-foreground text-sm">3</td>
                        <td className="py-3 text-center text-muted-foreground text-sm">10–12</td>
                        <td className="py-3 text-center text-muted-foreground text-sm">___</td>
                        <td className="py-3 text-end text-muted-foreground text-sm">___</td>
                      </tr>
                    ))}
                    {(!dayExercises || (dayExercises as string[]).length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-3 text-muted-foreground italic text-center text-sm">
                          راحة أو روتين مخصص
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground border-t border-border/40 pt-6">
          <p>تم إنشاء هذا الجدول خصيصاً لـ {order.name} 💗 Strong Her Planner</p>
        </div>
      </div>
    </div>
  );
}
