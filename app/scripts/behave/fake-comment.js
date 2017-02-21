import * as Emoji from './emoji'

const HOLDER_SELECTOR = '.argh-fakeContent'
const HOLDER_OVERLAY_SELECTOR = '.argh-overlay'
const HOLDER_SHOW_BUTTON_SELECTOR = '.argh-overlay > a'
const HOLDER_EMOJI_SELECTOR = '.argh-emojis'
const COMMENT_HOLDER_CLASS = 'argh-fakeContent'
const COMMENT_HOLDER_ACTIVE_CLASS = 'argh-active'
const SHOW_OVERLAY_TIMEOUT = 300
const HIDE_OVERLAY_TIMEOUT = 300

const getFakeCommentHolderHTML = classModifier => `
    <span class="argh-fakeAvatar ${classModifier}"></span>
    <div class="argh-fakeHolder">
      <span class="argh-fakeName"></span>
      <span class="argh-fakeText"></span>
    </div>
    <div class="argh-emojis"></div>
    <div class="argh-overlay">
      <span class="argh-copy">Hidden by Behave!</span>
      <a href="#0" class="yt-uix-button yt-uix-button-default yt-uix-button-size-default"><span class="yt-uix-button-content">Show comment</span></a>
    </div>
`

const getFakeHolder = block => block ? block.querySelector(HOLDER_SELECTOR) : null

const createFakeCommentHolderElement = type => {
  if (type !== 'comment') return null
  const holder = document.createElement('div')
  holder.classList.add(COMMENT_HOLDER_CLASS)
  holder.innerHTML = getFakeCommentHolderHTML()
  return holder
}

const setCommentBlockPosition = block => {
  if (!block.style.position) {
    block.style.position = 'relative'
  }
}

const toggleOverlay = (block, holder) => {
  let mouseOver = false
  holder.onmouseover = () => {
    mouseOver = true
    setTimeout(() => {
      const unblocked = block.getAttribute('behave') === 'loaded' && block.getAttribute('behave-toxicity')

      if (mouseOver && unblocked) {
        holder.classList.add(COMMENT_HOLDER_ACTIVE_CLASS)
      }
    }, SHOW_OVERLAY_TIMEOUT)
  }
  holder.onmouseout = (e) => {
    mouseOver = false
    setTimeout(() => {
      const from = e.toElement || e.relatedTarget
      if (holder.contains(from) || from === holder) return
      holder.classList.remove(COMMENT_HOLDER_ACTIVE_CLASS)
    }, HIDE_OVERLAY_TIMEOUT)
  }
}

export const setBlockEmoji = (block, toxicity) => {
  const holder = getFakeHolder(block)
  if (holder) {
    const emojiBlock = holder.querySelector(HOLDER_EMOJI_SELECTOR)
    if (emojiBlock) {
      if (emojiBlock.getAttribute('behave-emojies')) return
      const additionalEmojies = Emoji.isExtremeEmoji(toxicity) ? '' : Emoji.getFewAdditionalEmojies(toxicity)
      emojiBlock.innerHTML = `${Emoji.getEmoji(toxicity)}${additionalEmojies}`
      emojiBlock.setAttribute('behave-emojies', 'true')
    }
  }
}

export const hideCommentBlock = (block, type) => {
  let holder = getFakeHolder(block)

  if (holder) {
    return holder.style.display = 'flex'
  }

  setCommentBlockPosition(block)

  holder = createFakeCommentHolderElement(type)

  block.insertBefore(holder, block.firstChild)

  const showButton = holder.querySelector(HOLDER_SHOW_BUTTON_SELECTOR)
  const overlay = holder.querySelector(HOLDER_OVERLAY_SELECTOR)

  if (overlay) toggleOverlay(block, holder)
  if (showButton) showButton.addEventListener('click', e => e.preventDefault() & showCommentBlock(block, holder))
}

export const showCommentBlock = (block, holder) => {
  holder = holder || getFakeHolder(block)
  if (!holder) return
  holder.style.display = 'none'
}
