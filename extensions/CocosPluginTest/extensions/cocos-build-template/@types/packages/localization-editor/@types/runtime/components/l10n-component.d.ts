/// <reference types="../../../@types/cc" />
import { Component, Label } from 'cc';
export default abstract class L10nComponent extends Component {
    protected constructor();
    get string(): string;
    label?: Label | null;
    protected onLoad(): void;
    protected start(): void;
    render(): void;
    preview(value: string): void;
}
