"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import contentData from "../data/content.json";
import type { ProductItem } from "../content/site";

export type ClothItem = ProductItem;

export const fluidSpring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
  mass: 1.1,
};

interface WardrobeItemProps {
  item: ClothItem;
  isActive: boolean;
  isLifted: boolean;
  onHover: () => void;
  onHoverLeave: () => void;
  onClick: () => void;
}

function WardrobeItem({ item, isActive, isLifted, onHover, onHoverLeave, onClick }: WardrobeItemProps) {
  return (
    <motion.div
      onMouseEnter={onHover}
      onMouseLeave={onHoverLeave}
      onClick={onClick}
      initial={false}
      animate={{ width: isActive ? 265 : 72 }}
      transition={fluidSpring}
      className="relative flex flex-col items-center cursor-pointer origin-top select-none shrink-0"
    >
      <motion.div
        animate={{ y: isLifted ? -24 : 0 }}
        transition={fluidSpring}
        className="relative w-full h-[350px] flex justify-center items-start"
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.9,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 flex justify-center pointer-events-none"
        >
          <img
            src={item.front_img}
            alt={item.name}
            className="h-[340px] w-auto max-w-none object-contain drop-shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 0 : 1,
            scale: isActive ? 0.9 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute top-0 flex justify-center pointer-events-none"
        >
          <img
            src={item.side_img || item.front_img}
            alt={item.name}
            className="h-[340px] w-auto max-w-none object-contain drop-shadow-md"
          />
        </motion.div>

        <div
          className={`absolute top-12 z-20 flex items-center pointer-events-none transition-all duration-300 ${
            isActive ? "right-2 opacity-100" : "-right-2 opacity-90"
          }`}
        >
          <span className="w-2 h-[1px] bg-brand-muted/60" />
          <span className="px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink bg-white/95 border border-brand-lilac rounded shadow-xs whitespace-nowrap">
            {item.tag_price || item.price}
          </span>
        </div>
      </motion.div>

      <span
        className={`mt-6 text-[11px] font-mono transition-colors duration-300 ${
          isActive ? "text-brand-ink font-bold" : "text-brand-muted"
        }`}
      >
        {item.number}
      </span>
    </motion.div>
  );
}

interface WardrobeRackProps {
  items?: ClothItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onInspect?: (item: ClothItem) => void;
}

const DEFAULT_RACK_ITEMS: ClothItem[] = contentData.products.filter(
  (product) => product.on_rack !== false,
);

export default function WardrobeRack({
  items = DEFAULT_RACK_ITEMS,
  activeId: controlledActiveId,
  onSelect,
  onInspect,
}: WardrobeRackProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>("9");
  const [isLifted, setIsLifted] = useState<boolean>(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeId = controlledActiveId ?? internalActiveId;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleHover = (id: string) => {
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      if (id !== activeId) {
        setInternalActiveId(id);
        setIsLifted(false);
        onSelect?.(id);
      }
    }, 50);
  };

  const handleHoverLeave = () => {
    clearHoverTimer();
  };

  const handleClick = (item: ClothItem) => {
    clearHoverTimer();
    setInternalActiveId(item.id);
    setIsLifted(true);
    onSelect?.(item.id);
    onInspect?.(item);
  };

  return (
    <div
      onMouseLeave={handleHoverLeave}
      className="relative w-full overflow-x-auto bg-brand-bg py-16 px-8 select-none"
    >
      <div className="w-full h-[6px] bg-gradient-to-b from-[#C7B299] to-[#A68E74] rounded-full shadow-sm" />

      <div className="flex items-start gap-4 -mt-[6px] min-w-max px-4">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <WardrobeItem
              key={item.id}
              item={item}
              isActive={isActive}
              isLifted={isActive && isLifted}
              onHover={() => handleHover(item.id)}
              onHoverLeave={handleHoverLeave}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
