"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: "tab";
}

interface Separator {
  type: "separator";
}

interface Component {
  title: string;
  component: React.ComponentType<any>;
  type: "component";
}

type TabItem = Tab | Separator | Component;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  useOnClickOutside(outsideClickRef, (e) => {
    // Don't close if clicking on options panels
    const target = e.target as HTMLElement;
    if (target.closest('.glass-panel') && !target.closest('[data-expandable-tabs]')) {
      return;
    }
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    // Keep tool panels open when selecting tools
    if (index !== selected) {
      setSelected(index);
    }
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      data-expandable-tabs
      className={cn(
        "flex flex-wrap items-center gap-2 glass-panel p-1",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        if (tab.type === "component") {
          const Component = tab.component;
          return (
            <motion.div 
              key={index} 
              className="flex items-center justify-center p-1"
              layout
            >
              <Component className="w-8 h-6" />
            </motion.div>
          );
        }

        const Icon = tab.icon!;
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              selected === index
                ? cn("bg-muted", activeColor)
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  {tab.title!}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}