# Fixing All Admin Panel Tabs

## Issues to Fix:
1. SongRequestsManager - theme references causing blank screen
2. ContentCalendar - visibility issues
3. FinancialDashboard - visibility issues
4. GoalsTracker - visibility issues
5. All components need black theme
6. Mobile animations needed

## Strategy:
- Remove all `theme === 'dark'` conditionals
- Use direct purple/black theme classes
- Ensure all text is white/purple-300
- Fix any errors causing blank screens





