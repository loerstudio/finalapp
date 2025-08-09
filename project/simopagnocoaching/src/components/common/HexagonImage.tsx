import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HexagonImageProps {
  width: number;
  height: number;
  imageSource: any;
  backgroundColor?: string;
}

const HexagonImage: React.FC<HexagonImageProps> = ({
  width,
  height,
  imageSource,
  backgroundColor = '#333',
}) => {
  // Calculate points for hexagon
  const points = [
    `${width / 2},0`,
    `${width},${height * 0.25}`,
    `${width},${height * 0.75}`,
    `${width / 2},${height}`,
    `0,${height * 0.75}`,
    `0,${height * 0.25}`,
  ].join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path
          d={`M ${points} Z`}
          fill={backgroundColor}
        />
      </Svg>
      <Image
        source={imageSource}
        style={[
          StyleSheet.absoluteFill,
          styles.image,
          { width, height },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    opacity: 0.7,
  },
});

export default HexagonImage; 