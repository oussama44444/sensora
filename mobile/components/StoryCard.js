import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const StoryCard = ({ story, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* TODO: BACKEND INTEGRATION - Replace with actual image */}
        <ImageBackground
          source={{ uri: story.imageUrl || 'https://via.placeholder.com/400x300' }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <View style={styles.overlay} />
          
          {story.difficulty && (
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: story.difficulty === 'difficile' ? '#EF4444' : story.difficulty === 'moyen' ? '#F59E0B' : '#10B981' }
            ]}>
              <Text style={styles.difficultyText}>{story.difficulty}</Text>
            </View>
          )}
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>{story.emoji}</Text>
            <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {story.description}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.category}>{story.category}</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>{story.points} pts</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  imageBackground: {
    width: '100%',
    height: 110,
    justifyContent: 'flex-end',
  },
  image: {
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  category: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  pointsContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});

export default StoryCard;
