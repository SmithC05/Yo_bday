import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { useState } from 'react'
// import { AudioToggle } from './components/AudioToggle'
// import { ProgressDots } from './components/ProgressDots'
import { sceneAccents, story } from './data/story'
import { useBirthdayAudio } from './hooks/useBirthdayAudio'
import { ChoiceScene } from './scenes/ChoiceScene'
import { FinaleScene } from './scenes/FinaleScene'
import { FireflyScene } from './scenes/FireflyScene'
import { CountdownIntroScene } from './scenes/CountdownIntroScene'
import { AdvancedLockScene } from './scenes/AdvancedLockScene'
import { IntroScene } from './scenes/IntroScene'
import { MiniGameScene } from './scenes/MiniGameScene'
import { PuzzleScene } from './scenes/PuzzleScene'

// 0  IntroScene    (Let's begin)
// 1  AdvancedLockScene (Countdown to unlock)
// 2  CountdownIntroScene (3..2..1 date reveal)
// 3  ChoiceScene   (with Choice-Based Micro Experience inside)
// 4  PuzzleScene
// 5  MiniGameScene
// 6  FireflyScene  (cinematic transition — auto-advances after ~8 s)
// 7  FinaleScene   (wish → affirmation → lines → message → HBD → surprise)
const TOTAL_SCENES = 8

function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const audio = useBirthdayAudio(story.audio)

  const sceneAccent = sceneAccents[sceneIndex]

  const goToScene = (nextIndex: number) => {
    setDirection(nextIndex >= sceneIndex ? 1 : -1)
    setSceneIndex(nextIndex)
  }

  const nextScene = () => {
    audio.playTransition()
    
    const nextIdx = Math.min(sceneIndex + 1, TOTAL_SCENES - 1)
    
    // Switch to main track when leaving AdvancedLockScene (counter reset or bypass)
    if (sceneIndex === 1) {
      audio.playMainBgm()
    }
    
    // Finale track will be triggered by the FinaleScene itself
    // if (nextIdx === 7) {
    //   audio.playFinaleBgm()
    // }

    setDirection(1)
    setSceneIndex(nextIdx)
  }

  const unlockAudio = async () => {
    await audio.unlock()
  }

  const beginStory = () => {
    void unlockAudio().then(() => {
      audio.playWishesBgm()
    })
    goToScene(1)
  }

  const handleCountdownComplete = () => {
    audio.playPulse()
    goToScene(3)
  }

  const replayStory = () => {
    audio.playPulse()
    goToScene(0)
  }

  // Default = FinaleScene (highest index)
  let scene = (
    <FinaleScene
      key="finale"
      direction={direction}
      glow={sceneAccents[7].glow}
      glowSecondary={sceneAccents[7].glowSecondary}
      border={sceneAccents[7].border}
      sisterName={story.sisterName}
      finaleLine={story.finaleLine}
      signature={story.signature}
      qualities={story.qualities}
      wishText={story.reveal.wishText}
      introLines={story.reveal.introLines}
      messageParagraphs={story.reveal.messageParagraphs}
      galleryImages={story.reveal.galleryImages}
      onReplay={replayStory}
      onFinale={audio.playFinale}
      onTriggerFinaleBgm={audio.playFinaleBgm}
      onTriggerSpecialBgm={audio.playSpecialBgm}
    />
  )

  if (sceneIndex === 0) {
    scene = (
      <IntroScene
        key="intro"
        onStart={beginStory}
      />
    )
  } else if (sceneIndex === 1) {
    scene = (
      <AdvancedLockScene
        key="advanced-lock"
        onNext={nextScene}
      />
    )
  } else if (sceneIndex === 2) {
    scene = (
      <CountdownIntroScene
        key="countdown-intro"
        onUnlockAudio={() => {}} // Audio is already unlocked in IntroScene
        onComplete={handleCountdownComplete}
      />
    )
  } else if (sceneIndex === 3) {
    scene = (
      <ChoiceScene
        key="choice"
        direction={direction}
        glow={sceneAccents[3].glow}
        glowSecondary={sceneAccents[3].glowSecondary}
        border={sceneAccents[3].border}
        pathContent={story.choicePaths}
        onNext={nextScene}
      />
    )
  } else if (sceneIndex === 4) {
    scene = (
      <PuzzleScene
        key="puzzle"
        direction={direction}
        glow={sceneAccents[4].glow}
        glowSecondary={sceneAccents[4].glowSecondary}
        border={sceneAccents[4].border}
        secretAnswer={story.secretAnswer}
        onNext={nextScene}
        onUnlock={audio.playUnlock}
      />
    )
  } else if (sceneIndex === 5) {
    scene = (
      <MiniGameScene
        key="minigame"
        direction={direction}
        glow={sceneAccents[5].glow}
        glowSecondary={sceneAccents[5].glowSecondary}
        border={sceneAccents[5].border}
        gameDuration={story.miniGame.duration}
        highScoreThreshold={story.miniGame.highScoreThreshold}
        mediumScoreThreshold={story.miniGame.mediumScoreThreshold}
        onNext={nextScene}
        onHeartPop={audio.playHeartPop}
        onHighScore={audio.playHighScore}
      />
    )
  } else if (sceneIndex === 6) {
    scene = (
      <FireflyScene
        key="firefly"
        direction={direction}
        glow={sceneAccents[6].glow}
        glowSecondary={sceneAccents[6].glowSecondary}
        border={sceneAccents[6].border}
        onNext={nextScene}
      />
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative h-dvh overflow-hidden bg-[#04050d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(220,120,200,0.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(100,120,255,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,140,190,0.08),transparent_40%),linear-gradient(180deg,#060814_0%,#0e0b24_42%,#0d1330_72%,#070610_100%)]" />
        <div
          className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full blur-3xl transition duration-700"
          style={{ background: sceneAccent.glow }}
        />

        {/* HUD removed as per request */}
        <AnimatePresence initial={false} mode="wait">
          {scene}
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}

export default App
