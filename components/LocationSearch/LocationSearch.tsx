import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useDebounce } from '@/hooks/useDebounce';
import theme from '@/constants/theme';

interface Location {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onLocationSelect: (location: Location) => void;
  onInputChange: (text: string) => void;
  inputRef?: React.RefObject<TextInput>;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder,
  value,
  onLocationSelect,
  onInputChange,
  inputRef,
}) => {
  const [predictions, setPredictions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedValue = useDebounce(value, 300);

  const searchPlaces = useCallback(async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          input
        )}&countrycodes=np&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'YaGoo Ride-Sharing App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data: Location[] = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error('Nominatim API Error:', err);
      setError('Unable to fetch locations. Please try again.');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedValue) {
      searchPlaces(debouncedValue);
    } else {
      setPredictions([]);
    }
  }, [debouncedValue, searchPlaces]);

  const formatAddress = (location: Location): { main: string; secondary: string } => {
    const address = location.address;
    const main = address.road || address.suburb || '';
    const secondary = [
      address.city,
      address.state,
      address.country
    ].filter(Boolean).join(', ');

    return { main, secondary };
  };

  const handleSelectLocation = (location: Location) => {
    onLocationSelect(location);
    setPredictions([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onInputChange}
          placeholderTextColor={theme.COLORS.textSecondary}
        />
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.COLORS.primary}
            style={styles.icon}
          />
        ) : value ? (
          <TouchableOpacity
            onPress={() => {
              onInputChange('');
              setPredictions([]);
            }}
            style={styles.icon}
          >
            <Ionicons name="close-circle" size={20} color={theme.COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 40 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}

      {predictions.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.predictionsContainer}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.predictionsScroll}
          >
            {predictions.map((location) => {
              const { main, secondary } = formatAddress(location);
              return (
                <TouchableOpacity
                  key={location.place_id}
                  style={styles.predictionItem}
                  onPress={() => handleSelectLocation(location)}
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={theme.COLORS.primary}
                    style={styles.locationIcon}
                  />
                  <View style={styles.predictionTexts}>
                    <Text style={styles.mainText}>{main}</Text>
                    <Text style={styles.secondaryText}>{secondary}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.small,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: theme.SPACING.lg,
    color: theme.COLORS.text,
    fontSize: theme.FONTS.sizes.md,
    ...theme.FONTS.regular,
  },
  icon: {
    padding: theme.SPACING.sm,
    marginRight: theme.SPACING.sm,
  },
  predictionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    zIndex: 1000,
    elevation: 5,
    ...theme.SHADOWS.medium,
  },
  predictionsScroll: {
    maxHeight: 200,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.border,
  },
  locationIcon: {
    marginRight: theme.SPACING.md,
  },
  predictionTexts: {
    flex: 1,
  },
  mainText: {
    color: theme.COLORS.text,
    fontSize: theme.FONTS.sizes.md,
    ...theme.FONTS.medium,
  },
  secondaryText: {
    color: theme.COLORS.textSecondary,
    fontSize: theme.FONTS.sizes.sm,
    ...theme.FONTS.regular,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: theme.COLORS.error,
    padding: theme.SPACING.sm,
    marginTop: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.md,
  },
  errorText: {
    color: theme.COLORS.white,
    fontSize: theme.FONTS.sizes.sm,
    ...theme.FONTS.medium,
    textAlign: 'center',
  },
}); 