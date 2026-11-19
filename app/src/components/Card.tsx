import { useId, type PropsWithChildren } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, grain, heroSurface, radius, shadow, spacing } from '@/theme';

export type CardVariant = 'default' | 'hero' | 'quiet';

interface Props extends PropsWithChildren {
  /**
   * default = flat surface panel · hero = the one card that matters most on a screen (accent) ·
   * quiet = outline only, for secondary info.
   */
  variant?: CardVariant;
  /** Hero only. `flat` = plain accent fill (no tonal gradient or soft highlight); grain and top edge stay. */
  fill?: 'gradient' | 'flat';
  style?: StyleProp<ViewStyle>;
}

/** The only card in the app: one border, one radius, one padding per variant. */
export function Card({ variant = 'default', fill = 'gradient', style, children }: Props) {
  if (variant !== 'hero') {
    return <View style={[styles.base, styles[variant], style]}>{children}</View>;
  }
  // Hero: the glow sits on the outer view; the inner view clips the fill layers to the radius.
  return (
    <View style={[styles.heroOuter, style]}>
      <View style={[styles.base, styles.hero]}>
        <HeroFill flat={fill === 'flat'} />
        {children}
      </View>
    </View>
  );
}

/** Tonal gradient + soft top-left highlight + 1px top edge highlight + faint grain. */
function HeroFill({ flat }: { flat: boolean }) {
  const id = useId().replace(/:/g, '');
  // CSS-style angle → gradient vector in the unit box (0° points up, clockwise).
  const a = (heroSurface.angleDeg * Math.PI) / 180;
  const dx = Math.sin(a) / 2;
  const dy = -Math.cos(a) / 2;
  const [c1, c2, c3] = heroSurface.gradient;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flat ? null : (
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`g${id}`} x1={0.5 - dx} y1={0.5 - dy} x2={0.5 + dx} y2={0.5 + dy}>
              <Stop offset={0} stopColor={c1} />
              <Stop offset={0.5} stopColor={c2} />
              <Stop offset={1} stopColor={c3} />
            </LinearGradient>
            <RadialGradient id={`h${id}`} cx={0.12} cy={0} r={0.75} fx={0.12} fy={0}>
              <Stop offset={0} stopColor={colors.white} stopOpacity={heroSurface.highlightOpacity} />
              <Stop offset={1} stopColor={colors.white} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#g${id})`} />
          <Rect width="100%" height="100%" fill={`url(#h${id})`} />
        </Svg>
      )}
      <Image
        source={grain.source}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity: heroSurface.noiseOpacity }]}
      />
      <View style={styles.topEdge} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.card,
    gap: spacing.inCard,
  },
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  quiet: { backgroundColor: 'transparent', borderColor: colors.border },
  heroOuter: { borderRadius: radius.lg, ...shadow.heroGlow },
  hero: {
    overflow: 'hidden',
    borderColor: colors.borderStrong,
    backgroundColor: colors.primary, // the flat fill; with `fill="gradient"` it shows only until the gradient draws
    padding: spacing.cardHero,
    gap: spacing.inCardHero,
  },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.highlight },
});
