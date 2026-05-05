import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { postToGas, fileToBase64 } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { MUSCLE_GROUPS } from "@/data/exercises";
import type { Exercise } from "@/data/exercises";

const SPLITS = ["Full Body", "Upper/Lower", "Push/Pull/Legs", "Push/Pull", "Bro Split", "Custom"];

const imgCache = new Map<string, string | null>();

function ExerciseCard({
  exercise,
  selected,
  onToggle,
  disabled,
}: {
  exercise: Exercise;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const [imgUrl, setImgUrl] = useState<string | null | "loading">(
    imgCache.has(exercise.name) ? imgCache.get(exercise.name)! : "loading"
  );

  useEffect(() => {
    if (imgCache.has(exercise.name)) {
      setImgUrl(imgCache.get(exercise.name) ?? null);
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchImg = (attempt: number) => {
      fetch(`/api/exercise-image?name=${encodeURIComponent(exercise.name)}`)
        .then((r) => r.json())
        .then((d: { url: string | null; ready: boolean }) => {
          if (cancelled) return;
          if (d.url) {
            imgCache.set(exercise.name, d.url);
            setImgUrl(d.url);
          } else if (!d.ready && attempt < 4) {
            retryTimer = setTimeout(() => fetchImg(attempt + 1), 3000 * attempt);
          } else {
            imgCache.set(exercise.name, null);
            setImgUrl(null);
          }
        })
        .catch(() => {
          if (!cancelled) { imgCache.set(exercise.name, null); setImgUrl(null); }
        });
    };

    fetchImg(1);
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [exercise.name]);

  const isDisabledNonSelected = disabled && !selected;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabledNonSelected}
      className={`relative rounded-xl border-2 overflow-hidden text-right transition-all duration-150 group w-full
        ${selected
          ? "border-primary shadow-lg scale-[1.03] bg-primary/5"
          : isDisabledNonSelected
            ? "border-border opacity-40 cursor-not-allowed"
            : "border-border hover:border-primary/50 hover:shadow-sm cursor-pointer"
        }`}
    >
      <div className="aspect-square bg-secondary/40 overflow-hidden relative">
        {imgUrl === "loading" ? (
          <div className="w-full h-full animate-pulse bg-secondary" />
        ) : imgUrl ? (
          <img
            src={imgUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgUrl(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-primary/5">
            💪
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-black shadow">
              ✓
            </div>
          </div>
        )}
      </div>
      <div className="p-1.5 bg-card">
        <p className="text-[11px] font-bold text-foreground leading-tight">{exercise.nameAr}</p>
        <p className="text-[9px] text-muted-foreground leading-tight">{exercise.name}</p>
      </div>
    </button>
  );
}

export default function OrderPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const [workoutDays, setWorkoutDays] = useState(3);
  const [workoutSplit, setWorkoutSplit] = useState("");

  const [exercises, setExercises] = useState<Record<string, string[]>>({});
  const [customEx, setCustomEx] = useState("");
  const [activeDay, setActiveDay] = useState("Day 1");
  const [activeMuscle, setActiveMuscle] = useState("glutes");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleToggleExercise = (day: string, exName: string) => {
    setExercises((prev) => {
      const current = prev[day] || [];
      if (current.includes(exName)) return { ...prev, [day]: current.filter((e) => e !== exName) };
      if (current.length >= 8) return prev;
      return { ...prev, [day]: [...current, exName] };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For local preview
    const objectUrl = URL.createObjectURL(file);
    setReceiptUrl(objectUrl);
    
    // For uploading to GAS
    try {
      const base64 = await fileToBase64(file);
      setReceiptBase64(base64);
    } catch(err) {
      alert("حدث خطأ أثناء قراءة الصورة");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        name, phone, workoutDays, workoutSplit, 
        exercises: JSON.stringify(exercises), 
        paymentNumber, 
        receiptBase64,
        discountCode
      };
      const res = await postToGas("createOrder", { data: payload });
      if (res.success) {
        setLocation("/success");
      } else {
        setErrorMsg("حدث خطأ أثناء الحفظ. يرجى المحاولة مجدداً.");
      }
    } catch (error) {
      setErrorMsg("فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysList = Array.from({ length: workoutDays }, (_, i) => `Day ${i + 1}`);
  const selectedMuscleGroup = MUSCLE_GROUPS.find((g) => g.id === activeMuscle)!;
  const progressPct = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-semibold mb-3" dir="rtl">
            {[["الهيكل", "1"], ["الروتين", "2"], ["التفاصيل", "3"]].map(([label, num], i) => (
              <span key={label} className={step >= i + 1 ? "text-primary" : "text-muted-foreground"}>
                {num}. {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden" dir="ltr">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">ابني أساسك 💪</h2>
                  <p className="text-muted-foreground text-sm mt-1">أقل من دقيقتين</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-semibold">كم يوم في الأسبوع؟</Label>
                    <div className="grid grid-cols-7 gap-1.5" dir="ltr">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button key={num} type="button" onClick={() => setWorkoutDays(num)}
                          className={`py-3 rounded-xl font-bold text-sm transition-all ${workoutDays === num ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">نوع التقسيم</Label>
                    <Select value={workoutSplit} onValueChange={setWorkoutSplit}>
                      <SelectTrigger><SelectValue placeholder="اختاري التقسيم" /></SelectTrigger>
                      <SelectContent>
                        {SPLITS.map((split) => (<SelectItem key={split} value={split}>{split}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setStep(2)} disabled={!workoutSplit} className="rounded-full px-8">التالي</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-4 md:p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">اختاري تمارينك</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">حتى 8 تمارين لكل يوم</p>
                </div>

                <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                  <TabsList className="w-full flex overflow-x-auto gap-1 bg-secondary/50 p-1 rounded-xl h-auto">
                    {daysList.map((day) => {
                      const count = (exercises[day] || []).length;
                      return (
                        <TabsTrigger key={day} value={day} className="flex-1 whitespace-nowrap text-xs rounded-lg px-2 py-1.5">
                          {day}
                          {count > 0 && (<span className="mr-1 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 inline-flex items-center justify-center">{count}</span>)}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {daysList.map((day) => (
                    <TabsContent key={day} value={day} className="space-y-3 mt-3">
                      {/* Selected chips */}
                      {(exercises[day] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2.5 bg-primary/5 rounded-xl border border-primary/10">
                          {(exercises[day] || []).map((ex) => (
                            <span key={ex} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium border border-primary/20">
                              {ex}
                              <button onClick={() => handleToggleExercise(day, ex)} className="text-primary/60 hover:text-primary">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{(exercises[day] || []).length}/8 تمارين</p>

                      {/* Muscle group filters */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {MUSCLE_GROUPS.map((group) => (
                          <button key={group.id} type="button" onClick={() => setActiveMuscle(group.id)}
                            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all
                              ${activeMuscle === group.id ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                            <span>{group.emoji}</span><span>{group.nameAr}</span>
                          </button>
                        ))}
                      </div>

                      {/* Exercise GIF grid */}
                      <div className="grid grid-cols-4 gap-2">
                        {selectedMuscleGroup.exercises.map((ex) => (
                          <ExerciseCard
                            key={ex.name}
                            exercise={ex}
                            selected={(exercises[day] || []).includes(ex.name)}
                            onToggle={() => handleToggleExercise(day, ex.name)}
                            disabled={(exercises[day] || []).length >= 8}
                          />
                        ))}
                      </div>

                      {/* Custom */}
                      <div className="flex gap-2 pt-1">
                        <Input placeholder="تمرين مخصص..." value={customEx} onChange={(e) => setCustomEx(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && customEx.trim()) { handleToggleExercise(day, customEx.trim()); setCustomEx(""); } }} />
                        <Button variant="secondary" onClick={() => { if (customEx.trim()) { handleToggleExercise(day, customEx.trim()); setCustomEx(""); } }}>إضافة</Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)}>رجوع</Button>
                  <Button onClick={() => setStep(3)} className="rounded-full px-8">التالي</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">آخر خطوة 🌸</h2>
                  <p className="text-muted-foreground text-sm mt-1">ابدئي اليوم. كوني ثابتة.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">اسمك الكامل</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">رقم الموبايل</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01X XXXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">رقم فودافون كاش للدفع</Label>
                    <Input value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} placeholder="010 XXXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">إيصال الدفع</Label>
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                    {receiptUrl && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 rounded-xl overflow-hidden border border-border shadow-sm">
                        <img src={receiptUrl} alt="Receipt" className="w-full h-auto max-h-48 object-cover" />
                        <p className="text-xs text-center text-muted-foreground py-1.5 bg-secondary/30">تم رفع الإيصال ✓</p>
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Label className="font-semibold">كود الخصم (اختياري)</Label>
                    <div className="flex gap-2">
                      <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="مثال: STRONG20" className="uppercase" />
                      <Button variant="secondary" onClick={async () => {
                        try {
                          const res = await postToGas("verifyDiscount", { code: discountCode });
                          if (res.valid) alert(`تم تطبيق خصم ${res.discountPercent}% بنجاح!`);
                          else alert(res.error || "كود غير صالح");
                        } catch(e) { alert("حدث خطأ في الاتصال"); }
                      }} disabled={!discountCode}>تطبيق</Button>
                    </div>
                  </div>
                </div>
                {errorMsg && <p className="text-destructive text-sm text-center font-bold">{errorMsg}</p>}
                <div className="flex justify-between items-center pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}>رجوع</Button>
                  <Button onClick={handleSubmit} disabled={!name || !phone || !paymentNumber || isSubmitting} className="rounded-full px-8 text-base">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : "Get My Planner 💗"}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
