import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import avatar3 from "@/assets/avatar3.png";

// React Flow Imports
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ShapeNode from "@/components/nodes/ShapeNode";
import TodoNode from "@/components/nodes/TodoNode";

// SVG Logos for Brands (Colaboraciones)
const mercadoLibreLogo = (
  <svg className="h-[60px] w-auto text-black dark:text-white shrink-0" viewBox="1338.7 1396.4 150.1 135.8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m1378.1 1504.2h1.4v28h-5.3v-24.6c0-.8 1.7-3.4 3.9-3.4zm29 6.2c-2.6 0-4.6 1.1-6 3.3v-9.5h-.6c-2.6 0-4 1.4-4.7 2.6v-.2 16.1c0 6.3 3.3 9.5 9.9 9.5 6.6-.1 9.8-3.7 9.8-10.7 0-7.3-2.8-10.9-8.4-11.1zm-1.6 17.2c-3 0-4.5-2.2-4.4-6.4.2-4.1 1.6-6.1 4.5-6.1s4.3 2 4.5 6.1c0 4.3-1.6 6.4-4.6 6.4zm13.1-6.4c.2-6.8 3.5-10.6 10.6-10.6h1.6v5.5h-2.5c-3 0-4.3 1.9-4.3 5v11h-5.4zm20.6 5.5c.9.8 2.1 1.2 3.7 1.2 1.1 0 2.1-.3 2.9-.9s1.3-1.2 1.5-1.8h5c-.8 2.5-2 4.2-3.7 5.3s-3.6 1.6-6 1.6c-1.6 0-3.1-.3-4.4-.8s-2.4-1.3-3.3-2.2c-.9-1-1.6-2.1-2.1-3.4s-.7-2.8-.7-4.4c0-1.5.3-3 .8-4.3s1.2-2.5 2.1-3.4c.9-1 2-1.7 3.3-2.3s2.7-.8 4.3-.8c1.7 0 3.3.3 4.6 1s2.4 1.6 3.2 2.7 1.4 2.4 1.8 3.9c.4 1.4.5 3 .4 4.6h-14.9c.2 1.9.7 3.2 1.5 4zm6.4-10.8c-.7-.7-1.7-1.1-3.1-1.1-.9 0-1.7.2-2.3.5s-1.1.7-1.4 1.1c-.4.5-.6.9-.8 1.4s-.2 1-.3 1.4h9.2c-.1-1.5-.6-2.6-1.3-3.3zm-60.4-11.7h5.3v4.8h-5.3zm0 7.2h5.3v20.7h-5.3zm96.7-18.3c-.9 1-2.1 1.6-3.6 1.6s-2.7-.6-3.6-1.6-1.2-2.7-1.2-4.7c0-2.1.4-3.6 1.2-4.6.9-1 2.1-1.6 3.6-1.6s2.7.6 3.6 1.6 1.2 2.7 1.2 4.6-.3 3.5-1.2 4.7zm4.2-12.4c-1.6-2.1-4.3-3.3-7.8-3.3-3.4 0-6.2 1-7.8 3.3-1.6 2.1-2.6 4.7-2.6 7.6 0 3 .9 5.6 2.6 7.6 1.6 2.1 4.3 3.2 7.8 3.2 3.4 0 6.2-1 7.8-3.2 1.6-2.1 2.6-4.7 2.6-7.6.1-2.8-.8-5.4-2.6-7.6m-26 12.4c-.7 1-1.9 1.6-3.4 1.6s-2.7-.6-3.3-1.6c-.7-1.2-1-2.7-1-4.7 0-1.8.3-3.2 1-4.3.7-1.2 1.8-1.8 3.4-1.8 1 0 1.9.3 2.7.9 1.2 1 1.9 3 1.9 5.6-.3 1.8-.5 3.3-1.3 4.3zm6.2-21.8s-5.4-.6-5.4 3.7v5.7c-.6-.9-1.3-1.6-2.4-2.3-.9-.6-2.1-.7-3.3-.7-2.7 0-4.8 1-6.5 3-1.6 1.9-2.4 4.8-2.4 8.4 0 3 .7 5.6 2.4 7.3 1.6 1.9 4.8 2.7 7.6 2.7 9.9 0 9.7-8.4 9.7-8.4zm-26.6 19.3c0 1.8-.6 3-1.5 3.7-1 .6-2.1 1-3.2 1-.7 0-1.3-.1-1.8-.6s-.7-1-.7-1.9c0-1 .4-1.8 1.2-2.3.4-.3 1.3-.6 2.4-.7l1.2-.3c.6-.1 1-.3 1.5-.3.3-.1.7-.3 1-.4zm2.7-11.7c-1.8-.9-3.7-1.3-6-1.3-3.4 0-5.9.9-7.3 2.7-.9 1.2-1.3 2.6-1.5 4.3h5.1c.1-.7.4-1.3.7-1.8.6-.6 1.5-.9 2.7-.9s1.9.1 2.6.4c.6.3.9.9.9 1.8 0 .7-.4 1.2-1.2 1.5-.4.1-1.2.3-2.1.4l-1.8.1c-2.1.3-3.6.7-4.7 1.3-1.9 1-2.9 3-2.9 5.4 0 1.9.6 3.4 1.8 4.5 1.2 1 2.7 1.5 4.6 1.6 11.7.4 11.6-6.2 11.6-7.5v-7.6c.1-2.2-.7-4-2.5-4.9m-26.5 3.3c1.3 0 2.3.4 3 1.2.4.6.7 1.3.7 2.1h5.7c-.3-2.9-1.3-5-3-6-1.6-1.2-3.9-1.6-6.6-1.6-3.2 0-5.7.9-7.5 2.9s-2.7 4.7-2.7 8.1c0 3.2.7 5.6 2.4 7.5 1.6 1.9 4.2 2.9 7.6 2.9s6-1.2 7.8-3.4c1-1.5 1.6-3 1.8-4.7h-5.7c-.1 1-.4 1.9-1 2.6-.6.6-1.5 1-2.9 1-1.8 0-3.2-.9-3.7-2.6-.3-.9-.6-2.1-.6-3.6s.1-2.9.6-3.7c.9-1.8 2.1-2.7 4.1-2.7m-11.9-4.5c-11.9 0-11.1 10.5-11.1 10.5v10.6h5.4v-9.9c0-1.6.1-2.9.6-3.6.7-1.3 2.1-2.1 4.3-2.1h.6c.3 0 .6 0 .9.1v-5.4h-.4c-.1-.2-.1-.2-.3-.2m-26.8 5.5c.7-.7 1.8-1.2 3.2-1.2 1.2 0 2.3.3 3.2 1s1.3 1.8 1.3 3.2h-9.2c.3-1.2.7-2.2 1.5-3zm7.2 9.9c-.1.3-.4.6-.7.7-.7.6-1.8.7-3 .7s-2.1-.1-2.9-.7c-1.3-.7-2.1-2.3-2.1-4.2h14.8c0-1.8 0-3.2-.1-4-.3-1.6-.7-3-1.6-4.2-.9-1.3-2.1-2.4-3.4-3s-3-.9-4.8-.9c-3 0-5.4.9-7.2 2.9-1.8 1.9-2.9 4.6-2.9 8.1 0 3.7 1 6.5 3.2 8.1 2.1 1.6 4.5 2.6 7.2 2.6 3.3 0 5.9-1 7.6-3 1-1 1.6-2.1 1.8-3.2zm-16.2 5.6h-5v-12.3c0-1.2-.3-3.7-3.6-3.7-2.1 0-3.7 1.5-3.7 3.7v12.3h-5v-12.3c0-1.2-.3-3.7-3.6-3.7-2.1 0-3.6 1.5-3.6 3.7v12.3h-5v-12.2c0-5.1 3.3-9 8.5-9 2.6 0 4.7 1 6.2 2.9 1.5-1.8 3.6-2.9 6.2-2.9 5.4 0 8.5 3.7 8.5 9zm93.3-71.2c0-17.1-21.3-31.1-47.6-31.1s-47.6 14-47.6 31.1v1.8c0 18.2 18.6 32.9 47.6 32.9 29.1 0 47.6-14.7 47.6-32.9z" fill="currentColor"/><path d="m1459.8 1427.5c0 16.1-20.5 29.2-45.7 29.2s-45.7-13.1-45.7-29.2 20.5-29.2 45.7-29.2 45.7 13.1 45.7 29.2z" fill="currentColor"/><g fill="currentColor"><path d="m1398.9 1418.3s-.5.5-.2.9c.7.9 2.9 1.4 5.2.9 1.3-.3 3.1-1.7 4.7-3 1.8-1.4 3.6-2.9 5.4-3.4 1.9-.6 3.1-.3 3.9-.1.9.3 1.9.9 3.6 2.1 3.1 2.3 15.7 13.3 17.9 15.2 1.7-.8 9.5-4.1 20.1-6.5-.9-5.6-4.3-10.8-9.5-15-7.2 3-16.1 4.6-24.8.4 0 0-4.7-2.2-9.4-2.1-6.9.2-9.8 3.1-13 6.3z"/><path d="m1438.9 1432.1c-.1-.1-14.8-12.9-18.1-15.4-1.9-1.4-3-1.8-4.1-2-.6-.1-1.4 0-2 .2-1.5.4-3.6 1.8-5.4 3.2-1.9 1.5-3.6 2.9-5.2 3.2-2.1.5-4.6-.1-5.7-.9-.5-.3-.8-.7-1-1.1-.4-1 .4-1.8.5-1.9l4-4.4 1.4-1.4c-1.3.2-2.5.5-3.7.8-1.5.4-2.9.8-4.3.8-.6 0-3.8-.5-4.4-.7-3.7-1-6.9-2-11.7-4.2-5.7 4.3-9.6 9.6-10.7 15.5.8.2 2.2.6 2.7.7 13 2.9 17 5.9 17.8 6.5.8-.9 1.9-1.4 3.2-1.4 1.4 0 2.7.7 3.5 1.8.7-.6 1.8-1.1 3.1-1.1.6 0 1.2.1 1.9.3 1.5.5 2.2 1.5 2.6 2.4.5-.2 1.1-.4 1.8-.4s1.4.2 2.2.5c2.4 1 2.8 3.4 2.6 5.2h.5c2.9 0 5.2 2.3 5.2 5.2 0 .9-.2 1.7-.6 2.4.8.4 2.7 1.4 4.5 1.2 1.4-.2 1.9-.6 2.1-.9.1-.2.3-.4.1-.6l-3.7-4.1s-.6-.6-.4-.8.6.1.9.3c1.9 1.6 4.1 3.9 4.1 3.9s.2.3 1 .5c.7.1 2 0 2.9-.7.2-.2.5-.4.6-.6.9-1.2-.1-2.4-.1-2.4l-4.3-4.8s-.6-.6-.4-.8.6.1.9.3c1.4 1.1 3.3 3.1 5.1 4.9.4.3 2 1.3 4.1-.1 1.3-.9 1.6-1.9 1.5-2.7-.1-1-.9-1.8-.9-1.8l-5.8-5.9s-.6-.5-.4-.8c.2-.2.6.1.9.3 1.9 1.6 6.9 6.2 6.9 6.2.1 0 1.8 1.3 4-.1.8-.5 1.3-1.2 1.3-2.1.1-1.3-1-2.2-1-2.2z"/><path d="m1410.6 1439.6c-.9 0-1.9.5-2 .5s0-.4.1-.6 1.3-3.8-1.6-5.1c-2.2-1-3.6.1-4 .6-.1.1-.2.1-.2 0 0-.6-.3-2.4-2.3-3-2.8-.9-4.5 1.1-5 1.8-.2-1.6-1.5-2.8-3.2-2.8-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c.9 0 1.6-.3 2.2-.9v.1c-.1.8-.4 3.7 2.6 4.8 1.2.5 2.2.1 3.1-.5.3-.2.3-.1.3.1-.1.7 0 2.3 2.3 3.2 1.7.7 2.7 0 3.3-.6.3-.3.4-.2.4.2.1 2.1 1.9 3.8 4 3.8 2.2 0 4-1.8 4-4s-1.8-4-4-4z"/></g><path d="m1439.5 1430.6c-4.5-3.9-14.9-13-17.8-15.1-1.6-1.2-2.7-1.9-3.7-2.1-.4-.1-1-.3-1.8-.3-.7 0-1.5.1-2.3.4-1.8.6-3.6 2-5.4 3.4l-.1.1c-1.6 1.3-3.3 2.6-4.6 2.9-.6.1-1.1.2-1.7.2-1.4 0-2.7-.4-3.2-1-.1-.1 0-.3.2-.5l4-4.3c3.1-3.1 6-6 12.8-6.2h.3c4.2 0 8.4 1.9 8.9 2.1 4 1.9 8 2.9 12.1 2.9 4.3 0 8.7-1.1 13.3-3.2-.5-.4-1.1-.9-1.6-1.3-4.1 1.8-7.9 2.6-11.7 2.6s-7.6-.9-11.3-2.7c-.2-.1-4.8-2.3-9.7-2.3h-.4c-5.7.1-8.9 2.1-11 3.9-2.1 0-3.9.6-5.5 1-1.4.4-2.7.7-3.9.7h-1.5c-1.4 0-8.4-1.7-13.9-3.9-.6.4-1.1.8-1.7 1.2 5.8 2.4 12.9 4.2 15.1 4.4.6 0 1.3.1 2 .1 1.5 0 2.9-.4 4.4-.8.9-.2 1.8-.5 2.7-.7l-.8.8-4 4.4c-.3.3-1 1.2-.6 2.2.2.4.6.8 1.1 1.2 1 .6 2.7 1.1 4.3 1.1.6 0 1.2-.1 1.7-.2 1.7-.4 3.5-1.8 5.3-3.3 1.5-1.2 3.6-2.7 5.2-3.2.5-.1 1-.2 1.5-.2h.4c1.1.1 2.1.5 4 1.9 3.3 2.5 18 15.3 18.1 15.4 0 0 .9.8.9 2.2 0 .7-.5 1.4-1.2 1.9-.6.4-1.3.6-1.9.6-1 0-1.7-.5-1.7-.5s-5.1-4.6-6.9-6.2c-.3-.3-.6-.5-.9-.5-.2 0-.3.1-.4.2-.3.4 0 .9.4 1.2l5.9 5.9s.7.7.8 1.6c0 1-.4 1.8-1.4 2.4-.7.5-1.4.7-2.1.7-.9 0-1.5-.4-1.7-.5l-.9-.8c-1.5-1.5-3.1-3.1-4.3-4-.3-.2-.6-.5-.9-.5-.1 0-.3 0-.4.2-.1.1-.2.4.1.9.1.2.3.3.3.3l4.3 4.8s.9 1.1.1 2l-.2.2-.4.4c-.7.6-1.7.7-2.1.7h-.6c-.4-.1-.7-.2-.9-.4-.2-.3-2.4-2.4-4.2-3.9-.2-.2-.5-.4-.8-.4-.1 0-.3.1-.4.2-.3.4.2 1 .4 1.2l3.7 4s0 .1-.1.3-.6.6-1.9.8h-.5c-1.4 0-2.8-.7-3.6-1.1.3-.7.5-1.5.5-2.3 0-3-2.4-5.4-5.4-5.4h-.2c.1-1.4-.1-4-2.8-5.1-.8-.3-1.5-.5-2.3-.5-.6 0-1.1.1-1.7.3-.6-1.1-1.5-1.9-2.7-2.3-.7-.2-1.3-.3-2-.3-1.1 0-2.1.3-3 1a4.6 4.6 0 0 0 -3.6-1.7c-1.2 0-2.4.5-3.2 1.3-1.1-.9-5.6-3.7-17.7-6.5-.6-.1-1.9-.5-2.7-.8-.1.6-.2 1.3-.3 2 0 0 2.2.5 2.7.6 12.3 2.7 16.4 5.6 17.1 6.1-.2.6-.3 1.2-.3 1.8 0 2.6 2.1 4.6 4.6 4.6.3 0 .6 0 .9-.1.4 1.9 1.6 3.3 3.5 4 .6.2 1.1.3 1.6.3.3 0 .7 0 1.1-.1.3.9 1.1 2 2.9 2.7.6.3 1.2.4 1.8.4.5 0 1-.1 1.4-.3.8 2 2.8 3.4 5 3.4 1.5 0 2.9-.6 3.9-1.7.9.5 2.7 1.4 4.6 1.4h.7c1.9-.2 2.7-1 3.1-1.5.1-.1.1-.2.2-.3.4.1.9.2 1.5.2 1 0 2-.3 3-1.1 1-.7 1.7-1.7 1.7-2.6.3.1.7.1 1 .1 1 0 2.1-.3 3.1-1 1.9-1.2 2.2-2.9 2.2-3.9.3.1.7.1 1 .1 1 0 2-.3 2.9-.9 1.2-.8 1.9-1.9 2-3.2.1-.9-.2-1.8-.6-2.6 3.2-1.4 10.4-4 19-6 0-.7-.1-1.3-.3-2-10.3 2.2-18 5.5-19.9 6.4zm-28.9 16.7c-2 0-3.6-1.6-3.7-3.6 0-.2 0-.6-.4-.6-.2 0-.3.1-.5.2-.4.4-1 .8-1.8.8-.4 0-.8-.1-1.2-.3-2.1-.9-2.2-2.3-2.1-2.9 0-.2 0-.3-.1-.4l-.1-.1h-.1c-.1 0-.2 0-.4.2-.6.4-1.2.6-1.8.6-.3 0-.7-.1-1-.2-2.8-1.1-2.6-3.7-2.4-4.5 0-.2 0-.3-.1-.4l-.2-.2-.2.2c-.6.5-1.3.8-2 .8-1.6 0-2.9-1.3-2.9-2.9s1.3-2.9 2.9-2.9c1.4 0 2.7 1.1 2.9 2.5l.1.8.4-.7c0-.1 1.2-1.9 3.4-1.8.4 0 .8.1 1.3.2 1.7.5 2 2.1 2 2.7 0 .4.3.4.3.4.1 0 .3-.1.3-.2.3-.3 1-.9 2.1-.9.5 0 1 .1 1.6.4 2.7 1.2 1.5 4.6 1.5 4.7-.2.6-.3.8 0 1h.2c.1 0 .3 0 .5-.1.4-.1.9-.3 1.4-.3 2 0 3.7 1.7 3.7 3.7.1 2.2-1.6 3.8-3.6 3.8z" fill="currentColor"/>
  </svg>
);

const lorealLogo = (
  <svg className="h-[32px] w-auto text-black dark:text-white shrink-0" enableBackground="new 0 0 2498.1 452" viewBox="0 0 2498.1 452" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m1359.1 421.6h322.4v-39.4h-267.1v-126h200.6v-39.8h-200.6v-116.1h267.1v-39.2h-322.4zm167.5-418.8-43.6 49 137-49h-93.4zm696 379.4v-321.1h-50.4v360.5h325.9v-39.4zm-332.3-321.1-183.3 360.5h62l46.9-93.3h219.9l47.3 93.3h61.3l-183.5-360.5zm-51.2 222 86.4-172.2 87.4 172.2zm-655-12.3c82.6-22 90.6-83.5 90.2-105.5-4.9-64.3-48.3-104.2-126.3-104.2h-227.2v360.5h51.8v-151.3h147.9l108.8 151.2h65.3c.1.1-78.2-101.7-110.5-150.7m-43.1-43.1h-168.4v-124h174.2c40.1 0 62.7 18.7 70.8 42.5 5.4 16.3 1.9 37.7-7 52.3-14.5 24.1-42.1 29.2-69.6 29.2zm-531.5-227.7c-146.2 0-245.9 103.1-245.9 227.9 0 131.4 110.1 224.1 245.9 224.1 135.7 0 245.8-91.4 245.8-224.1 0-124.8-100.9-227.9-245.8-227.9m-1.7 407.2c-101.2 0-184.5-81.3-184.5-179.2 0-97.8 79.4-183 188.4-183 106.3 0 184.5 85.2 184.5 183 0 97.9-87.3 179.2-188.4 179.2zm-374.7-218.6h37.4l67.8-127.5h-54.6zm-182.7 193.6v-321.1h-50.4v360.5h325.9v-39.4z" />
  </svg>
);

const tiktokLogo = (
  <svg className="h-[44px] w-auto text-black dark:text-white shrink-0" viewBox="0 0 296.96 80.12982445231711" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M56.17 13.47c-2.73-2.66-4.55-6.22-5.23-10.13-.09-.52-.16-1.05-.21-1.57V0h-13.8v54.77c-.02 6.38-5.21 11.55-11.6 11.55-1.88 0-3.65-.45-5.22-1.24a11.585 11.585 0 0 1-6.38-10.36c0-6.4 5.19-11.6 11.6-11.6 1.23 0 2.41.19 3.52.54V29.64c-1.15-.16-2.32-.24-3.48-.24C11.35 29.43 0 40.78 0 54.77c0 8.78 4.46 16.51 11.24 21.06a25.22 25.22 0 0 0 14.12 4.29c14.01 0 25.36-11.35 25.36-25.35V26.78a32.785 32.785 0 0 0 19.12 6.12V19.19c-2.11 0-4.2-.34-6.18-1.01-1.39-.47-4.02-1.31-7.5-4.71z"/>
    <g fillRule="evenodd">
      <path d="M88.2 23.03v9.64h11.29v36.72h11.29V32.93h9.19l3.15-9.9zm92.43 0v9.64h11.29v36.72h11.29V32.93h9.19l3.15-9.9zm-55.4 5.47c0-3.02 2.46-5.47 5.51-5.47s5.52 2.45 5.52 5.47-2.47 5.47-5.52 5.47-5.51-2.45-5.51-5.47zm0 9.38h11.02v31.51h-11.02zm15.75-14.85v46.36h11.03V57.41l3.41-3.13 10.76 15.37H178l-15.49-22.4 13.92-13.55h-13.39l-11.03 10.94V23.02h-11.03zm118.95 0v46.36h11.03V57.41l3.41-3.13 10.77 15.37h11.82l-15.49-22.4 13.92-13.55H282l-11.03 10.94V23.02h-11.03zM234.19 69.65c10.59 0 19.17-8.51 19.17-19.01s-8.58-19.01-19.17-19.01h-.26c-10.59 0-19.17 8.51-19.17 19.01s8.58 19.01 19.17 19.01zm-9.45-19.01c0-5.11 4.18-9.24 9.32-9.24s9.32 4.14 9.32 9.24-4.18 9.25-9.32 9.25c-5.15 0-9.32-4.14-9.32-9.25z"/>
    </g>
  </svg>
);

const amazonLogo = (
  <svg className="h-[48px] w-auto text-black dark:text-white shrink-0" viewBox="-0.658000000000003 -1.875 384.24600000000004 119.917" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M81.633 27.542V64.65a2.268 2.268 0 0 1-2.268 2.268H67.651a2.269 2.269 0 0 1-2.268-2.268V4.292a2.268 2.268 0 0 1 2.268-2.268h10.84a2.268 2.268 0 0 1 2.268 2.268v8.5S84.634.667 96.134.667c0 0 11.375-1.375 16 11.25 0 0 3.875-11.25 15.625-11.25 0 0 17.474-1.039 17.474 17.042l.133 9.958v37.108a2.268 2.268 0 0 1-2.268 2.268h-11.715a2.269 2.269 0 0 1-2.268-2.268l-.107-40.483c.333-9.167-7.083-8.5-7.083-8.5-9.333.167-8.435 11.875-8.435 11.875v37.108a2.268 2.268 0 0 1-2.268 2.268H99.508a2.269 2.269 0 0 1-2.268-2.268V25.208s.685-9.5-7.649-9.5c.001 0-8.249-1.083-7.958 11.834zM383.588 27.431v37.107a2.269 2.269 0 0 1-2.268 2.268l-12.183.236a2.269 2.269 0 0 1-2.268-2.268V25.208s.685-9.5-7.648-9.5c0 0-7.959-.392-7.959 14.503v34.438a2.269 2.269 0 0 1-2.268 2.268h-11.715a2.269 2.269 0 0 1-2.268-2.268V4.292a2.269 2.269 0 0 1 2.268-2.268h10.84a2.268 2.268 0 0 1 2.268 2.268v8.5S354.262.667 365.762.667c0 0 12.319-1.869 16.468 11.015.001-.001 1.358 2.657 1.358 15.749zM299.008.417c-14.98 0-27.125 12.625-27.125 33.875 0 18.709 9.375 33.875 27.125 33.875 16.75 0 27.125-15.166 27.125-33.875 0-20.875-12.144-33.875-27.125-33.875zm9.455 34.625c0 8-1 12.25-1 12.25-1.423 8.457-7.562 8.469-8.467 8.424-.977.039-7.168-.049-8.449-8.424 0 0-1-4.25-1-12.25v-1.333c0-8 1-12.25 1-12.25 1.281-8.375 7.473-8.463 8.449-8.425.905-.045 7.044-.034 8.467 8.425 0 0 1 4.25 1 12.25zM265.084 12.708v-8.66a2.269 2.269 0 0 0-2.268-2.268h-38.72a2.268 2.268 0 0 0-2.268 2.268v8.593a2.269 2.269 0 0 0 2.268 2.268h20.197l-23.906 34.68s-.942 1.406-.911 2.959v10.549s-.156 3.617 3.946 1.518c0 0 7.286-4.402 19.503-4.402 0 0 12.065-.15 20.109 4.781 0 0 3.339 1.518 3.339-1.82v-9.182s.303-2.43-2.884-3.947c0 0-9.258-5.084-21.399-4.25zM56.342 56.124l-3.667-5.582c-1.167-2.084-1.083-4.418-1.083-4.418V20.375C52.092-1.875 27.425.042 27.425.042 5.497.042 2.258 17.107 2.258 17.107c-.914 3.431 1.744 3.514 1.744 3.514l10.715 1.087s1.827.418 2.492-1.757c0 0 1.411-7.445 9.302-7.445 8.586 0 8.497 7.369 8.497 7.369v6.169c-17.14.573-25.083 5.331-25.083 5.331-10.583 6-9.917 17.917-9.917 17.917 0 19.416 18.5 18.582 18.5 18.582 11.833 0 18.833-8.666 18.833-8.666 2.083 3.668 5.917 7.166 5.917 7.166 1.918 2.08 3.917.334 3.917.334l8.667-7.416c1.916-1.418.5-3.168.5-3.168zm-32.059-.24c-5.566 0-7.635-5.531-6.711-10.967.925-5.436 5.729-9.708 17.437-9.583v3.305c.415 14.438-6.093 17.245-10.726 17.245zM212.008 56.124l-3.666-5.582c-1.167-2.084-1.084-4.418-1.084-4.418V20.375c.5-22.25-24.167-20.333-24.167-20.333-21.928 0-25.167 17.065-25.167 17.065-.914 3.431 1.744 3.514 1.744 3.514l10.715 1.087s1.827.418 2.492-1.757c0 0 1.411-7.445 9.302-7.445 8.586 0 8.497 7.369 8.497 7.369v6.169c-17.139.573-25.083 5.331-25.083 5.331-10.583 6-9.917 17.917-9.917 17.917 0 19.416 18.5 18.582 18.5 18.582 11.833 0 18.833-8.666 18.833-8.666 2.084 3.668 5.916 7.166 5.916 7.166 1.918 2.08 3.918.334 3.918.334l8.666-7.416c1.917-1.418.501-3.168.501-3.168zm-32.059-.24c-5.566 0-7.635-5.531-6.711-10.967.925-5.436 5.729-9.708 17.436-9.583v3.305c.416 14.438-6.091 17.245-10.725 17.245z"/>
    <g fill="currentColor">
      <path d="M241.504 104.862s-.98 1.705.224 2.086c0 0 1.36.531 3.056-1.043 0 0 12.369-10.805 12.667-30.477 0 0 .091-2.457-.895-3.129 0 0-3.875-3.428-17.809-2.385 0 0-12.146.82-18.777 6.707 0 0-.596.521-.596 1.191 0 0-.143 1.447 3.502.82 0 0 12.145-1.715 19.373-.82 0 0 3.727.447 4.77 1.715 0 0 1.714 1.416.819 6.109 0 .002-2.46 11.924-6.334 19.226z"/>
      <path d="M239.055 85.989s1.814 2.35-1.113 4.377c0 0-31.267 25.01-83.767 25.01 0 0-54.042 2.666-99.167-38.334 0 0-1.582-1.389-.6-2.68 0 0 .878-1.188 3.151.104 0 0 42.449 26.451 98.199 26.451 0 0 38.75 1.5 78.5-15.5 0 0 3.167-1.641 4.797.572z"/>
    </g>
  </svg>
);

const airbnbLogo = (
  <svg className="h-[48px] w-auto text-black dark:text-white shrink-0" viewBox="329.775 439.999 320.426 100.002" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M498.65 465.125c0 3.604-2.904 6.506-6.508 6.506s-6.506-2.902-6.506-6.506 2.803-6.506 6.506-6.506c3.706.1 6.508 3.003 6.508 6.506zm-26.828 13.114v1.602s-3.102-4.006-9.709-4.006c-10.91 0-19.42 8.309-19.42 19.82 0 11.412 8.41 19.82 19.42 19.82 6.707 0 9.709-4.104 9.709-4.104v1.701c0 .801.602 1.4 1.402 1.4h8.107v-37.639h-8.107c-.8.003-1.402.705-1.402 1.406zm0 24.123c-1.5 2.203-4.504 4.105-8.107 4.105-6.406 0-11.312-4.004-11.312-10.812 0-6.807 4.906-10.811 11.312-10.811 3.504 0 6.707 2.002 8.107 4.104v13.414zm15.516-25.526h9.609v37.639h-9.609v-37.639zm143.545-1.002c-6.607 0-9.711 4.006-9.711 4.006v-21.121h-9.609v55.756h8.109c.801 0 1.4-.701 1.4-1.402v-1.701s3.104 4.104 9.709 4.104c10.912 0 19.42-8.406 19.42-19.818s-8.508-19.824-19.318-19.824zm-1.602 30.532c-3.705 0-6.607-1.9-8.109-4.104v-13.414c1.502-2.002 4.705-4.104 8.109-4.104 6.406 0 11.311 4.004 11.311 10.811s-4.904 10.811-11.311 10.811zm-22.722-14.213v22.422h-9.611v-21.322c0-6.205-2.002-8.709-7.404-8.709-2.902 0-5.906 1.502-7.811 3.705v26.227h-9.607v-37.639h7.605c.801 0 1.402.701 1.402 1.402v1.602c2.803-2.904 6.506-4.006 10.209-4.006 4.205 0 7.709 1.203 10.512 3.605 3.402 2.803 4.705 6.406 4.705 12.713zm-57.76-16.319c-6.605 0-9.709 4.006-9.709 4.006v-21.121h-9.609v55.756h8.107c.801 0 1.402-.701 1.402-1.402v-1.701s3.104 4.104 9.709 4.104c10.912 0 19.42-8.406 19.42-19.818.1-11.413-8.408-19.824-19.32-19.824zm-1.602 30.532c-3.703 0-6.605-1.9-8.107-4.104v-13.414c1.502-2.002 4.705-4.104 8.107-4.104 6.408 0 11.312 4.004 11.312 10.811s-4.904 10.811-11.312 10.811zm-26.025-30.532c2.902 0 4.404.502 4.404.502v8.908s-8.008-2.703-13.012 3.004v26.326h-9.611v-37.738h8.109c.801 0 1.4.701 1.4 1.402v1.602c1.804-2.103 5.708-4.006 8.71-4.006zm-99.799 35.237c-.5-1.201-1.001-2.502-1.501-3.604-.802-1.801-1.603-3.504-2.302-5.105l-.1-.1c-6.908-15.016-14.314-30.23-22.123-45.244l-.3-.602a196.953 196.953 0 0 1-2.401-4.705c-1.002-1.803-2.002-3.703-3.604-5.506-3.203-4.004-7.808-6.207-12.712-6.207-5.006 0-9.51 2.203-12.812 6.006-1.502 1.801-2.604 3.703-3.604 5.506a217.271 217.271 0 0 1-2.401 4.705l-.301.602c-7.708 15.014-15.215 30.229-22.122 45.244l-.101.199c-.7 1.604-1.502 3.305-2.303 5.105-.5 1.102-1 2.303-1.5 3.604-1.302 3.703-1.703 7.207-1.201 10.812 1.101 7.508 6.105 13.812 13.013 16.617 2.603 1.102 5.306 1.602 8.108 1.602.801 0 1.801-.1 2.603-.201 3.304-.4 6.707-1.5 10.011-3.402 4.104-2.303 8.008-5.605 12.412-10.41 4.404 4.805 8.408 8.107 12.412 10.41 3.305 1.902 6.707 3.002 10.01 3.402.801.102 1.803.201 2.604.201 2.803 0 5.605-.5 8.107-1.602 7.008-2.805 11.912-9.209 13.014-16.617.795-3.503.395-7.005-.906-10.71zm-45.144 5.205c-5.406-6.807-8.91-13.213-10.11-18.617-.5-2.303-.601-4.305-.3-6.107.199-1.602.801-3.004 1.602-4.205 1.902-2.701 5.105-4.404 8.809-4.404 3.705 0 7.008 1.602 8.81 4.404.801 1.201 1.401 2.604 1.603 4.205.299 1.803.199 3.904-.301 6.107-1.205 5.304-4.709 11.711-10.113 18.617zm39.938 4.705c-.7 5.205-4.204 9.711-9.108 11.713-2.402 1-5.006 1.301-7.607 1-2.502-.301-5.006-1.102-7.607-2.602-3.604-2.004-7.207-5.105-11.412-9.711 6.606-8.107 10.61-15.516 12.112-22.121.701-3.104.802-5.906.5-8.51-.399-2.502-1.301-4.805-2.702-6.807-3.105-4.506-8.311-7.107-14.115-7.107s-11.01 2.703-14.113 7.107c-1.401 2.002-2.303 4.305-2.703 6.807-.4 2.604-.301 5.506.5 8.51 1.501 6.605 5.605 14.113 12.111 22.221-4.104 4.605-7.808 7.709-11.412 9.711-2.603 1.502-5.104 2.303-7.606 2.602-2.702.301-5.306-.1-7.608-1-4.904-2.002-8.408-6.508-9.108-11.713-.3-2.502-.101-5.004.901-7.807.299-1.002.801-2.002 1.301-3.203.701-1.602 1.5-3.305 2.302-5.006l.101-.199c6.906-14.916 14.313-30.131 22.021-44.945l.3-.602c.802-1.5 1.603-3.102 2.403-4.604.801-1.602 1.701-3.104 2.803-4.406 2.102-2.4 4.904-3.703 8.008-3.703s5.906 1.303 8.008 3.703c1.102 1.305 2.002 2.807 2.803 4.406.802 1.502 1.603 3.104 2.402 4.604l.301.602a1325.424 1325.424 0 0 1 21.922 45.045v.1c.802 1.604 1.502 3.404 2.303 5.008.5 1.199 1.001 2.199 1.301 3.201.799 2.6 1.099 5.104.698 7.706z" />
  </svg>
);

const shopifyLogo = (
  <svg className="h-[44px] w-auto text-black dark:text-white shrink-0" viewBox="0 0 100 28.6" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path className="fill-current" d="M11.3,1c0.2,0,0.3,0.1,0.5,0.2C10.6,1.7,9.4,3,8.8,5.8L6.6,6.4C7.3,4.4,8.7,1,11.3,1z M12.4,2c0.2,0.6,0.4,1.3,0.4,2.4c0,0.1,0,0.1,0,0.2L9.9,5.4C10.5,3.3,11.5,2.4,12.4,2z M15,3.8l-1.3,0.4c0-0.1,0-0.2,0-0.3c0-0.9-0.1-1.6-0.3-2.2C14.1,1.9,14.7,2.8,15,3.8z M21.5,5.4c0-0.1-0.1-0.2-0.2-0.2C21.1,5.2,19,5,19,5s-1.5-1.5-1.7-1.6c-0.2-0.2-0.5-0.1-0.6-0.1c0,0-0.3,0.1-0.8,0.3c-0.5-1.4-1.4-2.7-2.9-2.7c0,0-0.1,0-0.1,0c-0.4-0.6-1-0.8-1.5-0.8C7.8,0,6.1,4.5,5.5,6.8C4.7,7,3.9,7.3,3,7.6c-0.8,0.2-0.8,0.3-0.9,1C2,9.1,0,24.9,0,24.9l15.9,3l8.6-1.9C24.5,26,21.5,5.6,21.5,5.4z" />
      <path className="fill-current opacity-70" d="M21.2,5.2C21.1,5.2,19,5,19,5s-1.5-1.5-1.7-1.6c-0.1-0.1-0.1-0.1-0.2-0.1l-1.2,24.6l8.6-1.9c0,0-3-20.4-3-20.6C21.5,5.3,21.3,5.2,21.2,5.2" />
      <path className="fill-white dark:fill-black" d="M13,10l-1.1,3.2c0,0-0.9-0.5-2.1-0.5c-1.7,0-1.8,1-1.8,1.3c0,1.4,3.8,2,3.8,5.4c0,2.7-1.7,4.4-4,4.4c-2.7,0-4.1-1.7-4.1-1.7l0.7-2.4c0,0,1.4,1.2,2.6,1.2c0.8,0,1.1-0.6,1.1-1.1c0-1.9-3.1-2-3.1-5.1c0-2.6,1.9-5.1,5.6-5.1C12.3,9.5,13,10,13,10" />
      <path className="fill-current" d="M34.6,15.9c-0.9-0.5-1.3-0.9-1.3-1.4c0-0.7,0.6-1.1,1.6-1.1c1.1,0,2.1,0.5,2.1,0.5l0.8-2.4c0,0-0.7-0.6-2.8-0.6c-3,0-5,1.7-5,4.1c0,1.4,1,2.4,2.2,3.1c1,0.6,1.4,1,1.4,1.6c0,0.6-0.5,1.2-1.5,1.2c-1.4,0-2.8-0.7-2.8-0.7l-0.8,2.4c0,0,1.2,0.8,3.3,0.8c3,0,5.2-1.5,5.2-4.2C37,17.7,35.9,16.6,34.6,15.9 M46.7,10.8c-1.5,0-2.7,0.7-3.6,1.8l0,0l1.3-6.8H41l-3.3,17.3h3.4l1.1-5.9c0.4-2.2,1.6-3.6,2.7-3.6c0.8,0,1.1,0.5,1.1,1.3c0,0.5,0,1-0.1,1.5l-1.3,6.8h3.4l1.3-7c0.1-0.7,0.2-1.6,0.2-2.2C49.5,12,48.5,10.8,46.7,10.8 M55.4,20.7c-1.2,0-1.6-1-1.6-2.2c0-1.9,1-5.1,2.8-5.1c1.2,0,1.6,1,1.6,2C58.2,17.6,57.2,20.7,55.4,20.7z M57.1,10.8c-4.1,0-6.8,3.7-6.8,7.8c0,2.6,1.6,4.7,4.7,4.7c4,0,6.7-3.6,6.7-7.8C61.7,13.1,60.3,10.8,57.1,10.8z M67.1,20.8c-0.9,0-1.4-0.5-1.4-0.5l0.6-3.2c0.4-2.1,1.5-3.5,2.7-3.5c1,0,1.4,1,1.4,1.9C70.3,17.7,69,20.8,67.1,20.8z M70.4,10.8c-2.3,0-3.6,2-3.6,2h0l0.2-1.8h-3c-0.1,1.2-0.4,3.1-0.7,4.5l-2.4,12.4h3.4l0.9-5h0.1c0,0,0.7,0.4,2,0.4c4,0,6.6-4.1,6.6-8.2C73.9,12.9,72.9,10.8,70.4,10.8z M78.7,6c-1.1,0-1.9,0.9-1.9,2c0,1,0.6,1.7,1.6,1.7h0c1.1,0,2-0.7,2-2C80.4,6.7,79.7,6,78.7,6 M74,23.1h3.4l2.3-12h-3.4L74,23.1z M88.3,11.1h-2.4l0.1-0.6c0.2-1.2,0.9-2.2,2-2.2c0.6,0,1.1,0.2,1.1,0.2l0.7-2.7c0,0-0.6-0.3-1.8-0.3c-1.2,0-2.4,0.3-3.3,1.1c-1.2,1-1.7,2.4-2,3.8l-0.1,0.6H81l-0.5,2.6h1.6l-1.8,9.5h3.4l1.8-9.5h2.3L88.3,11.1z M96.4,11.1c0,0-2.1,5.3-3.1,8.2h0c-0.1-0.9-0.8-8.2-0.8-8.2h-3.6l2,11c0,0.2,0,0.4-0.1,0.6c-0.4,0.8-1.1,1.5-1.8,2c-0.6,0.5-1.4,0.8-1.9,1l0.9,2.9c0.7-0.1,2.1-0.7,3.3-1.8c1.5-1.4,3-3.7,4.4-6.7l4.1-8.9L96.4,11.1z" />
    </g>
  </svg>
);

const BRANDS = [
  { name: "Mercado Libre", logo: mercadoLibreLogo },
  { name: "L'Oréal", logo: lorealLogo },
  { name: "TikTok", logo: tiktokLogo },
  { name: "Amazon", logo: amazonLogo },
  { name: "Airbnb", logo: airbnbLogo },
  { name: "Shopify", logo: shopifyLogo },
];

const brandsRow1 = [...BRANDS, ...BRANDS, ...BRANDS]; // Repeat 3 times for a smooth continuous scroll in 1 row

type Step = {
  key: string;
  title: string;
  description: string;
  media?: string;
};

const STEPS: Step[] = [
  {
    key: "colaboraciones",
    title: "Colaboraciones",
    description:
      "Encuentra marcas líderes y colabora con ellas en proyectos creativos para redes sociales y estrategias digitales de alto impacto.",
  },
  {
    key: "modelos_ia",
    title: "Generador de modelos de negocio",
    description:
      "Crea tableros interactivos y modela tus flujos de trabajo con inteligencia artificial para acelerar el crecimiento de tus ideas.",
  },
  {
    key: "perfil",
    title: "Gestiona tu portafolio",
    description:
      "Gestiona tu perfil profesional, diseña un portafolio que capte la atención de las marcas y recibe invitaciones a colaboraciones especiales.",
  },
];

const STORAGE_PREFIX = "miiles_tutorial_seen";

type Props = {
  userId?: string | null;
  /** Increment this number to force-open the modal (e.g. from a banner click). */
  triggerOpen?: number;
};

export default function TutorialModal({ userId, triggerOpen }: Props) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  useEffect(() => {
    // Wait until we know which user we are dealing with
    if (userId === undefined) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [userId, storageKey]);

  // Allow opening the modal on demand (banner click)
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      setActive(0);
      setOpen(true);
    }
  }, [triggerOpen]);

  function close() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (active < STEPS.length - 1) {
      setActive((a) => a + 1);
    } else {
      close();
    }
  }

  const step = STEPS[active];
  const isLast = active === STEPS.length - 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — igual al overlay del menú de la landing */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Card — bg-[#7E7E7E] igual al menú desplegable de la landing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] md:max-h-none md:h-[580px] overflow-hidden rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%]"
            style={{ background: isDark ? "#000000" : "#7E7E7E" }}
          >
            {/* Close button — Movido como hijo directo para que quede fijo en mobile */}
            <button
              onClick={close}
              className="absolute right-4 top-4 md:right-5 md:top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Left panel — title + steps */}
            <div className="p-6 pb-2 md:p-10 flex flex-col flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-normal leading-tight text-white pr-10 md:pr-0">
                Bienvenido a Miiles
              </h2>

              <nav className="mt-4 md:mt-10 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {STEPS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(i)}
                    className={`shrink-0 block text-left px-4 py-2 rounded-xl text-xs md:text-sm transition-colors w-auto md:w-full ${
                      i === active
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right panel — media + content */}
            <div className="flex flex-col flex-grow overflow-y-auto md:overflow-visible min-h-0" style={{ background: isDark ? "#000000" : "#7E7E7E" }}>
              {/* Media area */}
              <div className="relative m-4 mb-0 h-40 md:h-64 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 select-none">
                {/* Grid Pattern Background */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    maskImage: "radial-gradient(ellipse, black 25%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse, black 25%, transparent 75%)"
                  }}
                >
                  <defs>
                    <pattern
                      id="tut-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#tut-grid)" />
                </svg>

                {/* Illustration Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {active === 0 && (
                    <div className="w-full flex items-center justify-center py-2">
                      {/* Row 1: Left to right marquee */}
                      <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                        <div className="flex w-max gap-3.5 animate-marquee">
                          {brandsRow1.map((b, idx) => (
                            <div key={idx} className={`flex items-center justify-center px-8 h-24 rounded-[20px] border backdrop-blur-md shrink-0 ${
                              isDark 
                                ? "bg-black/60 border-white/5 text-white" 
                                : "bg-white/85 border-neutral-200/60 text-neutral-900 shadow-sm"
                            }`}>
                              {b.logo}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 1 && (
                    <div className="relative w-full h-full select-none z-10 flex items-center justify-center">
                      <ReactFlowProvider>
                        <ReactFlow
                          nodes={[
                            {
                              id: "node-start",
                              type: "shapeNode",
                              position: { x: 20, y: 50 },
                              style: { width: 100, height: 100 },
                              data: {
                                shape: "circle",
                                label: "1. Brainstorm",
                                fillColor: "#FFFFFF",
                                strokeColor: "#10B981",
                                textColor: "#111827",
                                bold: true,
                              },
                            },
                            {
                              id: "node-left",
                              type: "shapeNode",
                              position: { x: 160, y: 55 },
                              style: { width: 130, height: 90 },
                              data: {
                                shape: "square",
                                label: "2. Analizar Idea",
                                fillColor: "#FFFFFF",
                                strokeColor: "#4059F1",
                                textColor: "#111827",
                                bold: true,
                              },
                            },
                            {
                              id: "node-right",
                              type: "todoNode",
                              position: { x: 330, y: 15 },
                              style: { width: 250, height: 250 },
                              data: {
                                title: "Lista de Tareas",
                                subtitle: "Tareas de Lanzamiento",
                                tasks: [
                                  { id: "t1", text: "Definir propuesta de valor", completed: true },
                                  { id: "t2", text: "Diseñar landing page", completed: true },
                                ],
                              },
                            },
                            {
                              id: "node-end",
                              type: "shapeNode",
                              position: { x: 600, y: 45 },
                              style: { width: 110, height: 110 },
                              data: {
                                shape: "diamond",
                                label: "4. Lanzamiento 🚀",
                                fillColor: "#FFFFFF",
                                textColor: "#111827",
                                bold: true,
                              },
                            }
                          ]}
                          edges={[
                            {
                              id: "edge-1",
                              source: "node-start",
                              sourceHandle: "right",
                              target: "node-left",
                              targetHandle: "left",
                              animated: true,
                              style: { stroke: "#10B981", strokeWidth: 2, strokeDasharray: "4 4" },
                            },
                            {
                              id: "edge-2",
                              source: "node-left",
                              sourceHandle: "right",
                              target: "node-right",
                              targetHandle: "left",
                              animated: false,
                              style: { stroke: "#4059F1", strokeWidth: 2, strokeDasharray: "4 4" },
                            },
                            {
                              id: "edge-3",
                              source: "node-right",
                              sourceHandle: "right",
                              target: "node-end",
                              targetHandle: "left",
                              animated: false,
                              style: { stroke: "#8B5CF6", strokeWidth: 2, strokeDasharray: "4 4" },
                            }
                          ]}
                          nodeTypes={{
                            shapeNode: ShapeNode,
                            todoNode: TodoNode,
                          }}
                          fitView
                          fitViewOptions={{ padding: 0.08 }}
                          panOnDrag={false}
                          zoomOnScroll={false}
                          zoomOnPinch={false}
                          zoomOnDoubleClick={false}
                          nodesDraggable={false}
                          nodesConnectable={false}
                          elementsSelectable={false}
                          proOptions={{ hideAttribution: true }}
                          style={{ width: "100%", height: "100%", background: "transparent" }}
                        />
                      </ReactFlowProvider>

                      {/* Cursors */}
                      <div className="absolute left-[24%] top-[30%] z-50 pointer-events-none flex items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#4059F1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#4059F1] text-white py-1.5 px-3 rounded-full shadow-[0_4px_10px_rgba(64,89,241,0.3)] -ml-1.5 mt-3.5 flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-none">Mateo</span>
                        </div>
                      </div>

                      <div className="absolute right-[16%] bottom-[18%] z-50 pointer-events-none flex items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#FCB5B9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#FCB5B9] text-neutral-800 py-1.5 px-3 rounded-full shadow-[0_4px_10px_rgba(252,181,185,0.3)] -ml-1.5 mt-3.5 flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-none">Sofía</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 2 && (
                    <div className="flex items-center justify-center w-full px-4 sm:px-6">
                      {/* Profile Card */}
                      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center gap-2 sm:gap-2.5 shrink-0 shadow-lg ${
                        isDark ? "bg-black/80 border-white/10" : "bg-white border-neutral-200"
                      }`} style={{ width: "160px" }}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#4059F1]">
                          <img src={avatar3} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <div className={`text-[12px] sm:text-[13px] font-semibold ${isDark ? "text-white" : "text-neutral-800"}`}>Laura Morales</div>
                          <div className="text-[8px] sm:text-[9px] text-[#4059F1] font-semibold bg-[#4059F1]/10 px-2 py-0.5 rounded-full mt-1 inline-block">Creador Pro</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 flex flex-col flex-grow">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-xl md:text-2xl font-normal text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 md:mt-3 text-xs md:text-sm font-light leading-relaxed text-white/70">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-1.5 mt-5 md:mt-6">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-white" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 md:mt-auto pt-6 md:pt-8 flex items-center justify-end gap-3">
                  <button
                    onClick={close}
                    className="rounded-full bg-black text-white px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-zinc-900 transition-colors"
                  >
                    Probar ahora
                  </button>
                  <button
                    onClick={next}
                    className="rounded-full bg-white text-black px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-gray-100 transition-colors"
                  >
                    {isLast ? "Listo" : "Siguiente"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
