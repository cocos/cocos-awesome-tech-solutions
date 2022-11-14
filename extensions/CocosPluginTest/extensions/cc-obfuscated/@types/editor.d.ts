/// <reference path='./electron.d.ts'/>

/// <reference types='node' />
/// <reference path='./extension.d.ts'/>

import * as NodeJSPath from 'path';
import { EventEmitter } from 'events';
import { FileFilter, BrowserWindow, OpenDialogReturnValue, SaveDialogReturnValue, MessageBoxReturnValue } from 'electron';

declare global {
    export namespace Editor {
        export namespace App {
            export const userAgent: string;
            /**
             * 是否是开发模式
             * Development mode
             */
            export const dev: boolean;
            /**
             * 编辑器版本号
             * Editor version
             */
            export const version: string;
            /**
             * 主目录
             * Home directory
             */
            export const home: string;
            /**
             * 编辑器程序文件夹
             * Program folder
             */
            export const path: string;
            /**
             * 获取当前编辑器的临时缓存目录
             * Temporary cache directory
             */
            export const temp: string;
            /**
             * 获取当前编辑器 icon 地址
             * Gets the icon address of the current editor
             */
            export const icon: string;
            /**
             * 获取当前编辑器使用的 url 地址
             * Gets the URL used by the current editor
             */
            export const urls: {
                manual: string;
                api: string;
                forum: string;
            };
            /**
             * 退出程序
             * Exit the program
             */
            export function quit(): void;
        }
        export namespace Clipboard {
            export type ICopyType = 'image' | 'text' | 'files' | string;
            /**
             * 获取剪贴板内容
             * @param type
             */
            export function read(type: ICopyType): any;
            /**
             * 写入剪贴板内容
             * @param type
             * @param value
             */
            export function write(type: 'image', value: string): boolean;
            export function write(type: 'text', value: string): boolean;
            export function write(type: 'files', value: FileList): boolean;
            export function write(type: string, value: any): boolean;

            /**
             * 判断当前剪贴板内是否是指定类型
             * @param type
             */
            export function has(type: ICopyType): boolean;
            /**
             * 清空剪贴板
             */
            export function clear(): void;
        }
        export namespace Dialog {
            
            export interface SaveDialogOptions {
                title?: string;
                path?: string;
                button?: string;
                filters?: FileFilter[];
            }
            export interface SelectDialogOptions {
                title?: string;
                path?: string;
                type?: 'directory' | 'file';
                button?: string;
                multi?: boolean;
                filters?: FileFilter[];
                extensions?: string;
            }
            export interface MessageDialogOptions {
                title?: string;
                detail?: string;
                default?: number;
                cancel?: number;
                checkboxLabel?: string;
                checkboxChecked?: boolean;
                buttons?: string[];
            }

            /**
             * 选择文件弹窗
             * Select the file popover
             *
             * @param options 选择弹窗参数 Select popover parameters
             * @param window 依附于哪个窗口（插件主进程才可使用） Which window it is attached to (only available to the plugin's main process)
             */
            export function select(options?: SelectDialogOptions, window?: BrowserWindow): Promise<OpenDialogReturnValue>;
            /**
             * 保存文件弹窗
             * Save the file popup
             *
             * @param options 保存文件窗口参数 Save the file window parameters
             * @param window 依附于哪个窗口（插件主进程才可使用） Which window it is attached to (only available to the plugin's main process)
             */
            export function save(options?: SaveDialogOptions, window?: BrowserWindow): Promise<SaveDialogReturnValue>;
            /**
             * 信息弹窗
             * Information popup window
             *
             * @param message 显示的消息 Displayed message
             * @param options 信息弹窗可选参数 Information popup optional parameter
             * @param window 依附于哪个窗口（插件主进程才可使用） Which window it is attached to (only available to the plugin's main process)
             */
            export function info(message: string, options?: MessageDialogOptions, window?: BrowserWindow): Promise<MessageBoxReturnValue>;
            /**
             * 警告弹窗
             * Warning popup
             *
             * @param message 警告信息 Warning message
             * @param options 警告弹窗可选参数 Warning popover optional parameter
             * @param window 依附于哪个窗口（插件主进程才可使用） Which window it is attached to (only available to the plugin's main process)
             */
            export function warn(message: string, options?: MessageDialogOptions, window?: BrowserWindow): Promise<MessageBoxReturnValue>;
            /**
             * 错误弹窗
             * Error popup window
             *
             * @param message 错误信息 The error message
             * @param options 错误弹窗可选参数 Error popover optional parameter
             * @param window 依附于哪个窗口（插件主进程才可使用） Which window it is attached to (only available to the plugin's main process)
             */
            export function error(message: string, options?: MessageDialogOptions, window?: BrowserWindow): Promise<MessageBoxReturnValue>;
        }
        export namespace EditMode {
            /**
             * 标记编辑器进入了一种编辑模式
             * The tag editor goes into an edit mode
             *
             * @param mode 编辑模式的名字 The name of the edit mode
             */
            export function enter(mode: string);
            /**
             * 当前所处的编辑模式
             * The current editing mode
             *
             */
            export function getMode(): string;
        }
        export namespace I18n {
            export type I18nMap = {
                [key: string]: I18nMap | string;
            };
            /**
             * 获取当前的语言 zh | en
             * Get the current language
             */
            export function getLanguage(): string;
            /**
             * 传入 key，翻译成当前语言
             * Passing in the key translates into the current language
             * 允许翻译变量 {a}，传入的第二个参数 obj 内定义 a
             * The translation variable {a} is allowed, and a is defined in the second argument passed in obj
             *
             * @param key 用于翻译的 key 值 The key value for translation
             * @param obj 翻译字段内如果有 {key} 等可以在这里传入替换字段 If you have {key} in the translation field, you can pass in the replacement field here
             */
            export function t(
                key: string,
                obj?: {
                    [key: string]: string;
                },
            ): string;

            /**
             * 选择一种翻译语言
             * Choose a translation language
             *
             * @param language 选择当前使用的语言 Select the language currently in use
             */
            export function select(language: string): void;
        }
        export namespace Layout {
            /**
             * 应用布局信息
             * Application layout information
             *
             * @param json 布局文件内容 Layout file content
             */
            export function apply(json: any);
            /**
             * 初始化布局系统
             * Initialize the layout system
             */
            export function init();
        }
        export namespace Logger {
            /**
             * 清空所有的日志
             * Clear all logs
             */
            export function clear(regexp?: string | RegExp): any;
            /**
             * 查询所有日志
             * Query all logs
             */
            export function query(): any;
        }
        export namespace Menu {
            export interface BaseMenuItem {
                template?: string;
                type?: string;
                label?: string;
                sublabel?: string;
                checked?: boolean;
                enabled?: boolean;
                icon?: string;
                accelerator?: string;
                order?: number;
                group?: string;
                message?: string;
                target?: string;
                params?: any[];
                click?: Function | null;
                role?: string;
                submenu?: MenuTemplateItem[];
            }
            export interface MainMenuItem extends BaseMenuItem {
                path: string;
            }
            export interface ContextMenuItem extends BaseMenuItem {
                accelerator?: string;
            }
            export type MenuTemplateItem = BaseMenuItem;
            export interface PopupOptions {
                x?: number;
                y?: number;
                menu: ContextMenuItem[];
            }
            /**
             * 右键弹窗
             * Right-click pop-up
             * 只有面板进程可以使用
             * Only panel processes can be used
             *
             * @param json
             */
            export function popup(json: PopupOptions): any;
        }
        export namespace Message {
            export interface MessageInfo {
                methods: string[];
                public?: boolean;
                description?: string;
                doc?: string;
                sync?: boolean;
            }

            export interface TableBase {
                [x: string]: any;
                params: any[];
            }
            /**
             * 发送一个消息，并等待返回
             * Send a message and wait for it to return
             *
             * @param name 目标插件的名字 The name of the target plug-in
             * @param message 触发消息的名字 The name of the trigger message
             * @param args 消息需要的参数 The parameters required for the message
             */
            export function request<J extends string, K extends keyof EditorMessageMaps[J]>(
                name: J,
                message: K,
                ...args: EditorMessageMaps[J][K]['params']
            ): Promise<EditorMessageMaps[J][K]['result']>;
            /**
             * 发送一个消息，没有返回
             * Send a message, no return
             *
             * @param name 目标插件的名字 The name of the target plug-in
             * @param message 触发消息的名字 The name of the trigger message
             * @param args 消息需要的参数 The parameters required for the message
             */
            export function send<M extends string, N extends keyof EditorMessageMaps[M]>(
                name: M,
                message: N,
                ...args: EditorMessageMaps[M][N]['params']
            ): void;
            /**
             * 广播一个消息
             * Broadcast a message
             *
             * @param message 消息的名字 Name of message
             * @param args 消息附加的参数 Parameter attached to the message
             */
            export function broadcast(message: string, ...args: any[]): void;
            /**
             * 新增一个广播消息监听器
             * Add a new broadcast message listener
             * 不监听的时候，需要主动取消监听
             * When not listening, you need to take the initiative to cancel listening
             *
             * @param message 消息名 Message name
             * @param func 处理函数 The processing function
             */
            export function addBroadcastListener(message: string, func: Function): any;
            /**
             * 新增一个广播消息监听器
             * Removes a broadcast message listener
             *
             * @param message 消息名 Message name
             * @param func 处理函数 The processing function
             */
            export function removeBroadcastListener(message: string, func: Function): any;
        }
        export namespace Network {
            /**
             * 查询当前电脑的 ip 列表
             * Query the IP list of the current computer
             */
            export function queryIPList(): string[];
            /**
             * 测试是否可以联通 passport.cocos.com 服务器
             * Test whether you can connect to the passport.cocos.com server
             */
            export function testConnectServer(): Promise<boolean>;
            /**
             * 检查一个端口是否被占用
             * Checks if a port is used
             *
             * @param port
             */
            export function portIsOccupied(port: number): Promise<boolean>;
            /**
             * 测试是否可以联通某一台主机
             * Test whether a host can be connected
             *
             * @param ip
             */
            export function testHost(ip: string): Promise<boolean>;
            /**
             * Get 方式请求某个服务器数据
             * GET requests data from a server
             *
             * @param url
             * @param data
             */
            export function get(
                url: string,
                data?: {
                    [index: string]: string | string[];
                },
            ): Promise<Buffer>;
            /**
             * Post 方式请求某个服务器数据
             * POST requests data from a server
             *
             * @param url
             * @param data
             */
            export function post(
                url: string,
                data?: {
                    [index: string]: string | number | string[];
                },
            ): Promise<Buffer>;
            /**
             * 获取某个可用的端口号
             * get the port that is free
             *
             * @param port
             */
            export function getFreePort(port: number): Promise<number>;
        }
        export namespace Package {
            // export module VERSION: string;
            export interface GetPackageOptions {
                name?: string;
                debug?: boolean;
                path?: string;
                enable?: boolean;
                invalid?: boolean;
            }
            export interface PackageJson {
                author?: string;
                debug?: boolean;
                description?: string;
                main?: string;
                menu?: any;
                name: string;
                version: string;
                windows: string;
                editor?: string;
                panel?: any;
            }
            export type PathType = 'home' | 'data' | 'temp';
            /**
             * 查询插件列表
             * Query Plug-in List
             *
             * @param options
             */
            export function getPackages(options?: GetPackageOptions): Editor.Interface.PackageInfo[];
            /**
             * 注册一个插件
             * Register a plug-in
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             *
             * @param path
             */
            export function register(path: string): any;
            /**
             * 反注册一个插件
             * Unregister a plug-in
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             *
             * @param path
             */
            export function unregister(path: string): any;
            /**
             * 启动一个插件
             * Enable a plug-in
             *
             * @param path
             */
            export function enable(path: string): any;
            /**
             * 关闭一个插件
             * Disable a plug-in
             *
             * @param path
             */
            export function disable(path: string, options: any): any;
            /**
             * 获取一个插件的几个预制目录地址
             * Gets several prefab directory addresses for a plug-in
             *
             * @param extensionName 扩展的名字 Name of the extension
             * @param type 地址类型（temp 临时目录，data 需要同步的数据目录,不传则返回现在打开的插件路径） Address type (temp temporary directory, data need to synchronize data directory, do not pass to return the current open plug-in path)
             */
            export function getPath(extensionName: string, type?: PathType): any;
        }
        export namespace Panel {
            /**
             * 打开一个面板
             * Open up a panel
             *
             * @param name
             * @param args
             */
            export function open(name: string, ...args: any[]): any;
            /**
             * 关闭一个面板
             * Close a panel
             *
             * @param name
             */
            export function close(name: string): any;
            /**
             * 将焦点传递给一个面板
             * Pass focus to a panel
             *
             * @param name
             */
            export function focus(name: string): any;
            /**
             * 检查面板是否已经打开
             * Check that the panel is open
             *
             * @param name
             */
            export function has(name: string): Promise<boolean>;
            /**
             * 查询当前窗口里某个面板里的元素列表
             * @param name
             * @param selector
             */
            export function querySelector(name: string, selector: string): Promise<any>;

            export type Selector<$> = { $: Record<keyof $, HTMLElement | null> };

            export type Options<S, M, U extends (...args: any[]) => void> = {
                /**
                 * @en Listening to panel events
                 * @zh 监听面板事件
                 */
                listeners?: {
                    /**
                     * @en Hooks triggered when the panel is displayed
                     * @zh 面板显示的时候触发的钩子
                     */
                    show?: () => any;
                    /**
                     * @en Hooks triggered when the panel is hidden
                     * @zh 面板隐藏的时候触发的钩子
                     */
                    hide?: () => any;
                };

                /**
                 * @en Template of the panel
                 * @zh 面板的内容
                 */
                template: string;
                /**
                 * @en Style of the panel
                 * @zh 面板上的样式
                 * */
                style?: string;
                /**
                 * @en Selector of the panel
                 * @zh 快捷选择器
                 */
                $?: S;
                /**
                 * @en Panel built-in function methods that can be called in Messages, Listeners, lifecycle functions
                 * @zh panel 内置的函数方法，可以在 messages、listeners、生命周期函数内调用
                 */
                methods?: M;
                /**
                 * @en Hooks triggered when the panel is update
                 * @zh 面板数据更新后触发的钩子函数
                 */
                update?: (...args: Parameters<U>) => void;
                /**
                 * @en Hooks triggered when the panel is ready
                 * @zh 面板启动后触发的钩子函数
                 */
                ready?: () => void;
                /**
                 * @en The function that will be triggered when the panel is ready to close, and will terminate the closing of the panel if it
                 * returns false
                 * @zh 面板准备关闭的时候会触发的函数，return false 的话，会终止关闭面板
                 * 生命周期函数，在 panel 准备关闭的时候触发
                 * 如果 return false，则会中断关闭流程,请谨慎使用，错误的判断会导致编辑器无法关闭。
                 */
                beforeClose?: () => Promise<boolean | void> | boolean | void;
                /**
                 * @en Hook functions after panel closure
                 * @zh 面板关闭后的钩子函数
                 */
                close?: () => void;
            } & ThisType<Selector<S> & M>; // merge them together

            export function define<U extends (...args: any[]) => void, Selector = Record<string, string>, M = Record<string, Function>>(
                options: Options<Selector, M, U>,
            ): any;
        }
        export namespace Profile {
            export type preferencesProtocol = 'default' | 'global' | 'local';
            export type projectProtocol = 'default' | 'project';
            export type tempProtocol = 'temp';
            export interface ProfileGetOptions {
                type: 'deep' | 'current' | 'inherit';
            }
            export interface ProfileObj {
                get: (key?: string, options?: ProfileGetOptions) => any;
                set: (key?: string, value?: any) => any;
                remove: (key: string) => void;
                save: () => void;
                clear: () => void;
                reset: () => void;
            }
            /**
             * 读取插件配置
             * Read the plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param type 配置的类型，选填 Type of configuration, optional(global,local,default)
             */
            export function getConfig(name: string, key?: string, type?: preferencesProtocol): Promise<any>;
            /**
             * 设置插件配置
             * Set the plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param value 配置的值 The value of the configuration
             * @param type 配置的类型，选填 Type of configuration, optional(global,local,default)
             */
            export function setConfig(name: string, key: string, value: any, type?: preferencesProtocol): Promise<void>;
            /**
             * 删除某个插件配置
             * Delete a plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param type 配置的类型，选填 Type of configuration, optional(global,local,default)
             */
            export function removeConfig(name: string, key: string, type?: preferencesProtocol): Promise<void>;
            /**
             * 读取插件内的项目配置
             * Read the project configuration within the plug-in
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param type 配置的类型，选填 Type of configuration, optional(project,default)
             */
            export function getProject(name: string, key?: string, type?: projectProtocol): Promise<any>;
            /**
             * 设置插件内的项目配置
             * Set the project configuration within the plug-in
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param value 配置的值 The value of the configuration
             * @param type 配置的类型，选填 Type of configuration, optional(project,default)
             */
            export function setProject(name: string, key: string, value: any, type?: projectProtocol): Promise<void>;
            /**
             * 删除插件内的项目配置
             * Delete the project configuration within the plug-in
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param type 配置的类型，选填 Type of configuration, optional(project,default)
             */
            export function removeProject(name: string, key: string, type?: projectProtocol): Promise<void>;
            /**
             * 读取插件配置
             * Read the plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             */
            export function getTemp(name: string, key?: string): Promise<any>;
            /**
             * 设置插件配置
             * Set the plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             * @param value 配置的值 The value of the configuration
             */
            export function setTemp(name: string, key: string, value: any): Promise<void>;
            /**
             * 删除某个插件配置
             * Delete a plug-in configuration
             *
             * @param name 插件名 The plugin name
             * @param key 配置路径 Configure path
             */
            export function removeTemp(name: string, key: string): Promise<void>;
            /**
             * 迁移插件某个版本的本地配置数据到编辑器最新版本
             * Migrate the local configuration data of a certain version of the plugin to the latest version of the editor
             *
             * @param pkgName
             * @param profileVersion
             * @param profileData
             */
            export function migrateLocal(pkgName: string, profileVersion: string, profileData: any): any;
            /**
             * 迁移插件某个版本的全局配置数据到编辑器最新版本
             * Migrate the global configuration data of a certain version of the plugin to the latest version of the editor
             *
             * @param pkgName
             * @param profileVersion
             * @param profileData
             */
            export function migrateGlobal(pkgName: string, profileVersion: string, profileData: any): any;
            /**
             * 迁移插件某个版本的项目配置数据到编辑器最新版本
             * Migrate the project configuration data of a certain version of the plugin to the latest version of the editor
             *
             * @param pkgName
             * @param profileVersion
             * @param profileData
             */
            export function migrateProject(pkgName: string, profileVersion: string, profileData: any): any;
        }
        export namespace Project {
            /**
             * 创建一个项目
             * Creating a project
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export function create(): any;
            /**
             * 打开一个项目
             * Open a project
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             *
             * @param path
             */
            export function open(path?: string): Promise<any>;
            /**
             * 添加一个项目
             * Add a project
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             *
             * @param path
             */
            export function add(path: string): any;
            /**
             * 当前项目路径
             * Current project path
             */
            export const path: string;
            /**
             * 当前项目 uuid
             * The current project UUID
             */
            export const uuid: string;
            /**
             * 当前项目名称(取自 package.json)
             * The current project name
             */
            export const name: string;
            /**
             * 当前项目临时文件夹
             * Temporary folder for current project
             */
            export const tmpDir: string;
            /**
             * 当前项目类型
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export const type: '2d' | '3d';
        }
        export namespace Selection {
            /**
             * 选中一个或者一组元素
             * Select one or a group of elements
             *
             * @param type
             * @param uuid
             */
            export function select(type: string, uuid: string | string[]): any;
            /**
             * 取消一个或者一组元素的选中状态
             * To deselect one or a group of elements
             *
             * @param type
             * @param uuid
             */
            export function unselect(type: string, uuid: string | string[]): any;
            /**
             * 清空一个类型的所有选中元素
             * Clears all selected elements of a type
             *
             * @param type
             */
            export function clear(type: string): any;
            /**
             * 更新当前选中的类型数据
             * Updates the currently selected type data
             *
             * @param type
             * @param uuids
             */
            export function update(type: string, uuids: string[]): any;
            /**
             * 悬停触碰了某个元素
             * Hover touches an element
             * 会发出 selection:hover 的广播消息
             * A broadcast message for selection:hover is issued
             *
             * @param type
             * @param uuid
             */
            export function hover(type: string, uuid?: string): any;
            /**
             * 获取最后选中的元素的类型
             * Gets the type of the last selected element
             */
            export function getLastSelectedType(): string;
            /**
             * 获取某个类型内，最后选中的元素
             * Gets the last selected element of a type
             *
             * @param type
             */
            export function getLastSelected(type: string): string;
            /**
             * 获取一个类型选中的所有元素数组
             * Gets an array of all elements selected for a type
             *
             * @param type
             */
            export function getSelected(type: string): string[];
        }
        export namespace Task {
            export interface NoticeOptions {
                title: string;
                message?: string;
                type?: 'error' | 'warn' | 'log' | 'success';
                source?: string;
                timeout?: number;
            }
            /**
             * 添加一个同步任务
             * Add a synchronous task
             * 会在主窗口显示一个遮罩层
             * A mask layer is displayed in the main window
             *
             * @param title 任务名字 The task name
             * @param describe 任务描述 Task description
             * @param message 任务内容 Content of the task
             */
            export function addSyncTask(title: string, describe?: string, message?: string): any;
            /**
             * 更新某一个同步任务显示的数据
             * Update the data displayed by a synchronous task
             *
             * @param title 任务名字 The task name
             * @param describe 任务描述 Task description
             * @param message 任务内容 Content of the task
             */
            export function updateSyncTask(title: string, describe?: string, message?: string): any;
            /**
             * 删除一个同步任务
             * Delete a synchronous task
             *
             * @param title 任务的名字 The name of the task
             */
            export function removeSyncTask(title: string): any;
            /**
             * 添加一个通知
             * Add a notification
             *
             * @param options 消息配置 Message configuration
             */
            export function addNotice(options: NoticeOptions): any;
            /**
             * 删除一个通知
             * Delete a notification
             *
             * @param id 通知 id Notification ID
             */
            export function removeNotice(id: number): any;
            /**
             * 修改 notice 自动移除的时间
             * Modify notice automatic removal time
             *
             * @param id 通知 id Notification ID
             * @param time 超时时间 timeout
             */
            export function changeNoticeTimeout(id: number, time: number): any;
            /**
             * 查询所有通知
             * Query all notifications
             */
            export function queryNotices(): any;
            /**
             * 页面进程立即同步一次主进程数据
             * The page process synchronizes the master process data immediately
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export function sync(): any;
        }
        export namespace Theme {
            /**
             * 获取所有主题的名字
             * Gets the names of all topics
             */
            export function getList(): any;
            /**
             * 使用某个皮肤
             * Use a certain skin
             *
             * @param name
             */
            export function use(name?: string): any;
        }
        export namespace UI {
            /**
             * 在当前页面上注册一个自定义节点
             * Registers a custom node on the current page
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             *
             * @param tagName 元素名字
             * @param element 元素的定义函数
             */
            export function register(tagName: string, element: any): void;
            export const Base: any;
            export const Button: any;
            export const Input: any;
            export const NumInput: any;
            export const Loading: any;
            export const Checkbox: any;
            export const Section: any;
            export const Select: any;
            export const Bit: any;
            export const Slider: any;
            export const ColorPicker: any;
            export const Color: any;
            export const DragItem: any;
            export const DragArea: any;
            export const DragObject: any;
            export const Prop: any;
            export const Tooltip: any;
            export const TextArea: any;
            export const Progress: any;
            export const Label: any;
            export const Code: any;
            export const Tab: any;
            export const Gradient: any;
            export const GradientPicker: any;
            export const Icon: any;
            export const File: any;
            export const Link: any;
            export const Image: any;
            export const QRCode: any;
            export const Markdown: any;
            export const Curve: any;
            export const CurveEditor: any;
            export const NodeGraph: any;
        }
        export namespace User {
            export interface UserData {
                session_id: string;
                session_key: string;
                cocos_uid: string;
                email: string;
                nickname: string;
            }
            /**
             * 跳过 User
             * Skip the User
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export function skip(): any;
            /**
             * 获取 user 数据
             * Get user data
             */
            export function getData(): Promise<UserData>;
            /**
             * 检查用户是否登陆
             * Check if the user is logged in
             */
            export function isLoggedIn(): Promise<boolean>;
            /**
             * 用户登陆
             * The user login
             * 失败会抛出异常
             * Failure throws an exception
             *
             * @param username
             * @param password
             */
            export function login(username: string, password: string): Promise<UserData>;
            /**
             * 退出登陆
             * Logged out
             * 失败会抛出异常
             * Failure throws an exception
             */
            export function logout(): void;
            /**
             * 获取用户 token
             * Get user token
             * 失败会抛出异常
             * Failure throws an exception
             */
            export function getUserToken(): Promise<string>;
            /**
             * 根据插件 id 返回 session code
             * Returns the session code based on the plug-in ID
             *
             * @param extensionId
             */
            export function getSessionCode(extensionId: number): Promise<string>;
            /**
             * 显示用户登陆遮罩层
             * Shows user login mask layer
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export function showMask(): void;
            /**
             * 隐藏用户登陆遮罩层
             * Hide user login mask layer
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             */
            export function hideMask(): void;
            /**
             * 监听事件
             * Listen for an event
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             * @param action
             * @param handle
             */
            export function on(action: string, handle: Function): any;
            /**
             * 监听一次事件
             * Listening for one event
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             * @param action
             * @param handle
             */
            export function once(action: string, handle: Function): any;
            /**
             * 取消已经监听的事件
             * Cancels the event you are listening for
             * 谨慎使用，之后会被移除
             * Use with caution and it will be removed later
             * @param action
             * @param handle
             */
            export function removeListener(action: string, handle: Function): any;
        }
        export namespace Utils {
            export namespace File {
                /**
                 * 初始化一个可用的文件名
                 * Initializes a available filename
                 * 返回可用名称的文件路径
                 * Returns the file path with the available name
                 *
                 * @param file 初始文件路径 Initial file path
                 */
                export function getName(file: string): string;
                interface UnzipOptions {
                    peel?: boolean;
                }
                /**
                 * 解压文件夹
                 * Unzip folder
                 *
                 * @param zip
                 * @param target
                 * @param options
                 */
                export function unzip(zip: string, target: string, options?: UnzipOptions): Promise<void>;
                /**
                 * 复制一个文件到另一个位置
                 * Copy a file to another location
                 *
                 * @param source
                 * @param target
                 */
                export function copy(source: string, target: string): void;
            }
            export namespace Path {
                /**
                 * 返回一个不含扩展名的文件名
                 * @param path
                 */
                export function basenameNoExt(path: string): string;
                /**
                 * 将 \ 统一换成 /
                 * @param path
                 */
                export function slash(path: string): string;
                /**
                 * 去除路径最后的斜杆，返回一个不带斜杆的路径
                 * @param path
                 */
                export function stripSep(path: string): string;
                /**
                 * 删除一个路径的扩展名
                 * @param path
                 */
                export function stripExt(path: string): string;
                /**
                 * 判断路径 pathA 是否包含 pathB
                 * pathA = foo/bar,         pathB = foo/bar/foobar, return true
                 * pathA = foo/bar,         pathB = foo/bar,        return true
                 * pathA = foo/bar/foobar,  pathB = foo/bar,        return false
                 * pathA = foo/bar/foobar,  pathB = foobar/bar/foo, return false
                 * @param pathA
                 * @param pathB
                 */
                export function contains(pathA: string, pathB: string): boolean;
                /**
                 * 格式化路径
                 * 如果是 Windows 平台，需要将盘符转成小写进行判断
                 * @param path
                 */
                export function normalize(path: string): string;
                export const join: typeof NodeJSPath.join;
                export const resolve: typeof NodeJSPath.resolve;
                export const isAbsolute: typeof NodeJSPath.isAbsolute;
                export const relative: typeof NodeJSPath.relative;
                export const dirname: typeof NodeJSPath.dirname;
                export const basename: typeof NodeJSPath.basename;
                export const extname: typeof NodeJSPath.extname;
                export const sep: '\\' | '/';
                export const delimiter: ';' | ':';
                export const parse: typeof NodeJSPath.parse;
                export const format: typeof NodeJSPath.format;
            }
            export namespace Math {
                /**
                 * 取给定边界范围的值
                 * Take the value of the given boundary range
                 * @param {number} val
                 * @param {number} min
                 * @param {number} max
                 */
                export function clamp(val: number, min: number, max: number): number;
                /**
                 * @function clamp01
                 * @param {number} val
                 * @returns {number}
                 *
                 * Clamps a value between 0 and 1.
                 */
                export function clamp01(val: number): number;
                /**
                 * 加法函数
                 * 入参：函数内部转化时会先转字符串再转数值，因而传入字符串或 number 均可
                 * 返回值：arg1 加上 arg2 的精确结果
                 * @param {number|string} arg1
                 * @param {number|string} arg2
                 */
                export function add(arg1: number | string, arg2: number | string): number;
                /**
                 * 减法函数
                 * 入参：函数内部转化时会先转字符串再转数值，因而传入字符串或number均可
                 * 返回值：arg1 减 arg2的精确结果
                 * @param {number|string} arg1
                 * @param {number|string} arg2
                 */
                export function sub(arg1: number | string, arg2: number | string): number;
                /**
                 * 保留小数点
                 * @param val
                 * @param num
                 */
                export function toFixed(val: number, num: number): number;
            }
            export namespace Parse {
                interface WhenParam {
                    PanelName?: string;
                    EditMode?: string;
                    ProjectType?: string;
                }
                /**
                 * 解析 when 参数
                 * when 的格式：
                 *     PanelName === '' && EditMode === ''
                 * 整理后的数据格式：
                 *     {
                 *         PanelName: '',
                 *         EditMode: '',
                 *     }
                 */
                export function when(when: string): WhenParam;
                /**
                 * 判断一个 when 数据是否符合当前条件
                 * @param when
                 */
                export function checkWhen(when: string): boolean;
            }
            export namespace Url {
                /**
                 * 快捷获取文档路径
                 * @param relativeUrl
                 * @param type
                 */
                export function getDocUrl(relativeUrl: string, type?: 'manual' | 'api'): string;
            }

            export namespace UUID {
                /**
                 * 压缩 UUID
                 * compress UUID
                 * @param uuid
                 * @param min
                 */
                export function compressUUID(uuid: string, min: boolean): string;
                /**
                 * 解压 UUID
                 * decompress the UUID
                 * @param str
                 */
                export function decompressUUID(str: string): string;
                /**
                 * 检查输入字符串是否是 UUID
                 * Check whether the input string is a UUID
                 * @param str
                 */
                export function isUUID(str: string): string;
                /**
                 * 生成一个新的 uuid
                 */
                export function generate(): string;
            }
        }
        export namespace Module {
            /**
             * 导入一个项目模块。
             * @param url 项目模块的 Database URL。
             * @experimental 实验性质。
             */
            export function importProjectModule(url: string): Promise<unknown>;
        }
    }
}
