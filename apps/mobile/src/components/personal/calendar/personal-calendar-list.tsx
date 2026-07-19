import { StyleSheet, View } from 'react-native';

import { ProjectCalendar } from './project-calendar';
import { WageCalendar } from './wage-calendar';

export interface PersonalCalendarListProps {
  calendarMode: 'wage' | 'project';
  dayMode: 'busy' | 'free';
  year: number;
}

export function PersonalCalendarList({ calendarMode, dayMode, year }: PersonalCalendarListProps) {
  return (
    <View style={styles.container}>
      {calendarMode === 'wage' ? (
        <WageCalendar year={year} dayMode={dayMode} />
      ) : (
        <ProjectCalendar year={year} dayMode={dayMode} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
