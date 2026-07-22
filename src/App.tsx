import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { HomeScreen } from '@/screens/HomeScreen'
import { GradeSelectScreen } from '@/screens/GradeSelectScreen'
import { ModeSelectScreen } from '@/screens/ModeSelectScreen'
import { AdventureMapScreen } from '@/screens/AdventureMapScreen'
import { SubLevelScreen } from '@/screens/SubLevelScreen'
import { WorksheetScreen } from '@/screens/WorksheetScreen'
import { SummerBreakScreen } from '@/screens/SummerBreakScreen'
import { ShopScreen } from '@/screens/ShopScreen'
import { StatsScreen } from '@/screens/StatsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { ChallengesScreen } from '@/screens/ChallengesScreen'
import { PlacementTestScreen } from '@/screens/PlacementTestScreen'
import { ClassworkHelpScreen } from '@/screens/ClassworkHelpScreen'
import { SatStarTestScreen } from '@/screens/SatStarTestScreen'
import { SatStarShopScreen } from '@/screens/SatStarShopScreen'
import { GradeVideosScreen } from '@/screens/GradeVideosScreen'
import { IntroVideoOverlay } from '@/components/IntroVideoOverlay'

export default function App() {
  const screen = useUiStore((s) => s.screen)
  const grade = usePlayerStore((s) => s.grade)

  let content
  if (!grade) {
    // First run — choose a grade before anything else.
    content = <GradeSelectScreen />
  } else {
    switch (screen) {
      case 'grade':
        content = <GradeSelectScreen />
        break
      case 'mode':
        content = <ModeSelectScreen />
        break
      case 'adventure':
        content = <AdventureMapScreen />
        break
      case 'sublevel':
        content = <SubLevelScreen />
        break
      case 'play':
        content = <WorksheetScreen />
        break
      case 'summer':
        content = <SummerBreakScreen />
        break
      case 'shop':
        content = <ShopScreen />
        break
      case 'stats':
        content = <StatsScreen />
        break
      case 'settings':
        content = <SettingsScreen />
        break
      case 'challenges':
        content = <ChallengesScreen />
        break
      case 'placement':
        content = <PlacementTestScreen />
        break
      case 'classwork':
        content = <ClassworkHelpScreen />
        break
      case 'satstar':
        content = <SatStarTestScreen />
        break
      case 'satstarshop':
        content = <SatStarShopScreen />
        break
      case 'gradevideos':
        content = <GradeVideosScreen />
        break
      default:
        content = <HomeScreen />
    }
  }

  return (
    <>
      <div className="h-full overflow-y-auto">{content}</div>
      <IntroVideoOverlay />
    </>
  )
}
