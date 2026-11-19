import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, grain, spacing } from '@/theme';

interface Props extends PropsWithChildren {
  /** Scrollable content (default true). */
  scroll?: boolean;
  /** Screens under a navigator header only need bottom/side insets. */
  edges?: Edge[];
  /** Enables pull-to-refresh (scrollable screens only). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Pinned below the scrolling content, e.g. a checkout bar. */
  footer?: ReactNode;
  /**
   * Tile the grain as explicit 128px images instead of `resizeMode="repeat"`, which on Android (new arch)
   * can draw a single unrepeated patch. Opt-in per screen.
   */
  tiledGrain?: boolean;
}

/** Paper-grain texture tiled over the background colour. */
export function Backdrop({ tiled = false }: { tiled?: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]} pointerEvents="none">
      {tiled ? (
        <GrainTiles />
      ) : (
        <Image source={grain.source} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity: grain.opacity }]} />
      )}
    </View>
  );
}

const GRAIN_TILE = 128; // grain.png is 128×128

/** Covers its parent edge to edge with a grid of grain tiles. */
function GrainTiles() {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const cols = Math.ceil(box.width / GRAIN_TILE);
  const rows = Math.ceil(box.height / GRAIN_TILE);
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.tiles, { opacity: grain.opacity }]}
      onLayout={e => setBox(e.nativeEvent.layout)}>
      {/* Grid is a whole number of tiles wide, so rows wrap on tile edges; the parent clips the overhang. */}
      <View style={[styles.tileGrid, { width: cols * GRAIN_TILE }]}>
        {Array.from({ length: cols * rows }, (_, i) => (
          <Image key={i} source={grain.source} style={styles.tile} />
        ))}
      </View>
    </View>
  );
}

/** Standard page wrapper: textured background + safe area + padding. */
export function Screen({
  children,
  scroll = true,
  edges = ['left', 'right'],
  onRefresh,
  refreshing = false,
  footer,
  tiledGrain = false,
}: Props) {
  return (
    <View style={styles.flex}>
      <Backdrop tiled={tiledGrain} />
      <SafeAreaView edges={edges} style={styles.flex}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                  progressBackgroundColor={colors.surfaceRaised}
                />
              ) : undefined
            }>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content]}>{children}</View>
        )}
        {footer}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { backgroundColor: colors.background },
  tiles: { overflow: 'hidden' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: GRAIN_TILE, height: GRAIN_TILE },
  content: { padding: spacing.screen, gap: spacing.section },
});
