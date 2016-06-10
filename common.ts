interface Options {
	DefaultHeight: number
	FontSize: number
	TargetLanguage: string
}
const enum MessageType {
	PanelState,
	Translate
}
interface Message {
	Type: MessageType,
}
interface PanelStateMessage extends Message {
	Open: boolean
}
interface TranslateMessage extends Message {
	Text: string
}
const defaultOptions: Options = {
	DefaultHeight: 200,
	FontSize: 18,
	TargetLanguage: "en",
};
