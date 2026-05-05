import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SuccessPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 text-4xl"
      >
        💗
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 max-w-md"
      >
        <h1 className="text-3xl font-black text-foreground">تم استلام طلبك!</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          شكراً ليكِ 🌸 فريقنا هيراجع طلبك ويطبع جدولك ويغلفه عشان يوصلك في أسرع وقت. هنتواصل معاكِ لتأكيد الشحن!
        </p>
        <p className="text-sm text-muted-foreground">
          ابقي متابعة موبايلك ✨
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Link href="/">
          <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold">
            الرجوع للرئيسية
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
