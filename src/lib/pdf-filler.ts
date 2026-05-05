import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type Order = {
  id: number;
  name: string;
  phone: string;
  workoutDays: number;
  workoutSplit: string;
  exercises: string;
  createdAt: string;
};

// Use browser fetch to get static assets from public/ directory
export async function fillLogbook(order: Order): Promise<Uint8Array> {
  const [templateRes, fontRes] = await Promise.all([
    fetch("/Girl-Edition-Logbook123.pdf"),
    fetch("/MrDumDum-Heavy.ttf")
  ]);

  if (!templateRes.ok || !fontRes.ok) {
    throw new Error("Failed to load PDF template or font");
  }

  const templateBytes = await templateRes.arrayBuffer();
  const fontBytes = await fontRes.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  let exercisesMap: Record<string, string[]> = {};
  try {
    exercisesMap = JSON.parse(order.exercises);
  } catch (err) {
    console.error("Failed to parse exercises", err);
  }

  // Cover Page
  const pages = pdfDoc.getPages();
  const coverPage = pages[0];
  const { width: coverWidth, height: coverHeight } = coverPage.getSize();
  const safeName = order.name.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "").trim();

  coverPage.drawText(safeName, {
    x: coverWidth / 2 - (customFont.widthOfTextAtSize(safeName, 36) / 2),
    y: coverHeight * 0.25,
    size: 36,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // Duplicate the daily workout page
  const dailyWorkoutPageIndex = 5;
  const originalDailyPage = pages[dailyWorkoutPageIndex];
  
  if (!originalDailyPage) {
    return pdfDoc.save();
  }

  const numDays = order.workoutDays || 3;
  const dailyPages = [originalDailyPage];

  for (let i = 1; i < numDays; i++) {
    const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [dailyWorkoutPageIndex]);
    pdfDoc.insertPage(dailyWorkoutPageIndex + i, copiedPage);
    dailyPages.push(copiedPage);
  }

  // Fill the daily workout pages
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    const dayLabel = \`Day \${dayIndex + 1}\`;
    const dayPage = dailyPages[dayIndex];
    const exList = exercisesMap[dayLabel] || [];

    // Draw Day Label
    dayPage.drawText(dayLabel, {
      x: 300,
      y: 750,
      size: 24,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    const startX = 50;
    let startY = 600;
    const yStep = 40;

    exList.forEach((exName, index) => {
      dayPage.drawText(\`\${index + 1}. \${exName}\`, {
        x: startX,
        y: startY - (index * yStep),
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    });
  }

  return pdfDoc.save();
}
