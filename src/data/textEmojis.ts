import type { CategoryId, Emoji } from '../types'

/**
 * Text emojis: these copy as REAL TEXT, so they paste inline like normal keyboard emojis
 * (in bios, captions, usernames, any chat).
 */
type T = [text: string, name: string, tags: string]

const KAOMOJI: T[] = [
  ['૮ ˶ᵔ ᵕ ᵔ˶ ა', 'Happy Puppy', 'happy cute puppy smile'],
  ['₍ᐢ. .ᐢ₎', 'Shy Bunny', 'bunny shy cute'],
  ['ʕ•ᴥ•ʔ', 'Lil Bear', 'bear cute'],
  ['ʕ っ•ᴥ•ʔっ', 'Bear Hug', 'hug bear love'],
  ['(っ◔◡◔)っ ♥', 'Gift Of Love', 'love heart give'],
  ['(｡♥‿♥｡)', 'Heart Eyes', 'love heart eyes crush'],
  ['(⁄ ⁄•⁄ω⁄•⁄ ⁄)', 'Blushing', 'blush shy embarrassed'],
  ['(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ', 'Flower For You', 'flower gift sweet'],
  ['( ˘ ³˘)♥', 'Kissy', 'kiss mwah love'],
  ['(づ｡◕‿‿◕｡)づ', 'Gimme Hug', 'hug cuddle'],
  ['ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧', 'Thumbs Up Wink', 'ok wink yes approve'],
  ['(˶ˆᗜˆ˵)', 'Excited', 'happy excited yay'],
  ['٩(ˊᗜˋ*)و', 'Yay!', 'yay happy celebrate'],
  ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'Sparkle Toss', 'magic excited sparkle yay'],
  ['(｡•́︿•̀｡)', 'Pouty Sad', 'sad pout upset'],
  ['(ಥ﹏ಥ)', 'Sobbing', 'cry sob tears sad'],
  ['(╥﹏╥)', 'Teary', 'cry sad tears'],
  ['(っ˘̩╭╮˘̩)っ', 'Sad Hug', 'sad hug comfort'],
  ['(｡>﹏<｡)', 'Overwhelmed', 'nervous stress shy'],
  ['(¬‿¬ )', 'Smug', 'smug sassy hehe'],
  ['(¬_¬")', 'Side Eye', 'side eye suspicious judging'],
  ['(╬ Ò﹏Ó)', 'Angy', 'angry mad'],
  ['(ꈍᴗꈍ)', 'Content', 'content peaceful happy'],
  ['(－_－) zzZ', 'Sleepy', 'sleepy tired sleep zzz'],
  ['ᶻ 𝗓 𐰁 (˘ᵕ˘)', 'Dreaming', 'sleep dream goodnight'],
  ['(=^･ω･^=)', 'Kitty', 'cat meow'],
  ['ฅ^•ﻌ•^ฅ', 'Kitty Paws', 'cat paws meow'],
  ['/ᐠ｡ꞈ｡ᐟ\\', 'Cat Face', 'cat'],
  ['(•ө•)♡', 'Lil Birb', 'bird chick cute'],
  ['ᘛ⁐̤ᕐᐷ', 'Mousey', 'mouse rat'],
  ['¯\\_(ツ)_/¯', 'Shrug', 'shrug idk whatever'],
  ['(ノಠ益ಠ)ノ彡┻━┻', 'Table Flip', 'angry flip table rage'],
  ['┬─┬ノ( º _ ºノ)', 'Table Fix', 'calm sorry fix'],
  ['( •_•)>⌐■-■', 'Deal With It', 'cool sunglasses'],
  ['(☞ﾟヮﾟ)☞', 'Finger Guns', 'hey you point'],
  ['(⌐■_■)', 'Too Cool', 'cool sunglasses'],
  ['ヽ(°〇°)ﾉ', 'Shook', 'shocked omg'],
  ['(°ロ°) !', 'Gasp', 'shock surprised gasp'],
]

const COMBOS: T[] = [
  ['🥺👉👈', 'Fingers Touching', 'shy nervous please'],
  ['👁️👄👁️', 'It Is What It Is', 'stare shocked what'],
  ['🤨📸', 'Caught In 4K', 'sus caught photo'],
  ['💀💀💀', 'I’m Dead', 'dead lmao funny'],
  ['😭😭😭', 'Crying Rn', 'cry funny sad'],
  ['🫶🏻✨', 'Heart Hands', 'love support'],
  ['🎀🧸🍓', 'Coquette', 'pink cute aesthetic soft'],
  ['☁️🌙✨', 'Dreamy Night', 'night dream sleep'],
  ['🍵🐸', 'Tea Time', 'tea gossip none of my business'],
  ['🌸🐇🌸', 'Spring Bunny', 'bunny flower spring'],
  ['🐻💕🐻', 'Bear Besties', 'friends besties love'],
  ['🍰☕🧁', 'Cafe Date', 'cafe coffee sweet'],
  ['🌷💌🌷', 'Love Letter', 'love letter crush'],
  ['🦋✨🌿', 'Fairy Core', 'fairy nature aesthetic'],
  ['🍒🍒', 'Cherry Pair', 'cherry pair couple'],
  ['👉👈💕', 'Asking Out', 'crush ask shy'],
  ['🙈🙉🙊', 'No Evil', 'monkey shy oops'],
  ['💅✨', 'Slay', 'slay sassy nails'],
  ['🧠❌', 'No Thoughts', 'empty brain dumb'],
  ['🫠🫠', 'Melting', 'melt hot embarrassed'],
  ['🌈⭐🦄', 'Magical', 'unicorn rainbow magic'],
  ['🐱💤', 'Cat Nap', 'cat sleep nap'],
]

const AESTHETIC: T[] = [
  ['⋆˙⟡♡', 'Sparkle Heart', 'sparkle heart aesthetic'],
  ['˚₊‧꒰ა ☆ ໒꒱ ‧₊˚', 'Starry Frame', 'star frame aesthetic'],
  ['♡⸝⸝', 'Blush Heart', 'heart blush'],
  ['✿*:･ﾟ', 'Flower Sparkle', 'flower sparkle'],
  ['⋆｡‧˚ʚ🍓ɞ˚‧｡⋆', 'Strawberry Wings', 'strawberry cute frame'],
  ['ʚɞ', 'Lil Wings', 'wings butterfly'],
  ['❀', 'Blossom', 'flower'],
  ['☾⋆⁺₊✧', 'Moon Sparkle', 'moon night'],
  ['༘⋆🌷🫧💭₊˚ෆ', 'Soft Bubbles', 'soft dreamy'],
  ['─── ⋆⋅☆⋅⋆ ───', 'Star Divider', 'divider line bio'],
  ['꒰ ᐢ. .ᐢ ꒱', 'Bunny Bracket', 'bunny frame'],
  ['𖹭', 'Tiny Heart', 'heart small'],
  ['ᰔᩚ', 'Lil Butterfly', 'butterfly'],
  ['⊹ ࣪ ˖', 'Twinkle', 'sparkle twinkle'],
  ['✧･ﾟ: *✧･ﾟ:*', 'Glitter', 'glitter sparkle'],
  ['♡︎ ִ ࣪𖤐', 'Heart Star', 'heart star'],
  ['🎀 ˚୨୧⋆｡˚ ⋆', 'Bow Frame', 'bow coquette frame'],
  ['ദ്ദി ˉ͈̀꒳ˉ͈́ )✧', 'Smug Sparkle', 'smug sparkle'],
]

const NOW = Date.UTC(2026, 9, 31)
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function build(list: T[], category: CategoryId, baseUses: number): Emoji[] {
  return list.map(([text, name, tags], i) => ({
    id: `txt-${category}-${slug(name)}`,
    slug: slug(name),
    name,
    category,
    tags: [...tags.split(' '), 'text'],
    description: 'Copies as text, so it pastes like a normal keyboard emoji, anywhere.',
    author: 'larpmoji',
    uses: Math.round(baseUses * (1 - i / (list.length * 1.6))),
    createdAt: new Date(NOW).toISOString(),
    src: '',
    text,
  }))
}

export const TEXT_EMOJIS: Emoji[] = [...build(KAOMOJI, 'kaomoji', 90_000), ...build(COMBOS, 'combos', 85_000), ...build(AESTHETIC, 'aesthetic', 70_000)]
