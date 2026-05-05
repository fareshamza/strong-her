import { Button } from "@/components/ui/button";
import OrderPage from "./order";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col items-center">

        {/* Hero */}
        <div className="w-full bg-gradient-to-b from-primary/10 to-background py-20 px-6 flex flex-col items-center text-center">
          <div className="mb-4 text-5xl">💗</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary mb-4">
            Strong Her Planner
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-foreground mb-3">
            جدول تمارينك — مطبوع ومجهز وجاهز يوصلك 💪
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
            اختاري تمارينك وأيامك، وسيبي الباقي علينا — نطبعه ونغلفه ونوصّلهولك لحد باب البيت.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <a href="#order-section">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all font-bold">
                ابدئي دلوقتي
              </Button>
            </a>
            <a href="/track">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10 font-semibold">
                تتبعي طلبك 🔍
              </Button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-4xl mx-auto py-14 px-6">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">ليه Strong Her؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🎯", title: "مخصص ليكِ", desc: "اختاري تمارينك بنفسك من كل مجموعة عضلية" },
              { icon: "📋", title: "مطبوع ومجهز", desc: "نطبعه A5 احترافي ونغلفه ونبعتهولك" },
              { icon: "⚡", title: "سريع وسهل", desc: "اختاري في دقيقتين واستلمي البلانر جاهز" },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div id="order-section" className="w-full max-w-2xl mx-auto pb-16 px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">اطلبي جدولك الآن</h2>
          <OrderPage />
        </div>

      </main>

      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
        Strong Her Planner 💗 — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
