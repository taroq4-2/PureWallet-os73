import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface Props {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string;
  centerLabel?: string;
}

export function DonutChart({ segments, size = 160, strokeWidth = 22, centerValue, centerLabel }: Props) {
  const radius         = (size - strokeWidth) / 2;
  const circumference  = 2 * Math.PI * radius;
  const center         = size / 2;
  const total          = segments.reduce((s, seg) => s + seg.value, 0);

  let cumulativePct = 0;

  const rings = segments.map((seg, i) => {
    const pct   = total > 0 ? seg.value / total : 0;
    const dash  = circumference * pct;
    const start = cumulativePct * 360 - 90;
    cumulativePct += pct;
    return (
      <G key={i} rotation={start} origin={`${center},${center}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="butt"
        />
      </G>
    );
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="#1E2A3A" strokeWidth={strokeWidth} />
        {rings}
      </Svg>
      <View style={{ alignItems: "center", pointerEvents: "none" }}>
        {centerValue ? (
          <Text style={styles.centerValue}>{centerValue}</Text>
        ) : null}
        {centerLabel ? (
          <Text style={styles.centerLabel}>{centerLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerValue: {
    color: "#F0F6FC",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  centerLabel: {
    color: "#8B949E",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});
