import {
  StyleSheet,
  FlatList,
  Pressable,
  View,
  useColorScheme,
} from "react-native";
import { useRoutes } from "../../hooks/useRoutes";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedCard from "../../components/ThemedCard";
import LiveRouteBadge from "../../components/LiveRouteBadge";

const shortenAddress = (address) => {
  if (!address) return "Nieznany adres";
  const parts = address.split(",").map((part) => part.trim());
  return parts.slice(0, 2).join(", ") || address;
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "";
  }
};

const History = () => {
  const { routes } = useRoutes();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const sortedRoutes = [...routes].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  const renderRoute = ({ item }) => (
    <Pressable
      onPress={() => router.push(`/routes/${item.id}`)}
      style={({ pressed }) => [
        styles.cardWrapper,
        pressed && styles.cardPressed,
      ]}
    >
      <ThemedCard style={styles.routeCard}>
        {}
        <View style={styles.cardHeader}>
          {item.status === "in-progress" ? (
            <LiveRouteBadge status={item.status} size="small" />
          ) : (
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.iconColor}
              />
              <ThemedText style={styles.dateText}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
        </View>

        {}
        <View style={styles.routeContainer}>
          {}
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <ThemedText style={styles.addressText} numberOfLines={1}>
              {shortenAddress(item.startAddress)}
            </ThemedText>
          </View>

          {}
          <View style={styles.lineContainer}>
            <View
              style={[
                styles.verticalLine,
                { backgroundColor: theme.iconColor + "40" },
              ]}
            />
          </View>

          {}
          <View style={styles.addressRow}>
            <View style={[styles.dot, styles.dotEnd]} />
            <ThemedText style={styles.addressText} numberOfLines={1}>
              {item.status === "in-progress"
                ? "W trakcie..."
                : shortenAddress(item.endAddress)}
            </ThemedText>
          </View>
        </View>

        {}
        {item.status !== "in-progress" &&
          (item.distance > 0 || item.duration > 0) && (
            <View style={styles.statsContainer}>
              {item.distance > 0 && (
                <View style={styles.statItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={14}
                    color={Colors.primary}
                  />
                  <ThemedText style={styles.statText}>
                    {item.distance.toFixed(1)} km
                  </ThemedText>
                </View>
              )}
              {item.duration > 0 && (
                <View style={styles.statItem}>
                  <Ionicons
                    name="timer-outline"
                    size={14}
                    color={Colors.primary}
                  />
                  <ThemedText style={styles.statText}>
                    {item.duration} min
                  </ThemedText>
                </View>
              )}
            </View>
          )}
      </ThemedCard>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container} safe={true}>
      {}
      <View style={styles.header}>
        <ThemedText title style={styles.heading}>
          Twoje Trasy
        </ThemedText>
        <View
          style={[
            styles.countBadge,
            { backgroundColor: Colors.primary + "20" },
          ]}
        >
          <ThemedText style={styles.countText}>{routes.length}</ThemedText>
        </View>
      </View>

      {}
      {routes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[styles.emptyIcon, { backgroundColor: theme.uiBackground }]}
          >
            <Ionicons name="map-outline" size={48} color={theme.iconColor} />
          </View>
          <ThemedText style={styles.emptyText}>Brak zapisanych tras</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Rozpocznij pierwszą trasę w zakładce "Utwórz"
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={sortedRoutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderRoute}
        />
      )}
    </ThemedView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  heading: {
    fontWeight: "700",
    fontSize: 22,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  routeCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.6,
  },
  routeContainer: {
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotEnd: {
    backgroundColor: Colors.warning,
  },
  lineContainer: {
    paddingLeft: 4,
    paddingVertical: 2,
  },
  verticalLine: {
    width: 2,
    height: 16,
    marginLeft: 4,
    borderRadius: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
});
