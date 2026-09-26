import type {ChartType, Plugin} from "chart.js";
import {Chart} from "chart.js/auto";

interface PluginHourlyGraphOptions {
    backgroundColor?: string;
    lineAverages?: number[];
    lineColor?: string;

}

interface PluginWeeklyGraphOptions {
    backgroundColor?: string;
    lineAverages?: number[];
    lineColor?: string;
}

declare module 'chart.js/auto' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        pluginHourlyGraph?: PluginHourlyGraphOptions;
        pluginWeeklyGraph?: PluginWeeklyGraphOptions;
    }
}

export const pluginHourlyGraph: Plugin<"bar"> = {
    id: `pluginHourlyGraph`,
    afterDraw: (chart: Chart) => {
        const {ctx} = chart;
        const options = chart.options.plugins?.pluginHourlyGraph;
        if (!options) return;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.backgroundColor || '#52148c';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
}

export const pluginWeeklyGraph: Plugin<"bar"> = {
    id: `pluginWeeklyGraph`,
    afterDraw: (chart: Chart) => {
        const {ctx} = chart;
        const options = chart.options.plugins?.pluginWeeklyGraph;
        if (!options) return;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.backgroundColor || '#52148c';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
}