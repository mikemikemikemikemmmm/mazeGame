export default class keyBoardManager {
    keyBoardStatus: any
    bindHandleUnPress: (e:KeyboardEvent) => void
    bindHandlePress: (e:KeyboardEvent) => void
    constructor() {
        this.keyBoardStatus = {
            'w': false,
            'a': false,
            's': false,
            'd': false
        }
        this.bindHandleUnPress = this.handleKeyBoardUnPress.bind(this)
        this.bindHandlePress = this.handleKeyBoardPress.bind(this)
    }
    handleKeyBoardPress(e: KeyboardEvent) {
        const { key } = e
        if (!(key in this.keyBoardStatus)) {
            return
        }
        //@ts-ignore
        this.keyBoardStatus[key] = true
    }
    handleKeyBoardUnPress(e: KeyboardEvent) {
        const { key } = e
        if (!(key in this.keyBoardStatus)) {
            return
        }
        //@ts-ignore
        this.keyBoardStatus[key] = false
    }
    initKeyListener() {
        document.addEventListener('keyup', this.bindHandleUnPress)
        document.addEventListener('keydown', this.bindHandlePress)
    }
    removeKeyListender() {
        document.removeEventListener('keyup', this.bindHandleUnPress)
        document.removeEventListener('keydown', this.bindHandlePress)
    }
}