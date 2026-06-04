import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PricingTable from "@/components/PricingTable";
import { Check, MousePointer, Hand, Type, ListTodo, ImageIcon, SquareDashed } from "lucide-react";
import funcionesHero from "@/assets/funciones-hero.webp.asset.json";
import avatar1 from "@/assets/avatar1.png";
import avatar2 from "@/assets/avatar2.png";
import avatar3 from "@/assets/avatar3.png";
import avatar4 from "@/assets/avatar4.png";
import starBadge from "@/assets/star-badge.png";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

// SVG Logos for Brands (Colaboraciones)
const lorealLogo = (
  <svg className="h-[24px] sm:h-[32px] w-auto text-black dark:text-white shrink-0" enableBackground="new 0 0 2498.1 452" viewBox="0 0 2498.1 452" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m1359.1 421.6h322.4v-39.4h-267.1v-126h200.6v-39.8h-200.6v-116.1h267.1v-39.2h-322.4zm167.5-418.8-43.6 49 137-49h-93.4zm696 379.4v-321.1h-50.4v360.5h325.9v-39.4zm-332.3-321.1-183.3 360.5h62l46.9-93.3h219.9l47.3 93.3h61.3l-183.5-360.5zm-51.2 222 86.4-172.2 87.4 172.2zm-655-12.3c82.6-22 90.6-83.5 90.2-105.5-4.9-64.3-48.3-104.2-126.3-104.2h-227.2v360.5h51.8v-151.3h147.9l108.8 151.2h65.3c.1.1-78.2-101.7-110.5-150.7m-43.1-43.1h-168.4v-124h174.2c40.1 0 62.7 18.7 70.8 42.5 5.4 16.3 1.9 37.7-7 52.3-14.5 24.1-42.1 29.2-69.6 29.2zm-531.5-227.7c-146.2 0-245.9 103.1-245.9 227.9 0 131.4 110.1 224.1 245.9 224.1 135.7 0 245.8-91.4 245.8-224.1 0-124.8-100.9-227.9-245.8-227.9m-1.7 407.2c-101.2 0-184.5-81.3-184.5-179.2 0-97.8 79.4-183 188.4-183 106.3 0 184.5 85.2 184.5 183 0 97.9-87.3 179.2-188.4 179.2zm-374.7-218.6h37.4l67.8-127.5h-54.6zm-182.7 193.6v-321.1h-50.4v360.5h325.9v-39.4z" />
  </svg>
);

const tiktokLogo = (
  <svg className="h-[32px] sm:h-[44px] w-auto text-black dark:text-white shrink-0" viewBox="0 0 296.96 80.12982445231711" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M56.17 13.47c-2.73-2.66-4.55-6.22-5.23-10.13-.09-.52-.16-1.05-.21-1.57V0h-13.8v54.77c-.02 6.38-5.21 11.55-11.6 11.55-1.88 0-3.65-.45-5.22-1.24a11.585 11.585 0 0 1-6.38-10.36c0-6.4 5.19-11.6 11.6-11.6 1.23 0 2.41.19 3.52.54V29.64c-1.15-.16-2.32-.24-3.48-.24C11.35 29.43 0 40.78 0 54.77c0 8.78 4.46 16.51 11.24 21.06a25.22 25.22 0 0 0 14.12 4.29c14.01 0 25.36-11.35 25.36-25.35V26.78a32.785 32.785 0 0 0 19.12 6.12V19.19c-2.11 0-4.2-.34-6.18-1.01-1.39-.47-4.02-1.31-7.5-4.71z"/>
    <g fillRule="evenodd">
      <path d="M88.2 23.03v9.64h11.29v36.72h11.29V32.93h9.19l3.15-9.9zm92.43 0v9.64h11.29v36.72h11.29V32.93h9.19l3.15-9.9zm-55.4 5.47c0-3.02 2.46-5.47 5.51-5.47s5.52 2.45 5.52 5.47-2.47 5.47-5.52 5.47-5.51-2.45-5.51-5.47zm0 9.38h11.02v31.51h-11.02zm15.75-14.85v46.36h11.03V57.41l3.41-3.13 10.76 15.37H178l-15.49-22.4 13.92-13.55h-13.39l-11.03 10.94V23.02h-11.03zm118.95 0v46.36h11.03V57.41l3.41-3.13 10.77 15.37h11.82l-15.49-22.4 13.92-13.55H282l-11.03 10.94V23.02h-11.03zM234.19 69.65c10.59 0 19.17-8.51 19.17-19.01s-8.58-19.01-19.17-19.01h-.26c-10.59 0-19.17 8.51-19.17 19.01s8.58 19.01 19.17 19.01zm-9.45-19.01c0-5.11 4.18-9.24 9.32-9.24s9.32 4.14 9.32 9.24-4.18 9.25-9.32 9.25c-5.15 0-9.32-4.14-9.32-9.25z"/>
    </g>
  </svg>
);

const amazonLogo = (
  <svg className="h-[36px] sm:h-[48px] w-auto text-black dark:text-white shrink-0" viewBox="-0.658000000000003 -1.875 384.24600000000004 119.917" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M81.633 27.542V64.65a2.268 2.268 0 0 1-2.268 2.268H67.651a2.269 2.269 0 0 1-2.268-2.268V4.292a2.268 2.268 0 0 1 2.268-2.268h10.84a2.268 2.268 0 0 1 2.268 2.268v8.5S84.634.667 96.134.667c0 0 11.375-1.375 16 11.25 0 0 3.875-11.25 15.625-11.25 0 0 17.474-1.039 17.474 17.042l.133 9.958v37.108a2.268 2.268 0 0 1-2.268 2.268h-11.715a2.269 2.269 0 0 1-2.268-2.268l-.107-40.483c.333-9.167-7.083-8.5-7.083-8.5-9.333.167-8.435 11.875-8.435 11.875v37.108a2.268 2.268 0 0 1-2.268 2.268H99.508a2.269 2.269 0 0 1-2.268-2.268V25.208s.685-9.5-7.649-9.5c.001 0-8.249-1.083-7.958 11.834zM383.588 27.431v37.107a2.269 2.269 0 0 1-2.268 2.268l-12.183.236a2.269 2.269 0 0 1-2.268-2.268V25.208s.685-9.5-7.648-9.5c0 0-7.959-.392-7.959 14.503v34.438a2.269 2.269 0 0 1-2.268 2.268h-11.715a2.269 2.269 0 0 1-2.268-2.268V4.292a2.269 2.269 0 0 1 2.268-2.268h10.84a2.268 2.268 0 0 1 2.268 2.268v8.5S354.262.667 365.762.667c0 0 12.319-1.869 16.468 11.015.001-.001 1.358 2.657 1.358 15.749zM299.008.417c-14.98 0-27.125 12.625-27.125 33.875 0 18.709 9.375 33.875 27.125 33.875 16.75 0 27.125-15.166 27.125-33.875 0-20.875-12.144-33.875-27.125-33.875zm9.455 34.625c0 8-1 12.25-1 12.25-1.423 8.457-7.562 8.469-8.467 8.424-.977.039-7.168-.049-8.449-8.424 0 0-1-4.25-1-12.25v-1.333c0-8 1-12.25 1-12.25 1.281-8.375 7.473-8.463 8.449-8.425.905-.045 7.044-.034 8.467 8.425 0 0 1 4.25 1 12.25zM265.084 12.708v-8.66a2.269 2.269 0 0 0-2.268-2.268h-38.72a2.268 2.268 0 0 0-2.268 2.268v8.593a2.269 2.269 0 0 0 2.268 2.268h20.197l-23.906 34.68s-.942 1.406-.911 2.959v10.549s-.156 3.617 3.946 1.518c0 0 7.286-4.402 19.503-4.402 0 0 12.065-.15 20.109 4.781 0 0 3.339 1.518 3.339-1.82v-9.182s.303-2.43-2.884-3.947c0 0-9.258-5.084-21.399-4.25zM56.342 56.124l-3.667-5.582c-1.167-2.084-1.083-4.418-1.083-4.418V20.375C52.092-1.875 27.425.042 27.425.042 5.497.042 2.258 17.107 2.258 17.107c-.914 3.431 1.744 3.514 1.744 3.514l10.715 1.087s1.827.418 2.492-1.757c0 0 1.411-7.445 9.302-7.445 8.586 0 8.497 7.369 8.497 7.369v6.169c-17.14.573-25.083 5.331-25.083 5.331-10.583 6-9.917 17.917-9.917 17.917 0 19.416 18.5 18.582 18.5 18.582 11.833 0 18.833-8.666 18.833-8.666 2.083 3.668 5.917 7.166 5.917 7.166 1.918 2.08 3.917.334 3.917.334l8.667-7.416c1.916-1.418.5-3.168.5-3.168zm-32.059-.24c-5.566 0-7.635-5.531-6.711-10.967.925-5.436 5.729-9.708 17.437-9.583v3.305c.415 14.438-6.093 17.245-10.726 17.245zM212.008 56.124l-3.666-5.582c-1.167-2.084-1.084-4.418-1.084-4.418V20.375c.5-22.25-24.167-20.333-24.167-20.333-21.928 0-25.167 17.065-25.167 17.065-.914 3.431 1.744 3.514 1.744 3.514l10.715 1.087s1.827.418 2.492-1.757c0 0 1.411-7.445 9.302-7.445 8.586 0 8.497 7.369 8.497 7.369v6.169c-17.139.573-25.083 5.331-25.083 5.331-10.583 6-9.917 17.917-9.917 17.917 0 19.416 18.5 18.582 18.5 18.582 11.833 0 18.833-8.666 18.833-8.666 2.084 3.668 5.916 7.166 5.916 7.166 1.918 2.08 3.918.334 3.918.334l8.666-7.416c1.917-1.418.501-3.168.501-3.168zm-32.059-.24c-5.566 0-7.635-5.531-6.711-10.967.925-5.436 5.729-9.708 17.436-9.583v3.305c.416 14.438-6.091 17.245-10.725 17.245z"/>
    <g fill="currentColor">
       <path d="M241.504 104.862s-.98 1.705.224 2.086c0 0 1.36.531 3.056-1.043 0 0 12.369-10.805 12.667-30.477 0 0 .091-2.457-.895-3.129 0 0-3.875-3.428-17.809-2.385 0 0-12.146.82-18.777 6.707 0 0-.596.521-.596 1.191 0 0-.143 1.447 3.502.82 0 0 12.145-1.715 19.373-.82 0 0 3.727.447 4.77 1.715 0 0 1.714 1.416.819 6.109 0 .002-2.46 11.924-6.334 19.226z"/>
       <path d="M239.055 85.989s1.814 2.35-1.113 4.377c0 0-31.267 25.01-83.767 25.01 0 0-54.042 2.666-99.167-38.334 0 0-1.582-1.389-.6-2.68 0 0 .878-1.188 3.151.104 0 0 42.449 26.451 98.199 26.451 0 0 38.75 1.5 78.5-15.5 0 0 3.167-1.641 4.797.572z"/>
    </g>
  </svg>
);

const airbnbLogo = (
  <svg className="h-[36px] sm:h-[48px] w-auto text-black dark:text-white shrink-0" viewBox="329.775 439.999 320.426 100.002" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M498.65 465.125c0 3.604-2.904 6.506-6.508 6.506s-6.506-2.902-6.506-6.506 2.803-6.506 6.506-6.506c3.706.1 6.508 3.003 6.508 6.506zm-26.828 13.114v1.602s-3.102-4.006-9.709-4.006c-10.91 0-19.42 8.309-19.42 19.82 0 11.412 8.41 19.82 19.42 19.82 6.707 0 9.709-4.104 9.709-4.104v1.701c0 .801.602 1.4 1.402 1.4h8.107v-37.639h-8.107c-.8.003-1.402.705-1.402 1.406zm0 24.123c-1.5 2.203-4.504 4.105-8.107 4.105-6.406 0-11.312-4.004-11.312-10.812 0-6.807 4.906-10.811 11.312-10.811 3.504 0 6.707 2.002 8.107 4.104v13.414zm15.516-25.526h9.609v37.639h-9.609v-37.639zm143.545-1.002c-6.607 0-9.711 4.006-9.711 4.006v-21.121h-9.609v55.756h8.109c.801 0 1.4-.701 1.4-1.402v-1.701s3.104 4.104 9.709 4.104c10.912 0 19.42-8.406 19.42-19.818s-8.508-19.824-19.318-19.824zm-1.602 30.532c-3.705 0-6.607-1.9-8.109-4.104v-13.414c1.502-2.002 4.705-4.104 8.109-4.104 6.406 0 11.311 4.004 11.311 10.811s-4.904 10.811-11.311 10.811zm-22.722-14.213v22.422h-9.611v-21.322c0-6.205-2.002-8.709-7.404-8.709-2.902 0-5.906 1.502-7.811 3.705v26.227h-9.607v-37.639h7.605c.801 0 1.402.701 1.402 1.402v1.602c2.803-2.904 6.506-4.006 10.209-4.006 4.205 0 7.709 1.203 10.512 3.605 3.402 2.803 4.705 6.406 4.705 12.713zm-57.76-16.319c-6.605 0-9.709 4.006-9.709 4.006v-21.121h-9.609v55.756h8.107c.801 0 1.402-.701 1.402-1.402v-1.701s3.104 4.104 9.709 4.104c10.912 0 19.42-8.406 19.42-19.818.1-11.413-8.408-19.824-19.32-19.824zm-1.602 30.532c-3.703 0-6.605-1.9-8.107-4.104v-13.414c1.502-2.002 4.705-4.104 8.107-4.104 6.408 0 11.312 4.004 11.312 10.811s-4.904 10.811-11.312 10.811zm-26.025-30.532c2.902 0 4.404.502 4.404.502v8.908s-8.008-2.703-13.012 3.004v26.326h-9.611v-37.738h8.109c.801 0 1.4.701 1.4 1.402v1.602c1.804-2.103 5.708-4.006 8.71-4.006zm-99.799 35.237c-.5-1.201-1.001-2.502-1.501-3.604-.802-1.801-1.603-3.504-2.302-5.105l-.1-.1c-6.908-15.016-14.314-30.23-22.123-45.244l-.3-.602c.802-1.5 1.603-3.102 2.403-4.604.801-1.602 1.701-3.104 2.803-4.406 2.102-2.4 4.904-3.703 8.008-3.703s5.906 1.303 8.008 3.703c1.102 1.305 2.002 2.807 2.803 4.406.802 1.502 1.603 3.104 2.402 4.604l.301.602a1325.424 1325.424 0 0 1 21.922 45.045v.1c.802 1.604 1.502 3.404 2.303 5.008.5 1.199 1.001 2.199 1.301 3.201.799 2.6 1.099 5.104.698 7.706z" />
  </svg>
);

const shopifyLogo = (
  <svg className="h-[32px] sm:h-[44px] w-auto text-black dark:text-white shrink-0" viewBox="0 0 100 28.6" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path className="fill-current" d="M11.3,1c0.2,0,0.3,0.1,0.5,0.2C10.6,1.7,9.4,3,8.8,5.8L6.6,6.4C7.3,4.4,8.7,1,11.3,1z M12.4,2c0.2,0.6,0.4,1.3,0.4,2.4c0,0.1,0,0.1,0,0.2L9.9,5.4C10.5,3.3,11.5,2.4,12.4,2z M15,3.8l-1.3,0.4c0-0.1,0-0.2,0-0.3c0-0.9-0.1-1.6-0.3-2.2C14.1,1.9,14.7,2.8,15,3.8z M21.5,5.4c0-0.1-0.1-0.2-0.2-0.2C21.1,5.2,19,5,19,5s-1.5-1.5-1.7-1.6c-0.2-0.2-0.5-0.1-0.6-0.1c0,0-0.3,0.1-0.8,0.3c-0.5-1.4-1.4-2.7-2.9-2.7c0,0-0.1,0-0.1,0c-0.4-0.6-1-0.8-1.5-0.8C7.8,0,6.1,4.5,5.5,6.8C4.7,7,3.9,7.3,3,7.6c-0.8,0.2-0.8,0.3-0.9,1C2,9.1,0,24.9,0,24.9l15.9,3l8.6-1.9C24.5,26,21.5,5.6,21.5,5.4z" />
      <path className="fill-current opacity-70" d="M21.2,5.2C21.1,5.2,19,5,19,5s-1.5-1.5-1.7-1.6c-0.1-0.1-0.1-0.1-0.2-0.1l-1.2,24.6l8.6-1.9c0,0-3-20.4-3-20.6C21.5,5.3,21.3,5.2,21.2,5.2" />
      <path className="fill-white dark:fill-black" d="M13,10l-1.1,3.2c0,0-0.9-0.5-2.1-0.5c-1.7,0-1.8,1-1.8,1.3c0,1.4,3.8,2,3.8,5.4c0,2.7-1.7,4.4-4,4.4c-2.7,0-4.1-1.7-4.1-1.7l0.7-2.4c0,0,1.4,1.2,2.6,1.2c0.8,0,1.1-0.6,1.1-1.1c0-1.9-3.1-2-3.1-5.1c0-2.6,1.9-5.1,5.6-5.1C12.3,9.5,13,10,13,10" />
      <path className="fill-current" d="M34.6,15.9c-0.9-0.5-1.3-0.9-1.3-1.4c0-0.7,0.6-1.1,1.6-1.1c1.1,0,2.1,0.5,2.1,0.5l0.8-2.4c0,0-0.7-0.6-2.8-0.6c-3,0-5,1.7-5,4.1c0,1.4,1,2.4,2.2,3.1c1,0.6,1.4,1,1.4,1.6c0,0.6-0.5,1.2-1.5,1.2c-1.4,0-2.8-0.7-2.8-0.7l-0.8,2.4c0,0,1.2,0.8,3.3,0.8c3,0,5.2-1.5,5.2-4.2C37,17.7,35.9,16.6,34.6,15.9 M46.7,10.8c-1.5,0-2.7,0.7-3.6,1.8l0,0l1.3-6.8H41l-3.3,17.3h3.4l1.1-5.9c0.4-2.2,1.6-3.6,2.7-3.6c0.8,0,1.1,0.5,1.1,1.3c0,0.5,0,1-0.1,1.5l-1.3,6.8h3.4l1.3-7c0.1-0.7,0.2-1.6,0.2-2.2C49.5,12,48.5,10.8,46.7,10.8 M55.4,20.7c-1.2,0-1.6-1-1.6-2.2c0-1.9,1-5.1,2.8-5.1c1.2,0,1.6,1,1.6,2C58.2,17.6,57.2,20.7,55.4,20.7z M57.1,10.8c-4.1,0-6.8,3.7-6.8,7.8c0,2.6,1.6,4.7,4.7,4.7c4,0,6.7-3.6,6.7-7.8C61.7,13.1,60.3,10.8,57.1,10.8z M67.1,20.8c-0.9,0-1.4-0.5-1.4-0.5l0.6-3.2c0.4-2.1,1.5-3.5,2.7-3.5c1,0,1.4,1,1.4,1.9C70.3,17.7,69,20.8,67.1,20.8z M70.4,10.8c-2.3,0-3.6,2-3.6,2h0l0.2-1.8h-3c-0.1,1.2-0.4,3.1-0.7,4.5l-2.4,12.4h3.4l0.9-5h0.1c0,0,0.7,0.4,2,0.4c4,0,6.6-4.1,6.6-8.2C73.9,12.9,72.9,10.8,70.4,10.8z M78.7,6c-1.1,0-1.9,0.9-1.9,2c0,1,0.6,1.7,1.6,1.7h0c1.1,0,2-0.7,2-2C80.4,6.7,79.7,6,78.7,6 M74,23.1h3.4l2.3-12h-3.4L74,23.1z M88.3,11.1h-2.4l0.1-0.6c0.2-1.2,0.9-2.2,2-2.2c0.6,0,1.1,0.2,1.1,0.2l0.7-2.7c0,0-0.6-0.3-1.8-0.3c-1.2,0-2.4,0.3-3.3,1.1c-1.2,1-1.7,2.4-2,3.8l-0.1,0.6H81l-0.5,2.6h1.6l-1.8,9.5h3.4l1.8-9.5h2.3L88.3,11.1z M96.4,11.1c0,0-2.1,5.3-3.1,8.2h0c-0.1-0.9-0.8-8.2-0.8-8.2h-3.6l2,11c0,0.2,0,0.4-0.1,0.6c-0.4,0.8-1.1,1.5-1.8,2c-0.6,0.5-1.4,0.8-1.9,1l0.9,2.9c0.7-0.1,2.1-0.7,3.3-1.8c1.5-1.4,3-3.7,4.4-6.7l4.1-8.9L96.4,11.1z" />
    </g>
  </svg>
);

const BRANDS = [
  { name: "L'Oréal", logo: lorealLogo },
  { name: "TikTok", logo: tiktokLogo },
  { name: "Amazon", logo: amazonLogo },
  { name: "Airbnb", logo: airbnbLogo },
  { name: "Shopify", logo: shopifyLogo },
];

const brandsRow1 = [...BRANDS, ...BRANDS, ...BRANDS];

const featuresData = [
  {
    id: "colaboraciones",
    badge: "Colaboraciones",
    title: "Colabora con marcas líderes en proyectos de alto impacto",
    description: "Encuentra marcas líderes y colabora con ellas en proyectos creativos para redes sociales y estrategias digitales de alto impacto. Conéctate con audiencias globales de forma sencilla.",
    bullets: [
      "Conexión directa con marcas de primer nivel mundial.",
      "Proyectos creativos y campañas para redes sociales.",
      "Oportunidades exclusivas para monetizar tu portafolio."
    ]
  },
  {
    id: "ai-studio",
    badge: "Inteligencia Artificial",
    title: "Diseña modelos de negocios con la potencia de la IA",
    description: "Describe tu idea y desarrolla toda una estructura de negocio y descubre nuevas oportunidades para desarrollar proyectos escalables.",
    bullets: [
      "Generación instantánea de estructuras comerciales a partir de tu visión.",
      "Visualización clara de tu cadena de valor y flujos de ingresos.",
      "Sugerencias inteligentes de la IA para validar y escalar tu proyecto."
    ]
  },
  {
    id: "collab",
    badge: "Colaboración en Vivo",
    title: "Co-creación y presencia en tiempo real",
    description: "Invita a tu equipo a trabajar en el mismo lienzo. Visualiza los avatares de los usuarios conectados y edita de forma concurrente sin conflictos de cambios.",
    bullets: [
      "Presencia visual interactiva mediante stack de avatares en el encabezado.",
      "Sincronización instantánea de movimientos, colores y conectores.",
      "Compartido rápido mediante URLs públicas para visualización."
    ]
  },
  {
    id: "canvas",
    badge: "Lienzo Avanzado",
    title: "Canvas infinito y personalización total",
    description: "Estructura tus ideas sin límites físicos. Conecta figuras de cualquier tipo mediante handles bidireccionales y muévete con un zoom ultra-amplio de 5% a 400%.",
    bullets: [
      "Líneas de conexión curvadas con etiquetas de texto editables en el centro.",
      "Desconexión rápida de nodos arrastrando desde su mitad izquierda.",
      "Figuras geométricas personalizables con colores vibrantes de marca."
    ]
  }
];

const TypewriterInput = () => {
  const phrases = [
    "Crea un embudo de ventas para mi curso online...",
    "Diseña una campaña de marketing en redes sociales...",
    "Estructura el flujo de onboarding de la app...",
    "Planifica la estrategia de contenido para Instagram...",
    "Organiza el proceso de soporte y tickets B2B..."
  ];

  const [currentText, setCurrentText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentPhrase = phrases[phraseIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(currentPhrase.substring(0, currentText.length - 1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1));
      }, 60);
    }

    if (!isDeleting && currentText === currentPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    }

    if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIdx]);

  return (
    <div className="w-full max-w-[320px] bg-black text-white rounded-[32px] pt-7 pb-4 px-5 text-center flex flex-col justify-between min-h-[145px] shadow-none hover:scale-[1.02] transition-transform duration-300 select-none">
      <div className="flex-1 flex items-center justify-center min-h-[50px] mb-3">
        <p className="text-[13px] text-white font-light leading-relaxed text-center w-full">
          {currentText}
          <span className="inline-block w-[1.5px] h-3.5 ml-0.5 bg-white animate-pulse align-middle" />
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 bg-white/10 h-8 px-3 rounded-full">
          <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[11px] font-light text-white/70 tracking-wider">Apps</span>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          currentText.length > 5 
            ? "bg-white/20 text-white" 
            : "bg-white/5 text-white/30"
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const InteractiveCanvasMockup = () => {
  const [activeTool, setActiveTool] = useState<"select" | "pan" | "shapes" | "text" | "todo" | "image" | "section">("select");
  const [activeShape, setActiveShape] = useState<"square" | "circle" | "diamond" | "triangle" | "hexagon" | "star">("square");
  const [cursorPos, setCursorPos] = useState({ x: 180, y: 221, opacity: 0, scale: 1 });
  const [hoveredTool, setHoveredTool] = useState<"select" | "pan" | "shapes" | "text" | "todo" | "image" | "section" | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [hoveredFlyoutItem, setHoveredFlyoutItem] = useState<string | null>(null);

  useEffect(() => {
    let timeouts: any[] = [];

    const runLoop = () => {
      // Reset everything
      setCursorPos({ x: 180, y: 221, opacity: 0, scale: 1 });
      setActiveTool("select");
      setActiveShape("square");
      setHoveredTool(null);
      setIsFlyoutOpen(false);
      setHoveredFlyoutItem(null);

      // ── Step 1: Pan tool (y=74) ─────────────────────────────────
      // Cursor starts moving
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 28, y: 74, opacity: 1, scale: 1 });
      }, 600));
      // Cursor arrives → tooltip + highlight appear simultaneously
      timeouts.push(setTimeout(() => {
        setHoveredTool("pan");
        setActiveTool("pan");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 1200));
      // Release click
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 1400));

      // ── Step 2: Shapes tool (y=129) ─────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 129, opacity: 1, scale: 1 });
      }, 2000));
      // Cursor arrives → flyout opens + tooltip + highlight at once
      timeouts.push(setTimeout(() => {
        setHoveredTool("shapes");
        setActiveTool("shapes");
        setIsFlyoutOpen(true);
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 2600));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 2800));

      // ── Step 3: Click Círculo in flyout (x=138, y=85) ───────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 138, y: 85, opacity: 1, scale: 1 });
      }, 3400));
      // Cursor arrives → hover flyout item + select at once
      timeouts.push(setTimeout(() => {
        setHoveredFlyoutItem("circle");
        setActiveShape("circle");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 4000));
      // Release + close flyout
      timeouts.push(setTimeout(() => {
        setIsFlyoutOpen(false);
        setHoveredFlyoutItem(null);
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 4200));

      // ── Step 4: Text tool (y=175) ────────────────────────────────
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 28, y: 175, opacity: 1, scale: 1 });
      }, 4800));
      // Cursor arrives → tooltip + highlight simultaneously
      timeouts.push(setTimeout(() => {
        setHoveredTool("text");
        setActiveTool("text");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 5400));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 5600));

      // ── Step 5: Todo tool (y=221) ────────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 221, opacity: 1, scale: 1 });
      }, 6200));
      timeouts.push(setTimeout(() => {
        setHoveredTool("todo");
        setActiveTool("todo");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 6800));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 7000));

      // ── Step 6: Image tool (y=267) ───────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 267, opacity: 1, scale: 1 });
      }, 7600));
      timeouts.push(setTimeout(() => {
        setHoveredTool("image");
        setActiveTool("image");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 8200));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 8400));

      // ── Step 7: Section tool (y=313) ─────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 313, opacity: 1, scale: 1 });
      }, 9000));
      timeouts.push(setTimeout(() => {
        setHoveredTool("section");
        setActiveTool("section");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 9600));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 9800));

      // ── Step 8: Back to Select (y=28) ────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 28, opacity: 1, scale: 1 });
      }, 10400));
      timeouts.push(setTimeout(() => {
        setHoveredTool("select");
        setActiveTool("select");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 11000));
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 11200));

      // ── Exit ─────────────────────────────────────────────────────
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 200, y: -20, opacity: 0, scale: 1 });
      }, 11800));
    };

    runLoop();
    const interval = setInterval(runLoop, 12600);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const shouldShowTooltip = (tool: string) => {
    // Tooltip should ONLY show when hovered, and NOT when flyout is open for shapes
    if (tool === "shapes" && isFlyoutOpen) return false;
    return hoveredTool === tool;
  };

  return (
    <div className="w-full h-full relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden flex items-center justify-center select-none">
      {/* Main Container to relative position the floating details relative to the toolbar */}
      <div className="relative scale-[0.75] sm:scale-90 md:scale-100 origin-center">
        {/* Large Toolbar in the center */}
        <div className="relative w-14 p-2 bg-white rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col items-center gap-1.5 z-20">
          {/* Select Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "select" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <MousePointer size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("select") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Seleccionar
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pan Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "pan" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <Hand size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("pan") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Navegar
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-6 h-[1px] bg-[#E5E7EB] my-1" />

          {/* Shapes Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "shapes" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            {activeShape === "square" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <rect x="2" y="2" width="20" height="20" rx="3" />
              </svg>
            )}
            {activeShape === "circle" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            {activeShape === "diamond" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 22,12 12,22 2,12" />
              </svg>
            )}
            {activeShape === "triangle" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 22,22 2,22" />
              </svg>
            )}
            {activeShape === "hexagon" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
              </svg>
            )}
            {activeShape === "star" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            )}

            {/* Shapes Flyout Menu display */}
            <AnimatePresence>
              {isFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.96, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, scale: 1, y: "-50%" }}
                  exit={{ opacity: 0, x: -8, scale: 0.96, y: "-50%" }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className="absolute left-[calc(100%+16px)] w-[128px] bg-[#111] p-3 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] grid grid-cols-2 gap-2 z-50 pointer-events-none"
                  style={{ top: '20px' }}
                >
                  {/* Rectangulo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "square" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "square" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <rect x="2" y="2" width="20" height="20" rx="3" />
                    </svg>
                  </div>
                  {/* Circulo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "circle" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "circle" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  {/* Rombo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "diamond" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "diamond" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 22,12 12,22 2,12" />
                    </svg>
                  </div>
                  {/* Triángulo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "triangle" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "triangle" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 22,22 2,22" />
                    </svg>
                  </div>
                  {/* Hexágono */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "hexagon" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "hexagon" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
                    </svg>
                  </div>
                  {/* Estrella */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "star" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "star" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formas Tooltip */}
            <AnimatePresence>
              {shouldShowTooltip("shapes") && !isFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 flex items-center leading-none bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Formas
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "text" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <Type size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("text") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 flex items-center leading-none bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Texto
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Todo Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "todo" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <ListTodo size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("todo") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 flex items-center leading-none bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Lista de Tareas
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "image" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <ImageIcon size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("image") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 flex items-center leading-none bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Imagen
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "section" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <SquareDashed size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("section") && (
                <motion.div
                  initial={{ opacity: 0, x: -6, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: -6, y: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 flex items-center leading-none bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Sección
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Mouse Cursor relative to the Toolbar */}
          <div 
            className="absolute z-50 pointer-events-none select-none"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              opacity: cursorPos.opacity,
              transform: `scale(${cursorPos.scale})`,
              transition: "left 0.6s cubic-bezier(0.16, 1, 0.3, 1), top 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, transform 0.1s ease",
            }}
          >
            <svg className="w-5.5 h-5.5 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]" viewBox="0 0 24 24">
              <path 
                d="M4 3l16 8-8 2-6 7z" 
                fill="#222222" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollaborationMockup = () => {
  return (
    <div className="w-full h-full relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden flex items-center justify-center select-none">
      {/* Central Canvas Mockup containing avatars */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Avatars Stack Row */}
        <div className="flex items-center justify-center mt-4">
          {/* Avatar 1 */}
          <motion.div
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0,
            }}
          >
            <img src={avatar1} alt="Colaborador 1" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 2 */}
          <motion.div
            className="relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.2,
            }}
          >
            <img src={avatar2} alt="Colaborador 2" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 3 */}
          <motion.div
            className="relative z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.4,
            }}
          >
            <img src={avatar3} alt="Colaborador 3" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 4 */}
          <motion.div
            className="relative z-40 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.6,
            }}
          >
            <img src={avatar4} alt="Colaborador 4" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Collaborative Presence Cursors */}
        {/* Mateo Cursor (Blue) - Stays in the top area, moves and pauses, never collides with avatars */}
        <motion.div 
          className="absolute left-1/4 top-[20%] z-45 pointer-events-none flex items-start"
          animate={{ 
            x: [-60, 40, 40, -20, -20, -60], 
            y: [-10, 15, 15, -15, -15, -10] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 0.85, 1],
            delay: 0.2
          }}
        >
          <svg className="w-6 h-6 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
            <path 
              d="M4 3l16 8-8 2-6 7z" 
              fill="#4059F1" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round" 
            />
          </svg>
          <div className="bg-[#4059F1] text-white py-1 px-3.5 rounded-full shadow-[0_4px_12px_rgba(64,89,241,0.25)] -ml-1.5 mt-4">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide">Mateo</span>
          </div>
        </motion.div>

        {/* Sofía Cursor (Pink) - Stays in the bottom area, moves and pauses, never collides with avatars */}
        <motion.div 
          className="absolute right-1/4 bottom-[20%] z-45 pointer-events-none flex items-start"
          animate={{ 
            x: [60, -40, -40, 20, 20, 60], 
            y: [15, -10, -10, 20, 20, 15] 
          }}
          transition={{ 
            duration: 9.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.28, 0.5, 0.72, 0.88, 1],
            delay: 1.5 
          }}
        >
          <svg className="w-6 h-6 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
            <path 
              d="M4 3l16 8-8 2-6 7z" 
              fill="#FCB5B9" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round" 
            />
          </svg>
          <div className="bg-[#FCB5B9] text-neutral-800 py-1 px-3.5 rounded-full shadow-[0_4px_12px_rgba(252,181,185,0.3)] -ml-1.5 mt-4">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide">Sofía</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

const Features = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-features",
      content: "#smooth-content-features",
      smooth: 1.4,
      effects: true,
    });

    const ctx = gsap.context(() => {
      // 1. Reveal headers
      document.querySelectorAll<HTMLElement>("#smooth-content-features h1, #smooth-content-features h2, #smooth-content-features h3").forEach((el) => {
        gsap.fromTo(el, { yPercent: 20, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // 2. Responsive ScrollTrigger for horizontal scroll
      let mm = gsap.matchMedia();
      
      mm.add("(min-width: 768px)", () => {
        const track = document.querySelector(".horizontal-track") as HTMLElement;
        if (!track) return;

        gsap.to(".horizontal-track", {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: ".horizontal-section-wrapper",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    return () => {
      smootherRef.current?.kill();
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-features" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-features" className="bg-white text-black font-sans pb-0">
          <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12">
            <h3 className="text-[22px] font-normal mb-4 tracking-tight">
              Presentamos a Miiles
            </h3>
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Lleva tus ideas a la realidad
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl">
              Un lugar pensado para descubrir oportunidades
            </p>
          </section>

          {/* Hero Image */}
          <section className="px-6 pb-24">
            <div className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden shadow-xl border border-gray-100">
              <img
                src={funcionesHero.url}
                alt="Persona usando Miiles en una tablet, cómoda en su sofá"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </section>

          {/* Detailed Features Sections */}
          <section className="horizontal-section-wrapper md:h-screen md:overflow-hidden md:relative pb-32 md:pb-0">
            <div className="horizontal-track flex flex-col md:flex-row md:flex-nowrap md:w-[440vw] md:h-full gap-36 md:gap-0">
              {featuresData.map((f) => (
                <div
                  key={f.id}
                  className={`horizontal-slide w-full md:w-[100vw] md:h-full md:flex-shrink-0 md:flex md:items-center md:justify-center px-6 ${
                    f.id === "ai-studio" ? "md:pl-32 md:pr-20 lg:pl-44 lg:pr-20" : "md:px-20"
                  }`}
                >
                  <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Text Content */}
                    <div className={`flex flex-col text-left ${f.id === "ai-studio" ? "md:pl-6 lg:pl-12" : ""}`}>
                      <span className="text-xs font-semibold tracking-wider text-miiles-blue mb-3 font-sans">
                        {f.badge}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-normal leading-tight tracking-tight text-black mb-6">
                        {f.title}
                      </h2>
                      <p className="text-md font-light text-gray-500 leading-relaxed mb-8">
                        {f.description}
                      </p>
                      <ul className="flex flex-col gap-4">
                        {f.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm font-light text-gray-600 text-left">
                            <div className="w-5 h-5 rounded-full bg-miiles-blue-light flex items-center justify-center shrink-0 mt-0.5 text-miiles-blue">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="leading-normal">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Mockup Container (Responsive Aspect Ratio and Padding for Mobile) */}
                    <div 
                      className="w-full aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden border border-neutral-100 flex items-center justify-center p-6 md:p-10 hover:scale-[1.01] transition-transform duration-500"
                      style={{
                        background: "linear-gradient(to bottom, #FDFDFD, #F8F9FD)"
                      }}
                    >
                      {f.id === "ai-studio" && (
                        <TypewriterInput />
                      )}

                      {f.id === "colaboraciones" && (
                        <div className="w-full flex items-center justify-center py-2 bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50">
                          {/* Row 1: Left to right marquee */}
                          <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                            <div className="flex w-max gap-3.5 animate-marquee">
                              {brandsRow1.map((b, idx) => (
                                <div key={idx} className="flex items-center justify-center px-6 sm:px-8 h-18 sm:h-24 rounded-[20px] border border-neutral-200/60 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-md shrink-0">
                                  {b.logo}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                        {f.id === "collab" && (
                          <CollaborationMockup />
                        )}

                        {f.id === "canvas" && (
                          <InteractiveCanvasMockup />
                        )}
                      </div>
                    </div>
                </div>
              ))}
              {/* Invisible spacer to allow reading the last slide comfortably */}
              <div className="hidden md:block md:w-[40vw] md:h-full md:flex-shrink-0" />
            </div>
          </section>

          {/* Pricing Section Title */}
          <section className="pt-12 pb-6 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-4 max-w-4xl">
              Nuestros planes
            </h2>
            <p className="text-md font-light text-gray-500 max-w-2xl">
              Elige el plan ideal para automatizar y escalar tu negocio.
            </p>
          </section>

          {/* Pricing Table Component */}
          <PricingTable />

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Features;
