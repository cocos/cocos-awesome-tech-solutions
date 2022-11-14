export type PoHeader = {
    /** This is the name and version of the package.  */
    'Project-Id-Version'?: string
    /** (非必须) po 创建日期 */
    'POT-Creation-Date'?: string
    /** (非必须) po 修改日期*/
    'PO-Revision-Date'?: string
    /** 上一个翻译人员 */
    'Last-Translator'?: string
    /** 翻译团队的名称或者邮箱 */
    'Language-Team'?: string
    /** (非必须)要使 MIME 文档符合 RFC 2045，需要此字段在顶级头中值为 1.0 */
    'MIME-Version'?: '1.0'
    /** 译文的语言 */
    Language: string
    /** Content-Type 定义了正文的类型，我们实际上是通过这个标识来知道正文内是什么类型的文件。比如：text/plain 表示的是无格式的文本正文，text/html 表示的 Html 文档，image/gif 表示的是 gif 格式的图片等等 */
    'Content-Type'?: 'text/plain; charset=UTF-8'
    /** 它表示了这个部分文档的编码方式。只有识别了这个说明，才能用正确的解码方式实现对其解码。 */
    'Content-Transfer-Encoding'?: '8bit'
    /** (非必须)复数的规则，*/
    'Plural-Forms'?: string
}

export type IPluralRulesJson = Record<Intl.BCP47LanguageTag, [Intl.LDMLPluralRule]>  

