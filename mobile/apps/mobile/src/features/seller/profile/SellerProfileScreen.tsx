import {
  AkaarCard,
  AkaarSecondaryButton,
  AkaarTextButton,
  AkaarType,
  Avatar,
  Badge,
  HeritagePattern,
  InfoRow,
  ScreenScaffold,
  Space,
  StateHost,
  type UiState,
  useAkaarColors,
} from "@akaar/design-system";
import type { ArtisanProfile, Capability } from "@akaar/core-domain";
import { craftName, type Craft } from "@akaar/core-domain";
import React, { useRef } from "react";
import { AccessibilityInfo, Animated, Text, useWindowDimensions, View } from "react-native";
import {
  capacitySummary,
  deliverableInDays,
  missingFromProfile,
  profileHeader,
} from "./profileViewModel.ts";

export interface SellerProfileData {
  profile: ArtisanProfile;
  capability: Capability | null;
  craft: Craft | null;
  productCount: number;
}

/**
 * The seller's own profile.
 *
 * Screen inventory (docs/05-delivery/screen-inventory.md, Profile group):
 * name, region, craft, capacity, cluster link, view/edit.
 *
 * Structure follows design-system.md rather than a generic profile layout:
 * the identity block sits on an indigo ground with the block-print motif
 * over it, and everything below is sectioned content on the cotton surface
 * with hairline separators - because "not every section should look like a
 * card". The only cards are the two genuinely tappable objects at the
 * bottom.
 */
export function SellerProfileScreen({
  state,
  lang = "hi",
  onEdit,
  onOpenProducts,
  onOpenCluster,
  onRetry,
}: {
  state: UiState<SellerProfileData>;
  lang?: string;
  onEdit: () => void;
  onOpenProducts: () => void;
  onOpenCluster: () => void;
  onRetry?: () => void;
}) {
  return (
    <ScreenScaffold>
      <StateHost state={state} onRetry={onRetry}>
        {(data) => <ProfileContent data={data} lang={lang} onEdit={onEdit} onOpenProducts={onOpenProducts} onOpenCluster={onOpenCluster} />}
      </StateHost>
    </ScreenScaffold>
  );
}

function ProfileContent({
  data,
  lang,
  onEdit,
  onOpenProducts,
  onOpenCluster,
}: {
  data: SellerProfileData;
  lang: string;
  onEdit: () => void;
  onOpenProducts: () => void;
  onOpenCluster: () => void;
}) {
  const colors = useAkaarColors();
  const { width } = useWindowDimensions();
  const header = profileHeader(data.profile);
  const capacity = capacitySummary(data.capability);
  const missing = missingFromProfile(data.profile, data.capability);

  // Smooth scrolling: the identity block fades and lifts slightly as the
  // content moves up, so the eye is carried rather than cut. Driven on the
  // native thread, so it stays smooth on a 3 GB phone even while the list
  // below is laying out.
  const scrollY = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  const headerOpacity = reduceMotion
    ? 1
    : scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0], extrapolate: "clamp" });
  const headerLift = reduceMotion
    ? 0
    : scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, -24], extrapolate: "clamp" });

  const story = data.profile.story?.[lang === "hi" ? "hi" : "en"] ?? data.profile.story?.hi;

  return (
    <Animated.ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: Space.xxxl }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      {/* ---- Identity block: indigo ground, motif over it ---- */}
      <View style={{ backgroundColor: colors.primary, paddingBottom: Space.xxl }}>
        <HeritagePattern
          width={width}
          height={260}
          color={colors.onPrimary}
          // Much quieter over indigo than over cotton: the same ink reads
          // far louder against a dark ground.
          opacity={0.14}
          spacing={48}
        />
        <Animated.View
          style={{
            paddingHorizontal: Space.gutterSeller,
            paddingTop: Space.xxl,
            alignItems: "center",
            opacity: headerOpacity,
            transform: [{ translateY: headerLift }],
          }}
        >
          <Avatar name={header.displayName} size={96} ringColor={colors.primary} />
          <Text
            style={[AkaarType.display, { color: colors.onPrimary, marginTop: Space.md, textAlign: "center" }]}
          >
            {header.displayName}
          </Text>
          <Text style={[AkaarType.bodyLarge, { color: colors.onPrimary, opacity: 0.9, marginTop: Space.xs }]}>
            {data.craft != null ? craftName(data.craft, lang) : "Craft not chosen yet"}
          </Text>
          <Text style={[AkaarType.body, { color: colors.onPrimary, opacity: 0.75, marginTop: 2 }]}>
            {header.region}
          </Text>
        </Animated.View>
      </View>

      {/* ---- Verification: the one accent use on this screen ---- */}
      <View
        style={{
          paddingHorizontal: Space.gutterSeller,
          paddingVertical: Space.lg,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Badge label={header.verification.label} tone={header.verification.tone} />
        <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.sm }]}>
          {header.verification.meaning}
        </Text>
      </View>

      {/* ---- What is still missing, if anything ---- */}
      {missing.length > 0 ? (
        <View
          style={{
            paddingHorizontal: Space.gutterSeller,
            paddingVertical: Space.lg,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={[AkaarType.section, { color: colors.textPrimary }]}>
            {missing.length === 1 ? "One thing left" : `${missing.length} things left`}
          </Text>
          <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.xs }]}>
            {missing.join(", ")}
          </Text>
          <AkaarSecondaryButton
            text="Fill these in"
            onPress={onEdit}
            sellerFlow
            style={{ marginTop: Space.md }}
          />
        </View>
      ) : null}

      <Section title="Aapka kaam · Your work">
        <InfoRow label="Craft" value={data.craft != null ? craftName(data.craft, lang) : "Not chosen yet"} />
        <InfoRow
          label="How many, how fast"
          value={capacity.headline}
          hint={capacity.detail}
        />
        <InfoRow label="If a buyer needs 30 days" value={deliverableInDays(data.capability, 30)} last />
      </Section>

      <Section title="Aap ke baare mein · About you">
        <InfoRow label="Where you work" value={header.region} />
        <InfoRow label="Languages" value={header.languages} />
        {header.experience != null ? <InfoRow label="Experience" value={header.experience} /> : null}
        <InfoRow
          label="Your story"
          value={story != null && story.length > 0 ? story : "Not added yet"}
          hint={story == null ? "Buyers read this. You can speak it instead of typing." : undefined}
          last
        />
      </Section>

      {/* ---- Cards, for the two things that are genuinely tappable ---- */}
      <View style={{ paddingHorizontal: Space.gutterSeller, paddingTop: Space.xl, gap: Space.md }}>
        <AkaarCard onPress={onOpenProducts}>
          <Text style={[AkaarType.section, { color: colors.textPrimary }]}>Your products</Text>
          <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.xs }]}>
            {data.productCount === 0
              ? "Nothing listed yet"
              : data.productCount === 1
                ? "1 product listed"
                : `${data.productCount} products listed`}
          </Text>
        </AkaarCard>

        <AkaarCard onPress={onOpenCluster}>
          <Text style={[AkaarType.section, { color: colors.textPrimary }]}>Your cooperative</Text>
          <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.xs }]}>
            {data.profile.clusterId != null ? "Linked" : "Not linked yet"}
          </Text>
        </AkaarCard>
      </View>

      <View style={{ paddingHorizontal: Space.gutterSeller, paddingTop: Space.xl }}>
        <AkaarSecondaryButton text="Edit profile" onPress={onEdit} sellerFlow />
        <AkaarTextButton text="Listen to this page" onPress={() => undefined} style={{ marginTop: Space.sm }} />
      </View>
    </Animated.ScrollView>
  );
}

/** A titled block of hairline-separated rows, sitting directly on the surface. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useAkaarColors();
  return (
    <View style={{ backgroundColor: colors.surface, paddingHorizontal: Space.gutterSeller }}>
      <Text
        style={[AkaarType.section, { color: colors.textPrimary, paddingTop: Space.xl, paddingBottom: Space.xs }]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * design-system.md: "Honour 'reduce motion' - all transitions become
 * instant fades." A collapsing header is exactly the kind of motion that
 * setting exists for.
 */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (alive) setReduce(enabled);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
