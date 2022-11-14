import L10nComponent from './l10n-component';
export default class L10nLabel extends L10nComponent {
    _key: string;
    set key(value: string);
    get key(): string;
    _count: number;
    set count(value: number);
    get count(): number;
    onLoad(): void;
    render(): void;
}
