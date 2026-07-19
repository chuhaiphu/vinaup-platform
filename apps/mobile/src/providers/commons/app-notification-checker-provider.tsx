import dayjs from 'dayjs';
import { useGlobalSearchParams } from 'expo-router';
import { useFetchFn } from 'fetchwire';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getExpiringCars } from '@/apis/car/car-apis';
import {
  CarExpiryPopover,
  ExpiringCarContent,
} from '@/components/commons/popovers/car-expiry-popover';
import { CAR_EXPIRY_FIELDS, CAR_EXPIRY_WARNING_DAYS } from '@/constants/car-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { CarResponse } from '@/interfaces/car-interfaces';

const AppNotificationCheckerContext = createContext({});

export function useAppNotificationChecker() {
  return useContext(AppNotificationCheckerContext);
}

function toExpiringCarContents(cars: CarResponse[]): ExpiringCarContent[] {
  const today = dayjs().startOf('day');

  return cars
    .map<ExpiringCarContent | null>((car) => {
      const expiringFields = CAR_EXPIRY_FIELDS.flatMap(({ key, label }) => {
        const expiryDate = car[key];
        if (!expiryDate) return [];

        const diffDays = dayjs(expiryDate).startOf('day').diff(today, 'day');
        if (diffDays > CAR_EXPIRY_WARNING_DAYS) return [];

        const isOverdue = diffDays < 0;

        // ─── Build the human-readable overdue status ──────────────────────────────
        let status: string;
        if (isOverdue) {
          status = `Đã hết hạn ${Math.abs(diffDays)} ngày`;
        } else if (diffDays >= 1) {
          status = `Sắp hết hạn (còn ${diffDays} ngày)`;
        } else {
          // .endOf('expiryDate') shifts the time of the expiry date to the final millisecond.
          // Internal Shape (Simplified Day.js Instance):
          // The value below is for `expiryDateEnd`
          // {
          //   '$d': Tue Jul 07 2026 23:59:59 GMT+0700 (...), // Native JS Date object set to the end of the day
          //   '$y': 2026,  // Year
          //   '$M': 6,     // Month (0-indexed, so 6 is July)
          //   '$D': 7,     // Day of the month
          //   '$H': 23,    // Hour
          //   '$m': 59,    // Minute
          //   '$s': 59,    // Second
          //   '$ms': 999   // Millisecond
          // }
          const expiryDateEnd = dayjs(expiryDate).endOf('day');
          const now = dayjs();
          const hoursLeft = Math.max(0, expiryDateEnd.diff(now, 'hour'));
          const minutesLeft = Math.max(0, expiryDateEnd.diff(now, 'minute') % 60);
          status =
            hoursLeft > 0
              ? `Sắp hết hạn (còn ${hoursLeft} giờ ${minutesLeft} phút)`
              : `Sắp hết hạn (còn ${minutesLeft} phút)`;
        }

        return [{ label, status, isOverdue }];
      });

      return expiringFields.length > 0 ? { car, expiringFields } : null;
    })
    .filter((content) => content !== null);
}

export function AppNotificationCheckerProvider({ children }: { children: React.ReactNode }) {
  const { organizationId } = useGlobalSearchParams<{ organizationId?: string }>();
  const appState = useRef(AppState.currentState);

  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  // The org we've already shown the popover notification for this session (null = none yet).
  // A ref: it's a "done" marker and it resets on cold start so the notification shows once per app launch.
  const notifiedOrgIdRef = useRef<string | null>(null);

  const { data: expiringCars, refreshFetchFn } = useFetchFn(
    () => getExpiringCars(organizationId as string),
    {
      fetchKey: `organization-car-expiring-${organizationId ?? 'none'}`,
      tags: [FETCH_TAG.carExpiringByOrganizationId(organizationId)],
    },
  );

  // Effect 1 — fetch when mount and whenever the viewed organization changes.
  // Only fetches: it never touches popover visibility (that is gated below).
  useEffect(() => {
    if (!organizationId) return;
    refreshFetchFn();
  }, [organizationId, refreshFetchFn]);

  // Effect 2 — re-fetch when the app returns to the foreground from background/inactive.
  // Re-subscribe on organizationId so the closure always uses the latest org.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (organizationId) refreshFetchFn();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [organizationId, refreshFetchFn]);

  // ─── Derived: computed during render, never stored in state ───────────────────
  // No organizationId means no alerts (avoid keeping the previous org's data).
  const expiringCarContents =
    organizationId && expiringCars ? toExpiringCarContents(expiringCars) : [];

  // Effect 3 — auto-open the popover once per org per session.
  useEffect(() => {
    if (!organizationId || expiringCarContents.length === 0) return;
    if (notifiedOrgIdRef.current === organizationId) return;
    notifiedOrgIdRef.current = organizationId;
    setIsPopoverVisible(true);
  }, [organizationId, expiringCarContents.length]);

  return (
    <AppNotificationCheckerContext.Provider value={{}}>
      {children}

      <CarExpiryPopover
        isVisible={expiringCarContents.length > 0 && isPopoverVisible}
        onClose={() => setIsPopoverVisible(false)}
        contents={expiringCarContents}
      />
    </AppNotificationCheckerContext.Provider>
  );
}
