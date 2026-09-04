import { assertNever, type UiState } from "@akaar/core-common";
import React from "react";
import { Text, View } from "react-native";
import { Space } from "../theme/space";
import { AkaarType } from "../theme/type";
import { useAkaarColors } from "../theme/theme";
import { AkaarSecondaryButton } from "./Buttons";
import { Skeleton } from "./Surfaces";

/**
 * Port of android/core/designsystem/.../component/StateHost.kt.
 *
 * Renders any {@link UiState} so every screen gets all six states without
 * reimplementing them. Screens supply the content case and, where the shape
 * of the result is known, a matching skeleton.
 *
 * The `default: assertNever(state)` branch is what makes the Kotlin file's
 * "exhaustive `when`" guarantee carry over: TypeScript refuses to compile
 * this file if `UiState` grows a case this switch doesn't handle.
 */
export function StateHost<T>({
  state,
  onRetry,
  onEmptyAction,
  onRequestPermission,
  onOpenSettings,
  skeleton,
  children,
}: {
  state: UiState<T>;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  onRequestPermission?: () => void;
  onOpenSettings?: () => void;
  skeleton?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  switch (state.kind) {
    case "loading":
      return <>{skeleton ?? <DefaultSkeleton />}</>;

    case "content":
      return <>{children(state.data)}</>;

    case "empty":
      return (
        <Message
          title={state.title}
          body={state.body}
          actionLabel={state.actionLabel}
          onAction={onEmptyAction}
        />
      );

    case "error":
      return (
        <Message
          title={state.message}
          actionLabel={state.retryable !== false && onRetry ? "Try again" : undefined}
          onAction={onRetry}
        />
      );

    // Deliberately distinct from Error: "you are offline" and "this failed"
    // call for different words and a different next step.
    case "offline":
      return (
        <Message
          title="You are offline"
          body={state.safeToContinue ?? "Your work is saved on this phone and will upload when you have signal."}
          actionLabel={onRetry ? "Try again" : undefined}
          onAction={onRetry}
        />
      );

    case "permissionDenied":
      return (
        <Message
          title={state.rationale}
          actionLabel={state.permanentlyDenied ? "Open settings" : "Allow"}
          onAction={state.permanentlyDenied ? onOpenSettings : onRequestPermission}
        />
      );

    default:
      return assertNever(state);
  }
}

function Message({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useAkaarColors();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Space.xl }}>
      <Text style={[AkaarType.section, { color: colors.textPrimary, textAlign: "center" }]}>{title}</Text>
      {body != null ? (
        <Text
          style={[AkaarType.body, { color: colors.textSecondary, textAlign: "center", marginTop: Space.sm }]}
        >
          {body}
        </Text>
      ) : null}
      {actionLabel != null && onAction != null ? (
        <AkaarSecondaryButton text={actionLabel} onPress={onAction} style={{ marginTop: Space.xl }} />
      ) : null}
    </View>
  );
}

function DefaultSkeleton() {
  return (
    <View style={{ width: "100%", padding: Space.gutter, gap: Space.md }}>
      <Skeleton widthFraction={0.6} height={24} />
      <Skeleton />
      <Skeleton widthFraction={0.9} />
      <Skeleton widthFraction={0.4} />
    </View>
  );
}
