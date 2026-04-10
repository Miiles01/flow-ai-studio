import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Calendar, ShoppingCart } from "lucide-react";

type Props = {
  commissionRate: string | null;
  priceMin: number | null;
  priceMax: number | null;
};

function parseCommission(rate: string | null): number {
  if (!rate) return 10;
  const match = rate.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 10;
}

export default function EarningsCalculator({ commissionRate, priceMin, priceMax }: Props) {
  const [salesCount, setSalesCount] = useState(20);
  const [days, setDays] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const commission = parseCommission(commissionRate);
  const avgPrice = priceMin && priceMax ? (priceMin + priceMax) / 2 : priceMin || priceMax || 50;
  const earningsPerSale = (avgPrice * commission) / 100;
  const totalEarnings = earningsPerSale * salesCount;
  const dailyRate = days > 0 ? totalEarnings / days : 0;
  const monthlyEarnings = dailyRate * 30;

  // Generate chart data points
  const chartData = useMemo(() => {
    const points: { day: number; earnings: number }[] = [];
    const numPoints = Math.min(days, 12);
    for (let i = 0; i <= numPoints; i++) {
      const day = Math.round((i / numPoints) * days);
      const progress = i / numPoints;
      // Slightly curved growth
      const earned = totalEarnings * Math.pow(progress, 0.85);
      points.push({ day, earnings: earned });
    }
    return points;
  }, [salesCount, days, totalEarnings]);

  // Animate on data change
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
  }, [salesCount, days, commission, avgPrice]);

  // Draw chart on canvas
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

    const padX = 0;
    const padTop = 10;
    const padBottom = 4;
    const chartW = w - padX * 2;
    const chartH = h - padTop - padBottom;
    const maxEarn = totalEarnings || 1;

    ctx.clearRect(0, 0, w, h);

    // Draw animated line
    const visiblePoints = chartData.length;
    const drawUpTo = Math.floor(animProgress * (visiblePoints - 1));
    const partialFrac = (animProgress * (visiblePoints - 1)) - drawUpTo;

    function getXY(i: number) {
      const x = padX + (i / (visiblePoints - 1)) * chartW;
      const y = padTop + chartH - (chartData[i].earnings / maxEarn) * chartH;
      return { x, y };
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padTop, 0, h);
    gradient.addColorStop(0, "rgba(64, 89, 241, 0.12)");
    gradient.addColorStop(1, "rgba(64, 89, 241, 0)");

    // Fill area
    ctx.beginPath();
    ctx.moveTo(padX, padTop + chartH);
    for (let i = 0; i <= drawUpTo; i++) {
      const { x, y } = getXY(i);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
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
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-miiles-blue" />
          <h3 className="text-sm font-normal">Proyección de ganancias</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left — controls */}
          <div className="space-y-6">
            {/* Sales slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-miiles-gray-400 font-light flex items-center gap-1.5">
                  <ShoppingCart size={13} />
                  Ventas estimadas
                </label>
                <span className="text-sm font-normal text-miiles-blue">{salesCount}</span>
              </div>
              <Slider
                value={[salesCount]}
                onValueChange={(v) => setSalesCount(v[0])}
                min={1}
                max={200}
                step={1}
                className="[&_[role=slider]]:bg-miiles-blue [&_[role=slider]]:border-miiles-blue [&_[data-orientation=horizontal]>span:first-child>span]:bg-miiles-blue"
              />
            </div>

            {/* Days slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-miiles-gray-400 font-light flex items-center gap-1.5">
                  <Calendar size={13} />
                  Periodo (días)
                </label>
                <span className="text-sm font-normal text-miiles-blue">{days}</span>
              </div>
              <Slider
                value={[days]}
                onValueChange={(v) => setDays(v[0])}
                min={7}
                max={180}
                step={1}
                className="[&_[role=slider]]:bg-miiles-blue [&_[role=slider]]:border-miiles-blue [&_[data-orientation=horizontal]>span:first-child>span]:bg-miiles-blue"
              />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
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
                <p className="text-[10px] text-miiles-gray-400 font-light">Costo mensual</p>
                <p className="text-sm font-normal mt-0.5">${monthlyEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right — chart + total */}
          <div className="flex flex-col">
            {/* Total earnings */}
            <div className="mb-4">
              <p className="text-[10px] text-miiles-gray-400 font-light uppercase tracking-wider">Ganancia estimada</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={totalEarnings.toFixed(2)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-2xl font-normal text-miiles-blue mt-1"
                >
                  <DollarSign size={20} className="inline -mt-1" />
                  {totalEarnings.toFixed(2)}
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] text-miiles-gray-400 font-light mt-0.5">
                ${earningsPerSale.toFixed(2)} por venta · {days} días
              </p>
            </div>

            {/* Canvas chart */}
            <div className="flex-1 min-h-[160px] relative">
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
