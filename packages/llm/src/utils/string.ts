export default class StringUtils {
    static clean(text: string) {
        return text.split('#').shift().replace(/[^A-Za-z0-9\s]/g, '')
    }
}