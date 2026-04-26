import { Heart, Smile, Sparkles } from 'lucide-react'

export const story = {
  sisterName: 'Yogi Ka',
  introLabel: 'for my sister',
  introHint: 'best with sound',
  qualities: ['magic', 'warmth', 'laughter', 'home'],
  finaleLine: 'Also yeah… I’m still your favorite sibling 😌',
  signature: 'with all my love',
  /** The answer to the puzzle — what the sender calls the birthday person */
  secretAnswer: 'Mam',
  miniGame: {
    duration: 15,
    highScoreThreshold: 12,
    mediumScoreThreshold: 6,
  },
  reveal: {
    /** Text shown on the wish orb in FinaleScene */
    wishText: 'Close your eyes... make a wish.',
    /** Lines that appear one by one after the affirmation */
    introLines: [
      'Okay…',
      'Now no more games.',
      'I want to show you something.',
    ],
    /** Heartfelt paragraphs shown after the intro lines */
    messageParagraphs: [
      'You’ve always been there for me, in every small and big moment.',
      'I’m really lucky to have you as my akka. 🤍',
    ],
    /** Gallery of floating memories */
    galleryImages: [
      '/assets/pic/c1.jpeg',
      '/assets/pic/s1.jpeg',
      '/assets/pic/s2.jpeg',
      '/assets/pic/s3.jpeg',
      '/assets/pic/s4.jpeg',
      '/assets/pic/s5.jpeg',
      '/assets/pic/s6.jpeg',
      '/assets/pic/g1.jpeg',
      '/assets/pic/g2.jpeg',
      '/assets/pic/g3.jpeg',
      '/assets/pic/g4.jpeg',
      '/assets/pic/g5.jpeg',
      '/assets/pic/g6.jpeg',
    ],
  },
  choicePaths: {
    fun: {
      cards: [
        { id: 'c1', imageUrl: '/assets/pic/s1.jpeg', text: 'The face you make when you think no one’s watching 😌' },
        { id: 'c2', imageUrl: '/assets/pic/s2.jpeg', text: 'Unbothered. Iconic. That’s you.' },
        { id: 'c3', imageUrl: '/assets/pic/s3.jpeg', text: 'And this...is just perfect' },
        { id: 'c4', imageUrl: '/assets/pic/s4.jpeg', text: 'You’re always in your own world — and honestly, fair.' },
        { id: 'c5', imageUrl: '/assets/pic/s5.jpeg', text: 'Just… you. And that’s enough. 🤍' },
      ],
    },
    memories: {
      slides: [
        { caption: "Some moments… we never talk about, but never forget.", icon: <Sparkles className="text-pink-300 w-12 h-12" />, imageUrl: "/assets/pic/g1.jpeg" },
        { caption: "Remember when everything felt lighter?", icon: <Sparkles className="text-pink-300 w-12 h-12" />, imageUrl: "/assets/pic/g2.jpeg" },
        { caption: "We've laughed so hard we couldn't breathe.", icon: <Smile className="text-yellow-300 w-12 h-12" />, imageUrl: "/assets/pic/g3.jpeg" },
        { caption: "Those tiny moments live in me forever.", icon: <Heart className="text-red-400 w-12 h-12" fill="currentColor" />, imageUrl: "/assets/pic/g4.jpeg" },
        { caption: "Yeah... these are just a few.", icon: <Heart className="text-red-400 w-12 h-12" fill="currentColor" />, imageUrl: "/assets/pic/g5.jpeg" },
      ],
    },
    secret: {
      teasers: [
        "There's something hidden here...",
        "Something only you would understand.",
        "Pay attention. Every detail matters. 🤫",
      ],
    },
  },
  audio: {
    wishesUrl: '/assets/metro-proposal.mpeg',
    mainUrl: '/assets/remo.mpeg',
    finaleUrl: '/assets/dheema.mpeg',
    specialUrl: '/assets/akka.mpeg',
    bgmFadeInDuration: 2000,
  },
}

export const sceneAccents = [
  {
    // 0 – IntroScene (Let's begin): deep purple
    glow: 'rgba(180, 80, 255, 0.35)',
    glowSecondary: 'rgba(220, 140, 255, 0.26)',
    border: 'rgba(255, 255, 255, 0.18)',
  },
  {
    // 1 – AdvancedLockScene: midnight violet
    glow: 'rgba(160, 80, 255, 0.30)',
    glowSecondary: 'rgba(200, 100, 255, 0.20)',
    border: 'rgba(255, 255, 255, 0.10)',
  },
  {
    // 2 – CountdownIntroScene: soft pink
    glow: 'rgba(255, 173, 210, 0.35)',
    glowSecondary: 'rgba(117, 201, 255, 0.26)',
    border: 'rgba(255, 255, 255, 0.18)',
  },
  {
    // 1 – ChoiceScene: warm violet / orchid
    glow: 'rgba(200, 120, 255, 0.32)',
    glowSecondary: 'rgba(255, 140, 200, 0.26)',
    border: 'rgba(220, 180, 255, 0.22)',
  },
  {
    // 2 – PuzzleScene: deep neon violet
    glow: 'rgba(150, 80, 255, 0.38)',
    glowSecondary: 'rgba(80, 130, 255, 0.24)',
    border: 'rgba(180, 120, 255, 0.26)',
  },
  {
    // 3 – MiniGameScene: hot rose / coral
    glow: 'rgba(255, 100, 160, 0.32)',
    glowSecondary: 'rgba(255, 170, 210, 0.24)',
    border: 'rgba(255, 160, 200, 0.26)',
  },
  {
    // 4 – FireflyScene (cinematic): deep amber-gold
    glow: 'rgba(255, 220, 100, 0.28)',
    glowSecondary: 'rgba(200, 255, 180, 0.2)',
    border: 'rgba(255, 240, 160, 0.22)',
  },
  {
    // 5 – FinaleScene: champagne pink
    glow: 'rgba(255, 188, 224, 0.34)',
    glowSecondary: 'rgba(126, 233, 255, 0.26)',
    border: 'rgba(255, 255, 255, 0.18)',
  },
] as const
