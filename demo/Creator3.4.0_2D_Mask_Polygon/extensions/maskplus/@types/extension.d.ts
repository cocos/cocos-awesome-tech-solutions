declare namespace Editor {

    namespace Interface {
        // ---- Package ---- start
        interface PackageInfo {
            debug: boolean;
            enable: boolean;
            info: PackageJson;
            invalid: boolean;
            name: string;
            path: string;
            version: string;
        }

        interface PackageJson {
            name: string;
            version: string;

            title?: string;
            author?: string;
            debug?: boolean;
            description?: string;
            main?: string;
            editor?: string;
            panel?: any;
            contributions?: { [key: string]: any };
        }
        // ---- Package ---- end

        // ---- UI ---- start
        interface PanelInfo {
            template?: string;
            style?: string;
            listeners?: { [key: string]: () => {} };
            methods?: { [key: string]: Function };
            $?: { [key: string]: string };
            ready?(): void;
            update?(...args: any[]): void;
            beforeClose?(): void;
            close?(): void;
        }

        namespace UIKit {
            interface UIPanelInfo extends PanelInfo {
                // 向上触发事件
                dispath(eventName: string, ...arg: any): void;
            }

            interface EditorElementBase extends HTMLElement {
                value: any;
                dispath: (name: string, event: any) => void;
            }

        }
        // ---- UI ---- end
    }
}
