import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useStories } from '../contexts/StoriesContext';
import StoryCard from './StoryCard';

const StoriesListContent = () => {
  const { stories } = useStories();
  const [filter, setFilter] = useState('all');

  const handleStoryPress = (story) => {
    Alert.alert(
      story.title,
      'Cette fonctionnalité arrive bientôt ! 🎉',
      [{ text: 'D\'accord', style: 'default' }]
    );
  };

  const filteredStories = stories.filter(story => {
    if (filter === 'all') return true;
    if (filter === 'new') return story.progress === 0 && !story.completed;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header and Filters */}
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Toutes les Histoires</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterIcon}>🌟</Text>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Toutes
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{stories.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'new' && styles.filterButtonActive]}
            onPress={() => setFilter('new')}
          >
            <Text style={styles.filterIcon}>✨</Text>
            <Text style={[styles.filterText, filter === 'new' && styles.filterTextActive]}>
              Nouvelles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories List */}
      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.cardsWrapper}>
          {filteredStories.map((story) => (
            <View key={story.id} style={styles.cardWrapper}>
              <StoryCard
                story={story}
                onPress={() => handleStoryPress(story)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  header: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#A855F7',
    borderColor: '#9333EA',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 7,
    marginLeft: 5,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    width: '23%',
    marginBottom: 4,
  },
});

export default StoriesListContent;
