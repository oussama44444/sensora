import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStories } from '../contexts/StoriesContext';
import { useUser } from '../contexts/userContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales';
import StoryCard from './StoryCard';
import PremiumModal from './PremiumModal';
import StoryDetailsModal from './StoryDetailsModal';

const StoriesListContent = () => {
  const navigation = useNavigation();
  const { stories, refreshStories, page, totalPages, nextPage, prevPage } = useStories();
  const { user, logout, token, getProfileAllData } = useUser();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [filter, setFilter] = useState('all');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Use stories from backend (includes both free and premium)
  const allStories = useMemo(() => stories, [stories]);

  // Enhance stories with hardcoded details
  const enhanceStoryWithDetails = (story) => ({
    ...story,
    points: story.points || 15,
    duration: story.duration || '5-10',
    ageRange: story.ageRange || '6-12',
    difficulty: story.difficulty || (language === 'tn' ? 'ساهل' : 'facile'),
    objectives: story.objectives || (language === 'tn' 
      ? 'هذي الحكاية باش تعلّم الطفل مهارات التواصل و الفهم الاجتماعي من خلال مواقف حياتية ممتعة.'
      : 'Cette histoire aide votre enfant à développer des compétences de communication et de compréhension sociale à travers des situations amusantes de la vie quotidienne.'),
  });


  const handleStoryPress = (story) => {
    // If story is premium, prevent non-premium users from opening it
    if (story?.isPremium && !(user && user.isPremium)) {
      const title = language === 'fr' ? 'Contenu premium' : 'محتوى متميّز';
      const message = language === 'fr'
        ? "Cette histoire est réservée aux utilisateurs premium. Voulez-vous mettre à niveau ?"
        : 'هالحكاية للمشتركين المتميّزين فقط. تحب تطوّر اشتراكك؟';
      Alert.alert(
        title,
        message,
        [
          { text: language === 'fr' ? 'Annuler' : 'إلغاء', style: 'cancel' },
          { text: language === 'fr' ? 'Mettre à niveau' : 'طوّر الاشتراك', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    // navigate directly with the story id to avoid passing large objects
    navigation.navigate('StoryPlayer', { storyId: story?.id || story?._id });
  };

  const handleStartStory = () => {
    setIsModalVisible(false);
    navigation.navigate('StoryPlayer', { storyId: selectedStory?.id });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStory(null);
  };

  const handleSubscribePress = () => {
    setShowPremiumModal(false);
    // Navigate to subscription screen
    navigation.navigate('Subscription');
  };

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const filteredStories = allStories.filter(story => {
    if (filter === 'all') return true;
    if (filter === 'new') {
      if (!story.createdAt) return false;
      const created = new Date(story.createdAt).getTime();
      return (now - created) <= thirtyDaysMs;
    }
    if (filter === 'premium') return !!story.isPremium;
    if (filter === 'free') return !story.isPremium;
    return true;
  });

  const premiumStoriesCount = allStories.filter(s => !!s.isPremium).length;
  const freeStoriesCount = allStories.filter(s => !s.isPremium).length;
  const newStoriesCount = allStories.filter(s => {
    if (!s.createdAt) return false;
    const created = new Date(s.createdAt).getTime();
    return (now - created) <= thirtyDaysMs;
  }).length;

  return (
    <View style={styles.container}>
      {/* Header and Filters */}
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 {t.stories.title}</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterIcon}>🌟</Text>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              {t.stories.all}
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{allStories.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'free' && styles.filterButtonActive]}
            onPress={() => setFilter('free')}
          >
            <Text style={styles.filterIcon}>🆓</Text>
            <Text style={[styles.filterText, filter === 'free' && styles.filterTextActive]}>
              {t.stories.free}
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{freeStoriesCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'new' && styles.filterButtonActive]}
            onPress={() => setFilter('new')}
          >
            <Text style={styles.filterIcon}>✨</Text>
            <Text style={[styles.filterText, filter === 'new' && styles.filterTextActive]}>
              {t.stories.new}
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{newStoriesCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'premium' && styles.filterButtonActive]}
            onPress={() => setFilter('premium')}
          >
            <Text style={styles.filterIcon}>👑</Text>
            <Text style={[styles.filterText, filter === 'premium' && styles.filterTextActive]}>
              {t.stories.premium}
            </Text>
            <View style={[styles.filterBadge, filter === 'premium' && styles.filterBadgePremium]}>
              <Text style={styles.filterBadgeText}>{premiumStoriesCount}</Text>
            </View>
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
                isLocked={story.isPremium && !(user && user.isPremium)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination controls */}
      <View style={styles.paginationRow}>
        <TouchableOpacity onPress={prevPage} style={styles.pageButton} disabled={page <= 1}>
          <Text style={{ opacity: page <= 1 ? 0.4 : 1 }}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
        <TouchableOpacity onPress={nextPage} style={styles.pageButton} disabled={page >= totalPages}>
          <Text style={{ opacity: page >= totalPages ? 0.4 : 1 }}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => refreshStories(page)} style={styles.pageButton}>
          <Text>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribePress}
      />

      {/* Story Details Modal 
      <StoryDetailsModal
        visible={isModalVisible}
        story={selectedStory}
        onClose={handleCloseModal}
        onStart={handleStartStory}
      />
      */}
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
  filterBadgePremium: {
    backgroundColor: '#FFD700',
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
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  pageButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
});

export default StoriesListContent;
