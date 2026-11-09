'use client';

/**
 * Primitivas de animação com `motion/react` inspiradas diretamente nas landings
 * `batidaemmovimento` e `organizador-esportes-agenciasisters`.
 *
 * Competências TypeScript aplicadas:
 * - Tupla readonly `CubicBezierTuple = readonly [number, number, number, number]`
 * - Interseção de props com `HTMLMotionProps<'div'>` e operador rest (`...rest`)
 */

import React from 'react';
import {
  motion,
  useScroll,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

export type CubicBezierTuple = readonly [number, number, number, number];

export const EASE: CubicBezierTuple = [0.22, 1, 0.36, 1] as const;

export const SUBIR: Variants = {
  oculto: { opacity: 0, y: 32 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: EASE },
  },
};

export const ESTOURAR: Variants = {
  oculto: { opacity: 0, scale: 0.9 },
  visivel: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 250, damping: 22 },
  },
};

const grupoVariants: Variants = {
  oculto: {},
  visivel: (intervalo = 0.09) => ({
    transition: { staggerChildren: intervalo },
  }),
};

export interface RevelarProps extends HTMLMotionProps<'div'> {
  readonly children: React.ReactNode;
  readonly atraso?: number;
  readonly y?: number;
}

export function Revelar({
  children,
  atraso = 0,
  y = 26,
  className,
  ...rest
}: RevelarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: EASE, delay: atraso }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface GrupoProps {
  readonly children: React.ReactNode;
  readonly intervalo?: number;
  readonly className?: string;
}

export function Grupo({
  children,
  intervalo = 0.09,
  className,
}: GrupoProps) {
  return (
    <motion.div
      variants={grupoVariants}
      custom={intervalo}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children,
  className,
  variants = SUBIR,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variants?: Variants;
}) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

export function BarraProgresso() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #185054 0%, #0df0b2 65%, #004fff 100%)',
      }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left pointer-events-none"
    />
  );
}
