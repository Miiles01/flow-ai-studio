import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

type Props = {
  commissionRate: string | null;
  priceMin: number | null;
  priceMax: number | null;
  avgSales: number;
};

function parseCommission(rate: string | null): number {
  if (!rate) return 10;
  const match = rate.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 10;
}

const DAYS = 30;

export default function EarningsCalculator({ commissionRate, priceMin, priceMax, avgSales }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const commission = parseCommission(commissionRate);
  const avgPrice = priceMin && priceMax ? (priceMin + priceMax) / 2 : priceMin || priceMax || 50;
  const earningsPerSale = (avgPrice * commission) / 100;
  const totalEarnings = earningsPerSale * avgSales;
  const monthlyEarnings = totalEarnings;

  const chartData = useMemo(() => {
    const points: { day: number; earnings: number }[] = [];
    const numPoints = 12;
    for (let i = 0; i <= numPoints; i++) {
      const day = Math.round((i / numPoints) * DAYS);
      const progress = i / numPoints;
      const earned = totalEarnings * Math.pow(progress, 0.85);
      points.push({ day, earnings: earned });
    }
    return points;
  }, [avgSales, totalEarnings]);

  useEffect(() => {
    setAnimProgress(0);
    let start: number;
    const duration = 1200;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setAnimProgress(p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [avgSales, commission, avgPrice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const padLeft = 40;
    const padRight = 12;
    const padTop = 14;
    const padBottom = 24;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;
    const maxEarn = totalEarnings || 1;

    ctx.clearRect(0, 0, w, h);

    // Draw Y axis labels & grid lines
    const yTicks = 4;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "10px sans-serif";
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxEarn / yTicks) * i;
      const y = padTop + chartH - (i / yTicks) * chartH;
      // Grid line
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      // Label
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(`$${Math.round(val)}`, padLeft - 6, y);
    }

    // Draw X axis labels
    const xLabels = ["0", "10", "20", "30"];
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    xLabels.forEach((label, i) => {
      const x = padLeft + (i / (xLabels.length - 1)) * chartW;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(`D${label}`, x, padTop + chartH + 6);
    });

    const visiblePoints = chartData.length;
    const drawUpTo = Math.floor(animProgress * (visiblePoints - 1));
    const partialFrac = (animProgress * (visiblePoints - 1)) - drawUpTo;

    function getXY(i: number) {
      const x = padLeft + (i / (visiblePoints - 1)) * chartW;
      const y = padTop + chartH - (chartData[i].earnings / maxEarn) * chartH;
      return { x, y };
    }

    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, "rgba(64, 89, 241, 0.12)");
    gradient.addColorStop(1, "rgba(64, 89, 241, 0)");

    // Fill area
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + chartH);
    for (let i = 0; i <= drawUpTo; i++) {
      const { x, y } = getXY(i);
      ctx.lineTo(x, y);
    }
    if (drawUpTo < visiblePoints - 1 && partialFrac > 0) {
      const a = getXY(drawUpTo);
      const b = getXY(drawUpTo + 1);
      ctx.lineTo(a.x + (b.x - a.x) * partialFrac, a.y + (b.y - a.y) * partialFrac);
    }
    const lastDrawnX = drawUpTo < visiblePoints - 1 && partialFrac > 0
      ? getXY(drawUpTo).x + (getXY(drawUpTo + 1).x - getXY(drawUpTo).x) * partialFrac
      : getXY(drawUpTo).x;
    ctx.lineTo(lastDrawnX, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    for (let i = 0; i <= drawUpTo; i++) {
      const { x, y } = getXY(i);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    if (drawUpTo < visiblePoints - 1 && partialFrac > 0) {
      const a = getXY(drawUpTo);
      const b = getXY(drawUpTo + 1);
      ctx.lineTo(a.x + (b.x - a.x) * partialFrac, a.y + (b.y - a.y) * partialFrac);
    }
    ctx.strokeStyle = "#4059F1";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Dots
    for (let i = 0; i <= drawUpTo; i++) {
      const { x, y } = getXY(i);
      const dotScale = Math.min(1, (animProgress * (visiblePoints - 1) - i + 1));
      if (dotScale <= 0) continue;
      ctx.beginPath();
      ctx.arc(x, y, 4 * dotScale, 0, Math.PI * 2);
      ctx.fillStyle = "#4059F1";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2 * dotScale, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
  }, [chartData, animProgress, totalEarnings]);

  return (
    <div className="rounded-md overflow-hidden" style={{ background: "linear-gradient(to right, #FDFDFD, #F8F9FD)" }}>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-miiles-blue" />
          <h3 className="text-sm font-normal">Estadísticas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left — stats */}
          <div className="space-y-4">
            {/* Avg sales stat */}
            <div className="rounded-sm p-3" style={{ background: "rgba(64, 89, 241, 0.04)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingCart size={13} className="text-miiles-gray-400" />
                <p className="text-[10px] text-miiles-gray-400 font-light">Ventas promedio de afiliados actuales</p>
              </div>
              <p className="text-lg font-normal text-miiles-blue">{avgSales}</p>
              <p className="text-[10px] text-miiles-gray-400 font-light">por mes (30 días)</p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              {priceMin != null && priceMax != null && (
                <div className="rounded-sm p-3" style={{ background: "rgba(64, 89, 241, 0.04)" }}>
                  <p className="text-[10px] text-miiles-gray-400 font-light">Rango de precio</p>
                  <p className="text-sm font-normal mt-0.5">${priceMin} – ${priceMax}</p>
                </div>
              )}
              <div className="rounded-sm p-3" style={{ background: "rgba(64, 89, 241, 0.04)" }}>
                <p className="text-[10px] text-miiles-gray-400 font-light">Comisión</p>
                <p className="text-sm font-normal mt-0.5">{commission}%</p>
              </div>
              <div className="rounded-sm p-3" style={{ background: "rgba(64, 89, 241, 0.04)" }}>
                <p className="text-[10px] text-miiles-gray-400 font-light">Ganancia por venta</p>
                <p className="text-sm font-normal mt-0.5">${earningsPerSale.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right — chart + total */}
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-[10px] text-miiles-gray-400 font-light uppercase tracking-wider">Ganancia mensual estimada</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={monthlyEarnings.toFixed(2)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-2xl font-normal text-miiles-blue mt-1"
                >
                  <DollarSign size={20} className="inline -mt-1" />
                  {monthlyEarnings.toFixed(2)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex-1 min-h-[180px] relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
